import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivityStore, formatTime, formatDistance, calculateCalories } from '../../store/activityStore';
import LiveMap from '../../components/maps/LiveMap';
import { ROUTES } from '../../constants';

// Simple Error Boundary Component for debugging
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ActiveRun Error Boundary caught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-red-900 text-white p-4">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                    <p className="font-mono text-sm bg-black/30 p-2 rounded mb-4">
                        {this.state.error?.toString()}
                    </p>
                    <button
                        className="bg-white text-red-900 px-4 py-2 rounded font-bold"
                        onClick={() => window.location.reload()}
                    >
                        Reload
                    </button>
                    <button
                        className="mt-4 bg-transparent border border-white text-white px-4 py-2 rounded"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const ActiveRunContent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Activity store selectors
    const startActivity = useActivityStore(state => state.startActivity);
    const pauseActivity = useActivityStore(state => state.pauseActivity);
    const resumeActivity = useActivityStore(state => state.resumeActivity);
    const stopActivity = useActivityStore(state => state.stopActivity);
    const startGpsWatcher = useActivityStore(state => state.startGpsWatcher);
    const isPaused = useActivityStore(state => state.isPaused);
    const elapsedTime = useActivityStore(state => state.elapsedTime);
    const distance = useActivityStore(state => state.distance);
    const currentPace = useActivityStore(state => state.currentPace);
    const averagePace = useActivityStore(state => state.averagePace);
    const positions = useActivityStore(state => state.positions);
    const storeCalories = useActivityStore(state => state.calories);
    const elevation = useActivityStore(state => state.elevation);
    const storeSplits = useActivityStore(state => state.splits || []); // Safe default
    const gpsAccuracy = useActivityStore(state => state.gpsAccuracy);
    const isTracking = useActivityStore(state => state.isTracking);

    const [isInitialized, setIsInitialized] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log('[ActiveRun] Mounted');
        console.log('[ActiveRun] State:', { isTracking, isPaused, elapsedTime, distance, splits: storeSplits });
    }, [isTracking, isPaused, elapsedTime, distance, storeSplits]);

    // Use store calories or calculate if not available
    const calories = storeCalories || calculateCalories(distance || 0, elapsedTime || 0);

    // Safe values for rendering
    const safeDistance = typeof distance === 'number' ? distance : 0;
    const safePositions = Array.isArray(positions) ? positions : [];
    const currentPosition = safePositions.length > 0 ? safePositions[safePositions.length - 1] : null;

    // Start activity on mount or resume
    useEffect(() => {
        const initActivity = async () => {
            try {
                if (isTracking) {
                    console.log('[ActiveRun] Resuming existing activity...');
                    // Ensure GPS watcher is active (it might be lost on reload)
                    await startGpsWatcher();
                } else {
                    const mode = location.state?.mode || 'free';
                    console.log('[ActiveRun] Starting new activity with mode:', mode);
                    await startActivity(mode);
                }
            } catch (error) {
                console.error('[ActiveRun] Error initializing activity:', error);
            }
        };

        // Only run if not already initialized to prevent double-starts in strict mode
        // But here we rely on isTracking check.
        initActivity();
    }, [location.state]);

    // Timer interval implementation
    useEffect(() => {
        console.log('[ActiveRun] Starting timer interval');
        let tick = 0;
        const interval = setInterval(() => {
            const state = useActivityStore.getState();
            // Check if tracking is actually active to avoid error logs or invalid updates
            if (state.isTracking && !state.isPaused) {
                state.updateElapsedTime();

                tick++;
                // Heartbeat: Force GPS read every 5 seconds as backup
                if (tick % 5 === 0) {
                    state.forceLocationUpdate();
                }
            }
        }, 1000);

        return () => {
            console.log('[ActiveRun] Clearing timer interval');
            clearInterval(interval);
        };
    }, []);

    const formatPace = (pace) => {
        if (!pace || pace === '--:--') return '--:--';
        return pace;
    };

    const handleFinish = async () => {
        console.log('[ActiveRun] Finishing run...');
        // First, refine the elevation data using Google API if available
        const fitnessSummary = useActivityStore.getState();
        try {
            await fitnessSummary.refineActivityDataWithGoogle();
        } catch (e) {
            console.warn('[ActiveRun] Could not refine elevation:', e);
        }

        const activityData = stopActivity();

        // Navigate to save activity screen with all data
        navigate(ROUTES.SAVE_ACTIVITY, {
            state: {
                activityData: {
                    distance: activityData.distance || distance,
                    duration: activityData.duration || elapsedTime,
                    pace: activityData.averagePace || averagePace || currentPace,
                    calories: calories,
                    elevation: activityData.elevation || fitnessSummary.elevation,
                    positions: activityData.route || safePositions,
                    type: 'running',
                    splits: activityData.splits || storeSplits,
                }
            }
        });
    };

    return (
        <div
            className="relative flex flex-col h-screen w-full overflow-hidden"
            style={{ backgroundColor: '#1a1a1a' }}
        >
            {/* Map Section - Collapsible */}
            <AnimatePresence>
                {showMap && currentPosition && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: '40%', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex-shrink-0 relative overflow-hidden"
                    >
                        <LiveMap
                            positions={safePositions}
                            center={currentPosition}
                            followUser={true}
                            mapType="hybrid"
                        />

                        {/* Gradient overlay at bottom of map */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timer Section - Top */}
            <div className="flex-shrink-0 pt-safe-top px-6 pt-6 pb-3">
                <div className="flex items-start justify-between">
                    <motion.span
                        className="text-white font-bold tabular-nums"
                        style={{ fontSize: '52px', letterSpacing: '-2px', fontFamily: 'system-ui' }}
                        animate={{ opacity: isPaused ? 0.5 : 1 }}
                    >
                        {formatTime(elapsedTime)}
                    </motion.span>

                    {/* GPS Accuracy Indicator */}
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            <span className={`material-symbols-outlined text-sm ${gpsAccuracy <= 10 ? 'text-green-400' :
                                gpsAccuracy <= 25 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                signal_cellular_alt
                            </span>
                            <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">
                                {gpsAccuracy === 0 ? 'Conectando...' :
                                    gpsAccuracy <= 10 ? 'Excelente' :
                                        gpsAccuracy <= 25 ? 'Bom' : 'Fraco'}
                            </span>
                        </div>
                    </div>

                    {/* Map toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowMap(!showMap)}
                        className={`mt-2 p-2.5 rounded-full ${showMap ? 'bg-primary' : 'bg-white/10'}`}
                    >
                        <span className={`material-symbols-outlined text-xl ${showMap ? 'text-background-dark' : 'text-white'}`}>
                            {showMap ? 'map' : 'map'}
                        </span>
                    </motion.button>
                </div>
            </div>

            {/* Main Stats Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                {/* Pace Display - Large */}
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="text-white font-bold tabular-nums"
                            style={{ fontSize: '64px', letterSpacing: '-2px' }}
                        >
                            {formatPace(currentPace)}
                        </span>
                    </div>
                    <span className="text-gray-400 text-base font-medium">
                        Ritmo Atual (/km)
                    </span>
                </div>

                {/* Distance Display - Large */}
                <div className="flex flex-col items-center mb-6">
                    <span
                        className="text-white font-bold tabular-nums"
                        style={{ fontSize: '64px', letterSpacing: '-2px' }}
                    >
                        {safeDistance.toFixed(2)}
                    </span>
                    <span className="text-gray-400 text-base font-medium">
                        Distância (km)
                    </span>
                </div>

                {/* Calories Display */}
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-400 text-2xl">local_fire_department</span>
                            <span
                                className="text-white font-bold tabular-nums text-3xl"
                            >
                                {calories}
                            </span>
                        </div>
                        <span className="text-gray-500 text-sm font-medium mt-1">
                            Calorias (kcal)
                        </span>
                    </div>

                    <div className="w-px h-12 bg-gray-700" />

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-400 text-2xl">avg_pace</span>
                            <span className="text-white font-bold tabular-nums text-3xl">
                                {formatPace(averagePace)}
                            </span>
                        </div>
                        <span className="text-gray-500 text-sm font-medium mt-1">
                            Média Total
                        </span>
                    </div>
                </div>
            </div>

            {/* Splits Section */}
            <div className="flex-shrink-0 px-6 pb-3">
                {/* Split bars */}
                <div className="flex gap-2 mb-2 min-h-[36px]">
                    {storeSplits && storeSplits.length > 0 ? (
                        storeSplits.slice(-3).map((split, index) => {
                            return (
                                <div
                                    key={split.km}
                                    className="flex-1 bg-blue-500 rounded-lg p-2 flex flex-col justify-end"
                                    style={{ minHeight: '36px' }}
                                >
                                    <span className="text-white/60 text-[10px] font-bold">KM {split.km}</span>
                                    <span className="text-white text-sm font-bold">
                                        {split.pace}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <>
                            <div className="flex-1 bg-gray-700/30 rounded-lg h-9 flex items-center justify-center border border-white/5">
                                <span className="text-white/20 text-[10px]">Parciais aparecerão aqui</span>
                            </div>
                        </>
                    )}
                </div>
                <span className="text-gray-500 text-sm font-medium block text-center">
                    Últimas Parciais
                </span>
            </div>

            {/* Bottom Control Bar */}
            <div
                className="flex-shrink-0 px-6 pt-4 pb-safe-bottom"
                style={{ backgroundColor: '#0d0d0d' }}
            >
                {/* Handle */}
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-1 rounded-full bg-gray-600" />
                </div>

                {/* Action Button */}
                <AnimatePresence mode="wait">
                    {!isPaused ? (
                        <motion.button
                            key="pause"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={pauseActivity}
                            className="w-full py-5 rounded-full flex items-center justify-center gap-3"
                            style={{ backgroundColor: '#ff6b35' }}
                        >
                            <span className="material-symbols-outlined text-white text-3xl filled">
                                pause
                            </span>
                            <span className="text-white text-xl font-bold">
                                Pausar
                            </span>
                        </motion.button>
                    ) : (
                        <motion.div
                            key="paused-controls"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-4"
                        >
                            {/* Resume Button */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={resumeActivity}
                                className="flex-1 py-5 rounded-full flex items-center justify-center gap-3"
                                style={{ backgroundColor: '#ff6b35' }}
                            >
                                <span className="material-symbols-outlined text-white text-3xl filled">
                                    play_arrow
                                </span>
                                <span className="text-white text-xl font-bold">
                                    Retomar
                                </span>
                            </motion.button>

                            {/* Stop Button */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFinish}
                                className="size-16 rounded-full bg-red-500 flex items-center justify-center shrink-0"
                            >
                                <span className="material-symbols-outlined text-white text-3xl filled">
                                    stop
                                </span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-4" /> {/* Extra padding for safe area */}
            </div>
        </div>
    );
};

const ActiveRun = () => {
    return (
        <ErrorBoundary>
            <ActiveRunContent />
        </ErrorBoundary>
    );
};

export default ActiveRun;
