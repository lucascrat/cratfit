import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Geolocation } from '@capacitor/geolocation';
import { calculateBMR, getMETsFromSpeed, calculateCaloriesWithBMR } from '../utils/fitnessUtils';
import { useAuthStore } from './authStore';


// Helper Functions
const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

export const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    // If hours is 0, arguably could show MM:SS, but format usually implies full timer
    // Let's stick to HH:MM:SS as per request or UI needs
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatDistance = (distance) => {
    if (!distance) return '0.00';
    return distance.toFixed(2);
};

export const calculateCalories = (distance, duration) => {
    // Legacy fallback
    if (!distance) return 0;
    return Math.round(distance * 65);
};

const calculateAveragePace = (timeSeconds, distanceKm) => {
    if (!distanceKm || distanceKm <= 0.001) return "--:--"; // Avoid division by zero-ish
    const paceSeconds = timeSeconds / distanceKm;

    if (paceSeconds > 3600) return "--:--"; // More than 1 hour per km is probably idle

    const minutes = Math.floor(paceSeconds / 60);
    const seconds = Math.floor(paceSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatPaceFromSpeed = (speedMs) => {
    if (!speedMs || speedMs < 0.5) return "--:--"; // < 1.8km/h treated as stopped
    const speedKmh = speedMs * 3.6;
    if (speedKmh < 1.0) return "--:--";

    const paceSeconds = 3600 / speedKmh;
    if (paceSeconds > 3600) return "--:--"; // > 60m/km

    const minutes = Math.floor(paceSeconds / 60);
    const seconds = Math.floor(paceSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const splitSumDuration = (splits) => {
    if (!splits) return 0;
    return splits.reduce((acc, split) => acc + (split.duration || 0), 0);
};


export const useActivityStore = create(
    persist(
        (set, get) => ({
            // Initial State
            currentActivity: null,
            isTracking: false,
            isPaused: false,
            startTime: null,
            lastUpdateTime: null,
            totalPausedTime: 0,
            pauseStartTime: null,
            elapsedTime: 0,
            watchId: null,

            positions: [],
            distance: 0,
            currentPace: null,
            averagePace: null,
            currentSplitPace: null,
            splits: [],
            lastSplitDistance: 0,
            currentSpeed: 0,
            smoothedSpeed: 0,
            calories: 0,
            userBMR: 0, // Store BMR for session
            heartRate: null,
            elevation: 0,
            currentPosition: null,
            gpsAccuracy: 0,
            lastLocationTime: null,

            trainingMode: 'free',
            targetPace: null,
            targetDistance: null,
            targetTime: null,
            intervals: [],

            // Wake Lock — prevents browser/OS from suspending JS when screen is off
            _wakeLock: null,
            _fallbackIntervalId: null,

            acquireWakeLock: async () => {
                try {
                    if ('wakeLock' in navigator) {
                        const lock = await navigator.wakeLock.request('screen');
                        set({ _wakeLock: lock });
                        // Re-acquire if released (e.g. user switched tabs)
                        lock.addEventListener('release', () => {
                            console.log('[WakeLock] Released — re-acquiring...');
                            if (get().isTracking) get().acquireWakeLock();
                        });
                        console.log('[WakeLock] Acquired');
                    }
                } catch (e) {
                    console.warn('[WakeLock] Not available:', e.message);
                }
            },

            releaseWakeLock: () => {
                const lock = get()._wakeLock;
                if (lock) { lock.release().catch(() => {}); set({ _wakeLock: null }); }
            },

            // Re-acquire wake lock when page becomes visible again
            _handleVisibilityChange: () => {
                if (document.visibilityState === 'visible' && get().isTracking) {
                    console.log('[GPS] Page visible again — forcing location update');
                    get().acquireWakeLock();
                    get().forceLocationUpdate();
                    // Restart watcher if it died
                    if (get().watchId === null) {
                        console.log('[GPS] Watcher was dead — restarting');
                        get().startGpsWatcher();
                    }
                }
            },

            startGpsWatcher: async () => {
                try {
                    // --- Request permissions FIRST (required on Capacitor/Android/iOS) ---
                    try {
                        const perms = await Geolocation.checkPermissions();
                        if (perms.location !== 'granted' && perms.coarseLocation !== 'granted') {
                            const req = await Geolocation.requestPermissions();
                            if (req.location !== 'granted' && req.coarseLocation !== 'granted') {
                                console.warn('[GPS] Location permission denied');
                                return;
                            }
                        }
                    } catch (permErr) {
                        // On web, checkPermissions may not exist — browser handles it
                        console.log('[GPS] Permission check not available (web?):', permErr.message);
                    }

                    const currentWatchId = get().watchId;
                    if (currentWatchId !== null) {
                        try { await Geolocation.clearWatch({ id: currentWatchId }); } catch (_) {}
                    }

                    const watchId = await Geolocation.watchPosition(
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,    // 10s timeout — more tolerant for weak signal areas
                            maximumAge: 3000   // Accept positions up to 3s old (helps tunnels/buildings)
                        },
                        (position, err) => {
                            if (err) {
                                console.warn('[GPS] Watch error:', err?.message || err);
                                // If watcher fails, try to restart after 2s
                                if (get().isTracking) {
                                    setTimeout(() => {
                                        if (get().isTracking && get().watchId !== null) {
                                            get().forceLocationUpdate();
                                        }
                                    }, 2000);
                                }
                                return;
                            }
                            if (position) {
                                get().addPosition(position);
                            }
                        }
                    );
                    set({ watchId });
                    console.log('[GPS] Watcher started, id:', watchId);

                    // Listen for page visibility changes
                    document.removeEventListener('visibilitychange', get()._handleVisibilityChange);
                    document.addEventListener('visibilitychange', get()._handleVisibilityChange);

                } catch (error) {
                    console.error('[GPS] Watcher Error:', error);
                    // Fallback: use interval-based getCurrentPosition
                    console.log('[GPS] Falling back to interval-based tracking');
                    get()._startFallbackInterval();
                }
            },

            stopGpsWatcher: async () => {
                const watchId = get().watchId;
                if (watchId !== null) {
                    try {
                        await Geolocation.clearWatch({ id: watchId });
                    } catch (error) {
                        console.error('[GPS] Stop Error:', error);
                    }
                    set({ watchId: null });
                }
                get()._stopFallbackInterval();
                document.removeEventListener('visibilitychange', get()._handleVisibilityChange);
                get().releaseWakeLock();
            },

            // Fallback: interval-based getCurrentPosition when watchPosition fails
            _startFallbackInterval: () => {
                if (get()._fallbackIntervalId) return;
                console.log('[GPS] Starting fallback interval (every 3s)');
                const id = setInterval(() => {
                    if (get().isTracking && !get().isPaused) {
                        get().forceLocationUpdate();
                    }
                }, 3000);
                set({ _fallbackIntervalId: id });
            },

            _stopFallbackInterval: () => {
                const id = get()._fallbackIntervalId;
                if (id) {
                    clearInterval(id);
                    set({ _fallbackIntervalId: null });
                }
            },

            forceLocationUpdate: async () => {
                try {
                    const position = await Geolocation.getCurrentPosition({
                        enableHighAccuracy: true,
                        timeout: 8000,
                        maximumAge: 5000   // Accept slightly stale position when signal is weak
                    });
                    if (position) {
                        get().addPosition(position);
                    }
                } catch (e) {
                    // If GPS completely unavailable, interpolate from last known speed
                    const state = get();
                    if (state.isTracking && !state.isPaused && state.positions.length > 0 && state.smoothedSpeed > 0.5) {
                        const lastPos = state.positions[state.positions.length - 1];
                        const timeDiff = (Date.now() - lastPos.timestamp) / 1000;
                        if (timeDiff > 5 && timeDiff < 120) {
                            // Interpolate: estimate distance moved using last speed and heading
                            const distKm = (state.smoothedSpeed * timeDiff) / 1000;
                            if (distKm < 0.5 && distKm > 0.001) {
                                const heading = lastPos.heading || 0;
                                const headRad = (heading * Math.PI) / 180;
                                const latOffset = (distKm / 111.32) * Math.cos(headRad);
                                const lngOffset = (distKm / (111.32 * Math.cos(lastPos.lat * Math.PI / 180))) * Math.sin(headRad);

                                const syntheticPosition = {
                                    coords: {
                                        latitude: lastPos.lat + latOffset,
                                        longitude: lastPos.lng + lngOffset,
                                        accuracy: 100,
                                        altitude: lastPos.altitude,
                                        speed: state.smoothedSpeed,
                                        heading: heading,
                                    },
                                    timestamp: Date.now(),
                                };
                                get().addPosition(syntheticPosition);
                                console.log(`[GPS] Interpolated ${(distKm * 1000).toFixed(0)}m over ${timeDiff.toFixed(0)}s gap`);
                            }
                        }
                    }
                }
            },

            startActivity: async (mode = 'free', options = {}) => {
                try {
                    // Calculate BMR — safe defaults if profile is missing
                    let bmr = 1700; // safe default
                    try {
                        const profile = useAuthStore.getState()?.profile || {};
                        const weight = Number(profile.weight_kg || profile.weight) || 70;
                        const height = Number(profile.height_cm || profile.height) || 175;
                        const age = Number(profile.age) || 30;
                        const gender = profile.gender || 'male';
                        bmr = calculateBMR(weight, height, age, gender);
                    } catch (e) {
                        console.warn('[Activity] Could not calculate BMR, using default:', e.message);
                    }

                    // Acquire wake lock to prevent browser/OS suspension during run
                    try { await get().acquireWakeLock(); } catch (_) {}

                    set({
                        positions: [],
                        distance: 0,
                        currentPace: null,
                        averagePace: null,
                        currentSplitPace: null,
                        splits: [],
                        lastSplitDistance: 0,
                        calories: 0,
                        userBMR: bmr,
                        elevation: 0,
                    });

                    // Start GPS — non-blocking, activity starts even if GPS fails
                    if (get().watchId === null) {
                        get().startGpsWatcher().catch(e => {
                            console.warn('[Activity] GPS watcher failed to start:', e.message);
                        });
                    }

                    const now = Date.now();
                    set({
                        isTracking: true,
                        isPaused: false,
                        startTime: now,
                        lastUpdateTime: now,
                        totalPausedTime: 0,
                        pauseStartTime: null,
                        elapsedTime: 0,
                        trainingMode: mode,
                        targetPace: options.targetPace || null,
                        targetDistance: options.targetDistance || null,
                        targetTime: options.targetTime || null,
                        intervals: options.intervals || [],
                        currentActivity: {
                            type: options.type || 'running',
                            title: options.title || 'Corrida',
                            startTime: new Date().toISOString(),
                        },
                    });
                    console.log('[Activity] Started successfully, mode:', mode);
                } catch (error) {
                    console.error('[Activity] Failed to start:', error);
                    // Even if something failed, ensure isTracking is set so user can still see the run screen
                    set({ isTracking: true, startTime: Date.now(), elapsedTime: 0 });
                }
            },

            pauseActivity: () => {
                // ... (same implementation)
                const state = get();
                if (!state.isTracking || state.isPaused) return;
                set({ isPaused: true, pauseStartTime: Date.now() });
            },

            resumeActivity: () => {
                // ... (same implementation)
                const state = get();
                if (!state.isPaused || !state.pauseStartTime) return;
                const pausedDuration = Date.now() - state.pauseStartTime;
                set({
                    isPaused: false,
                    pauseStartTime: null,
                    totalPausedTime: state.totalPausedTime + pausedDuration
                });
            },

            stopActivity: () => {
                const state = get();

                // Clean up GPS watcher
                if (state.watchId !== null) {
                    try { Geolocation.clearWatch({ id: state.watchId }); } catch (_) {}
                }

                // Clean up fallback interval, wake lock, visibility listener
                get()._stopFallbackInterval();
                document.removeEventListener('visibilitychange', get()._handleVisibilityChange);
                get().releaseWakeLock();

                const finalActivity = {
                    ...state.currentActivity,
                    endTime: new Date().toISOString(),
                    duration: state.elapsedTime,
                    distance: state.distance,
                    averagePace: state.averagePace,
                    calories: state.calories,
                    elevation: state.elevation,
                    route: state.positions,
                    splits: state.splits,
                };

                set({
                    currentActivity: null,
                    isTracking: false,
                    isPaused: false,
                    watchId: null,
                });

                return finalActivity;
            },

            refineActivityDataWithGoogle: async () => {
                return get().elevation;
            },

            addPosition: (position) => {
                const state = get();
                const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;

                const newPoint = {
                    lat: latitude,
                    lng: longitude,
                    accuracy: accuracy,
                    altitude: altitude,
                    speed: speed,
                    heading: heading,
                    timestamp: position.timestamp
                };

                set({
                    currentPosition: newPoint,
                    gpsAccuracy: accuracy,
                    lastLocationTime: position.timestamp
                });

                if (state.isPaused || !state.isTracking) return;

                // Professional GPS Filtering - IMPROVED
                // Ignore points with bad accuracy (> 50m) unless it's the first point
                // Increased from 40m to 50m to reduce data loss
                if (accuracy > 50 && state.positions.length > 0) return;

                let addedDistance = 0;
                let shouldAddPoint = false;
                let instantSpeed = 0; // m/s
                let timeDiff = 0; // seconds

                if (state.positions.length === 0) {
                    // First point - be more lenient
                    if (accuracy <= 80) {
                        shouldAddPoint = true;
                    }
                } else {
                    const lastPos = state.positions[state.positions.length - 1];
                    const rawDist = calculateDistance(
                        lastPos.lat, lastPos.lng,
                        newPoint.lat, newPoint.lng
                    );

                    timeDiff = (newPoint.timestamp - lastPos.timestamp) / 1000; // seconds

                    if (timeDiff <= 0) return;

                    // Speed / Teleport Filter
                    // Max running speed ~36km/h (10m/s). Allow up to 45km/h (12.5m/s) for safety.
                    instantSpeed = (rawDist * 1000) / timeDiff; // m/s

                    // IMPROVED: Handle GPS gaps with interpolation
                    // If there's a significant time gap (>10s) and we have valid speed data, interpolate
                    if (timeDiff > 10 && state.smoothedSpeed > 0.5 && rawDist < 0.001) {
                        // Estimate distance based on last known speed
                        const estimatedDist = (state.smoothedSpeed * timeDiff) / 1000; // km
                        if (estimatedDist < 0.5) { // Max 500m interpolation for safety
                            addedDistance = estimatedDist;
                            shouldAddPoint = true;
                            console.log(`[GPS] Interpolated ${estimatedDist.toFixed(3)}km over ${timeDiff.toFixed(1)}s gap`);
                        }
                    } else if (instantSpeed < 12.5) {
                        // IMPROVED: Reduced minimum movement from 3m to 1m
                        // This captures more accurate distance, especially at slower paces
                        if (rawDist > 0.001 || (newPoint.speed && newPoint.speed > 0.5)) {
                            addedDistance = rawDist;
                            shouldAddPoint = true;
                        }
                    }
                }

                if (!shouldAddPoint) return;

                const newDistance = state.distance + addedDistance;
                const newPositions = [...state.positions, newPoint];

                // --- Professional Pace Calculation (EMA) ---
                let sourceSpeed = instantSpeed;
                // Trust GPS chip speed if high accuracy and valid
                if (newPoint.speed && newPoint.speed >= 0 && accuracy < 20) {
                    sourceSpeed = newPoint.speed;
                }

                // Alpha 0.2 provides good balance of smoothness vs responsiveness (~5s lag)
                const alpha = 0.2;
                const oldSmoothed = state.smoothedSpeed || 0;
                const newSmoothedSpeed = (sourceSpeed * alpha) + (oldSmoothed * (1 - alpha));

                let currentPace = formatPaceFromSpeed(newSmoothedSpeed);

                // Average Pace
                const averagePace = state.elapsedTime > 5 && newDistance > 0.01
                    ? calculateAveragePace(state.elapsedTime, newDistance)
                    : state.averagePace;

                // Splits Logic
                let splits = [...(state.splits || [])];
                let lastSplitDistance = state.lastSplitDistance;
                const currentKm = Math.floor(newDistance);
                if (currentKm > splits.length) {
                    const splitDuration = state.elapsedTime - splitSumDuration(splits);
                    splits.push({
                        km: currentKm,
                        duration: splitDuration,
                        pace: calculateAveragePace(splitDuration, 1),
                        timestamp: Date.now()
                    });
                    lastSplitDistance = currentKm;
                }

                // Current Split Pace - Average over current split distance
                let currentSplitPace = state.currentSplitPace;
                const distIntoSplit = newDistance - lastSplitDistance;
                const timeIntoSplit = state.elapsedTime - splitSumDuration(splits);
                if (distIntoSplit > 0.1) {
                    currentSplitPace = calculateAveragePace(timeIntoSplit, distIntoSplit);
                }

                // CALORIES CALCULATION (BMR Based)
                let newCalories = state.calories;
                if (timeDiff > 0 && state.userBMR > 0) {
                    // Current speed in km/h
                    const speedKmh = newSmoothedSpeed * 3.6;
                    const activityType = state.currentActivity?.type || 'running';

                    // Get METs for this instant
                    const mets = getMETsFromSpeed(speedKmh, activityType);

                    // Calculate calories for this short segment
                    const segmentCalories = calculateCaloriesWithBMR(state.userBMR, mets, timeDiff);

                    if (segmentCalories > 0) {
                        newCalories += segmentCalories;
                    }
                } else if (state.distance > 0) {
                    // Fallback if no BMR or start (approx 65/km) - only for init or error
                    // But we prefer to keep existing logic if diff method fails
                    if (newCalories === 0) {
                        newCalories = Math.round(newDistance * 65);
                    }
                }

                let newElevation = state.elevation;
                if (state.positions.length > 0 && newPoint.altitude) {
                    const lastAlt = state.positions[state.positions.length - 1].altitude;
                    const diff = newPoint.altitude - lastAlt;
                    if (diff > 0.8 && diff < 30) {
                        newElevation += diff;
                    }
                }

                set({
                    positions: newPositions,
                    distance: newDistance,
                    currentPace,
                    averagePace,
                    currentSplitPace,
                    splits,
                    lastSplitDistance,
                    currentSpeed: newSmoothedSpeed * 3.6,
                    smoothedSpeed: newSmoothedSpeed,
                    calories: newCalories,
                    elevation: newElevation,
                    gpsAccuracy: newPoint.accuracy,
                    lastLocationTime: newPoint.timestamp
                });
            },

            updateElapsedTime: () => {
                const state = get();
                if (!state.isTracking || state.isPaused) return;

                const now = Date.now();
                const elapsed = Math.floor((now - state.startTime - state.totalPausedTime) / 1000);
                const newElapsedTime = Math.max(0, elapsed);

                // Pace Decay (Signal Loss or Stopping)
                let newCurrentPace = state.currentPace;
                let newSmoothedSpeed = state.smoothedSpeed;

                // If no GPS update for 5 seconds, assume stopping/slowing
                if (state.lastLocationTime && (now - state.lastLocationTime > 5000)) {
                    // Decay speed exponentialy to 0
                    newSmoothedSpeed = newSmoothedSpeed * 0.9;
                    if (newSmoothedSpeed < 0.5) newSmoothedSpeed = 0;
                    newCurrentPace = formatPaceFromSpeed(newSmoothedSpeed);
                }

                let newAveragePace = state.averagePace;
                if (newElapsedTime > 5 && state.distance > 0.001) {
                    newAveragePace = calculateAveragePace(newElapsedTime, state.distance);
                }

                set({
                    elapsedTime: newElapsedTime,
                    averagePace: newAveragePace,
                    currentPace: newCurrentPace,
                    smoothedSpeed: newSmoothedSpeed
                });
            },

            resetActivity: () => {
                const state = get();
                if (state.watchId !== null) {
                    try { Geolocation.clearWatch({ id: state.watchId }); } catch (_) {}
                }
                get()._stopFallbackInterval();
                document.removeEventListener('visibilitychange', get()._handleVisibilityChange);
                get().releaseWakeLock();

                set({
                    currentActivity: null,
                    isTracking: false,
                    isPaused: false,
                    watchId: null,
                    startTime: null,
                    elapsedTime: 0,
                    positions: [],
                    distance: 0,
                    currentPace: null,
                    averagePace: null,
                    splits: [],
                    lastSplitDistance: 0,
                    calories: 0,
                    userBMR: 0,
                    elevation: 0,
                });
            }
        }),
        {
            name: 'activity-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Persist everything except watchId and maybe heartRate if it's transient
                currentActivity: state.currentActivity,
                isTracking: state.isTracking,
                isPaused: state.isPaused,
                startTime: state.startTime,
                lastUpdateTime: state.lastUpdateTime,
                totalPausedTime: state.totalPausedTime,
                pauseStartTime: state.pauseStartTime,
                elapsedTime: state.elapsedTime,
                positions: state.positions,
                distance: state.distance,
                currentPace: state.currentPace,
                averagePace: state.averagePace,
                splits: state.splits,
                calories: state.calories,
                userBMR: state.userBMR, // Persist BMR
                trainingMode: state.trainingMode,
            }),
        }
    )
);
