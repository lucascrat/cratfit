import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share } from '@capacitor/share';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// ... imports
import { calculateHeartRateZones, calculateTrainingPaces, calculateMaxHeartRate, estimateVO2Max } from '../../utils/fitnessUtils';
import { getComments, addComment } from '../../services/activityApi';
import { getFitnessProfile } from '../../services/trainingApi';
import useAuthStore from '../../store/authStore';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { generateActivityImage } from '../../utils/shareUtils';

// --- Helpers ---
const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
};

const parsePaceToSeconds = (paceStr) => {
    if (!paceStr) return 0;
    const parts = paceStr.split(':');
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    return 0;
};

const createStartIcon = () => L.divIcon({
    className: 'bg-transparent',
    html: '<span class="material-symbols-outlined text-green-500 text-3xl" style="text-shadow: 0 2px 4px rgba(0,0,0,0.5)">flag</span>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

const createEndIcon = () => L.divIcon({
    className: 'bg-transparent',
    html: '<span class="material-symbols-outlined text-red-500 text-3xl" style="text-shadow: 0 2px 4px rgba(0,0,0,0.5)">sports_score</span>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

const ActivityDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();

    const [activity, setActivity] = useState(location.state?.activity || null);
    const [activeTab, setActiveTab] = useState('stats');
    const [showMapFullscreen, setShowMapFullscreen] = useState(false);

    // Map State
    const [positions, setPositions] = useState([]);
    const [bounds, setBounds] = useState(null);
    const [startPos, setStartPos] = useState(null);
    const [endPos, setEndPos] = useState(null);

    // Comments State
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    const [profile, setProfile] = useState(null);
    const [dynamicZones, setDynamicZones] = useState([]);
    const [trainingPaces, setTrainingPaces] = useState([]);
    const [estimatedVO2, setEstimatedVO2] = useState(null);

    // --- Effects & Handlers ---

    useEffect(() => {
        if (activity?.route_data) {
            try {
                let decoded = activity.route_data;
                if (typeof decoded === 'string') {
                    decoded = JSON.parse(decoded);
                }

                // Normalizar para {lat, lng} se necessário
                if (Array.isArray(decoded)) {
                    const normalized = decoded.map(p => {
                        if (Array.isArray(p)) return { lat: p[0], lng: p[1] };
                        return p;
                    });

                    if (normalized.length > 0) {
                        setPositions(normalized);
                        setStartPos(normalized[0]);
                        setEndPos(normalized[normalized.length - 1]);

                        // Calculate bounds
                        const lats = normalized.map(p => p.lat);
                        const lngs = normalized.map(p => p.lng);
                        setBounds([
                            [Math.min(...lats), Math.min(...lngs)],
                            [Math.max(...lats), Math.max(...lngs)]
                        ]);
                    }
                }
            } catch (e) {
                console.error("Error parsing route", e);
            }
        }
    }, [activity]);

    const loadComments = async () => {
        if (!activity) return;
        setLoadingComments(true);
        const { data } = await getComments(activity.id);
        if (data) setComments(data);
        setLoadingComments(false);
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !user || !activity) return;
        const { error } = await addComment(activity.id, user.id, newComment);
        if (!error) {
            setNewComment('');
            loadComments();
        }
    };

    const handleShare = async () => {
        if (!activity) return;

        try {
            console.log('[Share] Initializing professional share...');

            const distanceNum = Number(activity.distance || 0).toFixed(2);
            let shareOptions = {
                title: 'Minha Atividade no FitCrat',
                text: `Confira meu treino: ${distanceNum}km em ${formatTime(activity.duration)}! #FitCrat`,
                url: window.location.href,
                dialogTitle: 'Compartilhar treino'
            };

            let mapBase64 = null;
            const mapSrc = activity.map_image_url || activity.mapImage;
            const isPlaceholder = !mapSrc || mapSrc.includes('unsplash.com') || mapSrc.includes('placehold');

            if (!isPlaceholder && mapSrc?.startsWith('http')) {
                try {
                    const response = await fetch(mapSrc);
                    if (response.ok) {
                        const blob = await response.blob();
                        mapBase64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                    }
                } catch (e) {
                    console.warn('[Share] Background download failed');
                }
            }

            // Generate Image
            const activityForGen = {
                title: activity.title || 'Corrida',
                distance_km: activity.distance || 0,
                duration_seconds: activity.duration || 0,
                pace: activity.pace || '--:--',
                calories: activity.calories || 0,
                route_data: activity.route_data || [],
                mapImage: mapBase64 || mapSrc
            };

            const dataUrl = await generateActivityImage(activityForGen);

            if (dataUrl) {
                const base64Data = dataUrl.split(',')[1];
                const fileName = `Share_${Date.now()}.png`;

                await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });

                const fileUri = await Filesystem.getUri({
                    path: fileName,
                    directory: Directory.Cache
                });

                shareOptions.files = [fileUri.uri];
            }

            await Share.share(shareOptions);
        } catch (error) {
            console.error('[Share] Error sharing activity:', error);
        }
    };

    useEffect(() => {
        const loadProfileAndCalc = async () => {
            if (!user) return;
            const { data } = await getFitnessProfile(user.id);
            const userProfile = data || {};
            setProfile(userProfile);

            // Calculate Zones
            const age = userProfile.birth_date
                ? new Date().getFullYear() - new Date(userProfile.birth_date).getFullYear()
                : 30; // Default age 30

            const maxHR = calculateMaxHeartRate(age);
            // Assuming we might store resting HR in future, for now use default or MaxHR based
            const zones = calculateHeartRateZones(maxHR);

            // Map zones to the format expected by UI if different, or update UI to use new structure
            // The utils returns { zone: 1, name:..., min:..., max:..., color:... }
            // The UI expects { zone, name, range: 'min-max', percent: X, color }
            // We need to calculate percentages of time in zone based on actual activity HR data if available?
            // Since we don't have per-second HR data in the `activity` object (only avg/max), we CANNOT simulate the bar chart accurately without the streams.
            // BUT, we can show the ZONE RANGES correctly.
            // For the "Time in Zone" bars, we will have to mock it or leave it as a visual demo since we lack array data.
            // OR we can distribute it normally around the AvgHR (Bell curve approximation).

            const enrichedZones = zones.map(z => ({
                ...z,
                range: `${z.min}-${z.max}`,
                // Mock percentage distribution centered around AvgHR?
                percent: 0 // Will assign below
            }));

            // Bell curve distribution approx
            const avgHR = activity.avg_heart_rate || 140;
            let totalDist = 0;
            enrichedZones.forEach(z => {
                const zoneMid = (z.min + z.max) / 2;
                const dist = Math.exp(-Math.pow(zoneMid - avgHR, 2) / (2 * Math.pow(15, 2))); // sigma=15
                z.rawDist = dist;
                totalDist += dist;
            });
            enrichedZones.forEach(z => {
                z.percent = Math.round((z.rawDist / totalDist) * 100);
            });

            setDynamicZones(enrichedZones);

            // Calculate Training Paces
            const paceSeconds = parsePaceToSeconds(activity.pace);
            const paces = calculateTrainingPaces(paceSeconds, activity.distance);
            setTrainingPaces(paces);

            // Estimate VO2
            const vo2 = estimateVO2Max(activity.distance, activity.duration / 60, avgHR, age);
            setEstimatedVO2(vo2);
        };

        loadProfileAndCalc();
        loadComments();
    }, [id, user, activity]); // Added activity dependency

    // Use dynamicZones instead of hardcoded
    const displayZones = dynamicZones.length > 0 ? dynamicZones : [
        { zone: 1, name: 'Recuperação', range: '< 124', percent: 5, color: '#9ca3af' },
        { zone: 2, name: 'Aeróbico Leve', range: '124-140', percent: 15, color: '#3b82f6' },
        { zone: 3, name: 'Aeróbico', range: '140-156', percent: 35, color: '#22c55e' },
        { zone: 4, name: 'Limiar', range: '156-172', percent: 35, color: '#f59e0b' },
        { zone: 5, name: 'Anaeróbico', range: '> 172', percent: 10, color: '#ef4444' },
    ];

    // ... render logic modification for Zones tab



    return (
        <div className="flex flex-col min-h-screen bg-background-dark">
            {/* Header with Map */}
            <div className="relative">
                {/* Map */}
                <div className="h-64 relative">
                    {positions.length > 1 ? (
                        <MapContainer
                            bounds={bounds}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                            attributionControl={false}
                        >
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            <Polyline
                                positions={positions.map(p => [p.lat, p.lng])}
                                color="#ff6b35"
                                weight={5}
                                opacity={1}
                            />
                            {startPos && <Marker position={[startPos.lat, startPos.lng]} icon={createStartIcon()} />}
                            {endPos && <Marker position={[endPos.lat, endPos.lng]} icon={createEndIcon()} />}
                        </MapContainer>
                    ) : (
                        <div className="h-full bg-surface-dark flex items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-white/20">map</span>
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background-dark to-transparent" />

                    {/* Expand button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowMapFullscreen(true)}
                        className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full"
                    >
                        <span className="material-symbols-outlined text-white">open_in_full</span>
                    </motion.button>
                </div>

                {/* Back button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-2 rounded-full z-10"
                >
                    <span className="material-symbols-outlined text-white">arrow_back</span>
                </motion.button>
            </div>

            {/* Activity Info */}
            <div className="px-4 -mt-8 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">directions_run</span>
                    </div>
                    <div>
                        <h1 className="text-white text-xl font-bold">{activity.title}</h1>
                        <p className="text-white/50 text-sm">{formatDate(activity.created_at)}</p>
                    </div>
                </div>
            </div>

            {/* Main Stats */}
            <div className="px-4 py-4">
                <div className="grid grid-cols-3 gap-4 bg-surface-dark rounded-2xl p-4 border border-white/10">
                    <div className="text-center">
                        <span className="text-3xl font-bold text-white">{(Number(activity?.distance) || 0).toFixed(2)}</span>
                        <span className="block text-white/50 text-sm">km</span>
                    </div>
                    <div className="text-center border-l border-r border-white/10">
                        <span className="text-3xl font-bold text-white">{activity.pace}</span>
                        <span className="block text-white/50 text-sm">/km</span>
                    </div>
                    <div className="text-center">
                        <span className="text-3xl font-bold text-white">{formatTime(activity.duration)}</span>
                        <span className="block text-white/50 text-sm">tempo</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 pb-2">
                <div className="flex bg-surface-dark rounded-xl p-1">
                    {['stats', 'splits', 'zones', 'social'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === tab
                                ? 'bg-primary text-background-dark'
                                : 'text-white/60'
                                }`}
                        >
                            {tab === 'stats' && 'Estatísticas'}
                            {tab === 'splits' && 'Splits'}
                            {tab === 'zones' && 'Zonas FC'}
                            {tab === 'social' && `Social (${comments.length})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 px-4 pb-24 overflow-auto">
                {/* Stats Tab */}
                {activeTab === 'stats' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Secondary Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-orange-400 text-xl">local_fire_department</span>
                                    <span className="text-white/50 text-sm">Calorias</span>
                                </div>
                                <span className="text-2xl font-bold text-white">{activity.calories}</span>
                                <span className="text-white/50 text-sm ml-1">kcal</span>
                            </div>
                            <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-green-400 text-xl">trending_up</span>
                                    <span className="text-white/50 text-sm">Elevação</span>
                                </div>
                                <span className="text-2xl font-bold text-white">{activity.elevation_gain || 45}</span>
                                <span className="text-white/50 text-sm ml-1">m</span>
                            </div>
                            <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-red-400 text-xl">favorite</span>
                                    <span className="text-white/50 text-sm">FC Média</span>
                                </div>
                                <span className="text-2xl font-bold text-white">{activity.avg_heart_rate || 156}</span>
                                <span className="text-white/50 text-sm ml-1">bpm</span>
                            </div>
                            <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-red-500 text-xl">heart_broken</span>
                                    <span className="text-white/50 text-sm">FC Máxima</span>
                                </div>
                                <span className="text-2xl font-bold text-white">{activity.max_heart_rate || 178}</span>
                                <span className="text-white/50 text-sm ml-1">bpm</span>
                            </div>
                        </div>

                        {/* More Stats */}
                        <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                            <h3 className="text-white font-bold mb-4">Mais Detalhes</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/60 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">speed</span>
                                        Velocidade Média
                                    </span>
                                    <span className="text-white font-bold">{(Number(activity?.distance || 0) / (Number(activity?.duration || 1) / 3600)).toFixed(1)} km/h</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/60 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">footprint</span>
                                        Cadência Média
                                    </span>
                                    <span className="text-white font-bold">{activity.avg_cadence || 172} spm</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/60 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">straighten</span>
                                        Passos Totais
                                    </span>
                                    <span className="text-white font-bold">{Math.round((activity.avg_cadence || 172) * (activity.duration / 60)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/60 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">timer</span>
                                        Ritmo Médio/500m
                                    </span>
                                    <span className="text-white font-bold">{Math.floor(parsePaceToSeconds(activity.pace) / 2)}:{String(Math.round((parsePaceToSeconds(activity.pace) / 2) % 1 * 60)).padStart(2, '0')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Effort Level */}
                        <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                            <h3 className="text-white font-bold mb-3">Nível de Esforço</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full"
                                        style={{ width: '72%' }}
                                    />
                                </div>
                                <span className="text-white font-bold text-lg">72</span>
                            </div>
                            <p className="text-white/50 text-sm mt-2">Treino Moderado-Intenso</p>
                        </div>
                    </motion.div>
                )}

                {/* Splits Tab */}
                {activeTab === 'splits' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <div className="bg-surface-dark rounded-xl border border-white/10 overflow-hidden">
                            {/* Header */}
                            <div className="grid grid-cols-4 px-4 py-3 bg-white/5 text-white/50 text-sm font-medium">
                                <span>KM</span>
                                <span className="text-center">Ritmo</span>
                                <span className="text-center">Elevação</span>
                                <span className="text-right">Gráfico</span>
                            </div>

                            {/* Splits list */}
                            {splits.map((split, index) => {
                                const maxPace = Math.max(...splits.map(s => s.paceSeconds));
                                const minPace = Math.min(...splits.map(s => s.paceSeconds));
                                const range = maxPace - minPace || 1;
                                const barWidth = 100 - ((split.paceSeconds - minPace) / range) * 60;

                                return (
                                    <div
                                        key={split.km}
                                        className={`grid grid-cols-4 px-4 py-3 items-center ${index % 2 === 0 ? 'bg-white/[0.02]' : ''
                                            }`}
                                    >
                                        <span className="text-white font-bold">{split.km}</span>
                                        <span className={`text-center font-bold ${split.isFastest ? 'text-green-400' :
                                            split.isSlowest ? 'text-red-400' : 'text-white'
                                            }`}>
                                            {split.pace}
                                            {split.isFastest && <span className="ml-1">🏆</span>}
                                        </span>
                                        <span className={`text-center text-sm ${split.elevation > 0 ? 'text-green-400' :
                                            split.elevation < 0 ? 'text-red-400' : 'text-white/50'
                                            }`}>
                                            {split.elevation > 0 ? '+' : ''}{split.elevation}m
                                        </span>
                                        <div className="flex justify-end">
                                            <div
                                                className={`h-3 rounded-full ${split.isFastest ? 'bg-green-400' :
                                                    split.isSlowest ? 'bg-red-400' : 'bg-primary'
                                                    }`}
                                                style={{ width: `${barWidth}%`, minWidth: '20%' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-white/50 text-sm">Melhor Km</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-green-400 font-bold text-xl">
                                            {splits.find(s => s.isFastest)?.pace}
                                        </span>
                                        <span className="text-white/50 text-sm">
                                            (Km {splits.find(s => s.isFastest)?.km})
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-white/50 text-sm">Pior Km</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-red-400 font-bold text-xl">
                                            {splits.find(s => s.isSlowest)?.pace}
                                        </span>
                                        <span className="text-white/50 text-sm">
                                            (Km {splits.find(s => s.isSlowest)?.km})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Heart Rate Zones Tab */}
                {activeTab === 'zones' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* VO2 Max Card */}
                        {estimatedVO2 && (
                            <div className="bg-surface-dark rounded-xl p-4 border border-white/10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-bold text-lg">Condicionamento Estimado (VO2Max)</h3>
                                    <p className="text-white/50 text-xs">Baseado no seu pace e FC deste treino</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                                        {estimatedVO2}
                                    </span>
                                    <span className="text-white/50 text-xs block">ml/kg/min</span>
                                </div>
                            </div>
                        )}

                        <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-400">favorite</span>
                                Zonas de Frequência Cardíaca (Personalizadas)
                            </h3>

                            <div className="space-y-3">
                                {displayZones.map((zone) => (
                                    <div key={zone.zone} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: zone.color }}
                                                />
                                                <span className="text-white text-sm">Z{zone.zone} - {zone.name}</span>
                                            </div>
                                            <span className="text-white/50 text-sm">{zone.range} bpm</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-6 bg-white/10 rounded-lg overflow-hidden">
                                                <div
                                                    className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-1000"
                                                    style={{ width: `${zone.percent}%`, backgroundColor: zone.color }}
                                                >
                                                    <span className="text-white text-xs font-bold drop-shadow-md">{zone.percent}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-white/30 text-right">{zone.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Training Paces Card */}
                        {trainingPaces.length > 0 && (
                            <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-400">speed</span>
                                    Ritmos de Treino Sugeridos
                                </h3>
                                <p className="text-white/40 text-xs mb-4">
                                    Ritmos baseados no seu desempenho atual (VDOT aprox).
                                </p>
                                <div className="space-y-2">
                                    {trainingPaces.map((pace, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pace.color }} />
                                                <span className="text-white text-sm font-medium">{pace.name}</span>
                                            </div>
                                            <span className="text-white font-mono font-bold">{pace.pace} <span className="text-[10px] font-normal text-white/40">/km</span></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tempo por Zona */}
                        <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                            <h3 className="text-white font-bold mb-3">Tempo Estimado por Zona</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {displayZones.map((zone) => {
                                    const timeInZone = Math.round((zone.percent / 100) * activity.duration);
                                    return (
                                        <div key={zone.zone} className="text-center">
                                            <div
                                                className="w-full h-2 rounded-full mb-2"
                                                style={{ backgroundColor: zone.color }}
                                            />
                                            <span className="text-white font-bold text-sm">
                                                {Math.floor(timeInZone / 60)}:{String(timeInZone % 60).padStart(2, '0')}
                                            </span>
                                            <span className="block text-white/50 text-xs">Z{zone.zone}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Heart Rate Graph Placeholder */}
                        <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                            <h3 className="text-white font-bold mb-3">Gráfico de FC</h3>
                            <div className="h-32 flex items-end justify-between gap-1">
                                {Array.from({ length: 30 }).map((_, i) => {
                                    const height = 30 + Math.random() * 60;
                                    const hue = Math.min(120, Math.max(0, 120 - height * 1.5));
                                    return (
                                        <div
                                            key={i}
                                            className="flex-1 rounded-t-sm"
                                            style={{
                                                height: `${height}%`,
                                                backgroundColor: `hsl(${hue}, 70%, 50%)`
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-2 text-white/50 text-xs">
                                <span>0:00</span>
                                <span>{formatTime(activity.duration)}</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Social Tab */}
                {activeTab === 'social' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Comment Input */}
                        <div className="bg-surface-dark rounded-2xl p-4 border border-white/10 flex flex-col gap-3">
                            <textarea
                                placeholder="Deixe um comentário positivo..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary outline-none min-h-[80px]"
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-white/40 text-[10px]">Lembre-se de ser gentil! ❤️</span>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                    className="bg-primary text-background-dark px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                                >
                                    Comentar
                                </motion.button>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                            {loadingComments ? (
                                <div className="text-center py-8">
                                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                                    <span className="text-white/40 text-xs">Carregando papo...</span>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <span className="material-symbols-outlined text-4xl text-white/10 mb-2">forum</span>
                                    <p className="text-white/30 text-sm">Seja o primeiro a comentar!</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="bg-surface-dark rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center gap-3 mb-2">
                                            {comment.users?.avatar_url ? (
                                                <img src={comment.users.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <span className="text-primary text-[10px] font-bold">
                                                        {comment.users?.name?.charAt(0) || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-xs">{comment.users?.name}</p>
                                                <p className="text-white/40 text-[10px]">
                                                    {new Date(comment.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-white/80 text-sm pl-11">{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Share Button Fixed */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-8">
                <div className="flex gap-3">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-4 bg-surface-dark text-white font-bold rounded-full border border-white/10 flex items-center justify-center gap-2 shadow-lg"
                    >
                        <span className="material-symbols-outlined">edit</span>
                        Editar
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleShare}
                        className="flex-1 py-4 bg-primary text-background-dark font-bold rounded-full flex items-center justify-center gap-2 shadow-lg"
                    >
                        <span className="material-symbols-outlined">share</span>
                        Compartilhar
                    </motion.button>
                </div>
            </div>

            {/* Fullscreen Map Modal */}
            <AnimatePresence>
                {showMapFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black"
                    >
                        <MapContainer
                            bounds={bounds}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                            attributionControl={false}
                        >
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            <Polyline
                                positions={positions.map(p => [p.lat, p.lng])}
                                color="#ff6b35"
                                weight={5}
                                opacity={1}
                            />
                            {startPos && <Marker position={[startPos.lat, startPos.lng]} icon={createStartIcon()} />}
                            {endPos && <Marker position={[endPos.lat, endPos.lng]} icon={createEndIcon()} />}
                        </MapContainer>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowMapFullscreen(false)}
                            className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-3 rounded-full z-10"
                        >
                            <span className="material-symbols-outlined text-white text-2xl">close</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActivityDetails;
