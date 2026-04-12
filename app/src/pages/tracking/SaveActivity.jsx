import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LiveMap from '../../components/maps/LiveMap';
import { createActivity } from '../../services/activityApi';
import { uploadActivityImage } from '../../services/uploadApi';
import { useAuthStore } from '../../store/authStore';
import { useTrainingStore } from '../../store/trainingStore';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ACTIVITY_TYPES, ACTIVITY_METADATA, EFFORT_LEVELS } from '../../constants';
import { ROUTES } from '../../constants';

const activityTypes = Object.entries(ACTIVITY_METADATA).map(([id, data]) => ({
    id,
    ...data
}));

const effortLevels = EFFORT_LEVELS;

const mapStyles = [
    { id: 'roadmap', label: 'Padrão' },
    { id: 'satellite', label: 'Satélite' },
    { id: 'hybrid', label: 'Híbrido' },
    { id: 'terrain', label: 'Terreno' },
];

const SaveActivity = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const mapRef = useRef(null);
    const canvasRef = useRef(null);

    // Activity data from navigation state
    const activityData = location.state?.activityData || {};

    // Editable fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [activityType, setActivityType] = useState(activityData.type || 'running');
    const [effortLevel, setEffortLevel] = useState(3);
    const [isPublic, setIsPublic] = useState(true);
    const [notes, setNotes] = useState('');
    const [mapStyle, setMapStyle] = useState('roadmap');
    const [showMapStylePicker, setShowMapStylePicker] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [showEffortPicker, setShowEffortPicker] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generatingImage, setGeneratingImage] = useState(false);
    const [shareImageUrl, setShareImageUrl] = useState(null);

    // Activity stats
    const distance = activityData.distance || 0;
    const duration = activityData.duration || 0;
    const pace = activityData.pace || '--:--';
    const calories = activityData.calories || 0;
    const positions = activityData.positions || [];

    // Generate default title based on time
    useEffect(() => {
        const hour = new Date().getHours();
        let defaultTitle = '';
        if (hour < 6) defaultTitle = 'Corrida de Madrugada 🌙';
        else if (hour < 12) defaultTitle = 'Corrida Matinal ☀️';
        else if (hour < 18) defaultTitle = 'Corrida da Tarde 🌤️';
        else defaultTitle = 'Corrida Noturna 🌙';
        setTitle(defaultTitle);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h}h ${m}min ${s}s`;
        }
        return `${m}min ${s}s`;
    };

    const formatTimeShort = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Get map bounds from positions
    const getMapBounds = () => {
        if (positions.length < 2) return null;
        const lats = positions.map(p => p.lat);
        const lngs = positions.map(p => p.lng);
        return [
            [Math.min(...lats) - 0.002, Math.min(...lngs) - 0.002],
            [Math.max(...lats) + 0.002, Math.max(...lngs) + 0.002]
        ];
    };

    const bounds = getMapBounds();
    const startPos = positions[0];
    const endPos = positions[positions.length - 1];
    const currentStyle = mapStyles.find(s => s.id === mapStyle) || mapStyles[0];

    // Generate share image using canvas
    const generateShareImage = useCallback(async () => {
        setGeneratingImage(true);

        const width = 1080;
        const height = 1920;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Try to get a real map image first
        let mapBackgroundImg = null;
        try {
            const coords = positions.map(p => ({ lat: p.lat, lng: p.lng }));
            if (coords.length > 0) {
                // Simplify path for URL
                const step = Math.max(1, Math.floor(coords.length / 80));
                const sampled = coords.filter((_, i) => i % step === 0);
                const pathStr = sampled.map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join('|');

                // Dark styles (simplified for URL)
                const styleParams = [
                    'element:geometry|color:0x212121',
                    'feature:road|element:geometry.fill|color:0x2c2c2c',
                    'feature:water|element:geometry|color:0x000000'
                ].map(s => `style=${s}`).join('&');

                const { GOOGLE_MAPS_API_KEY } = await import('../../constants');
                const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x600&scale=2&maptype=roadmap&${styleParams}&path=color:0x1bda67ff|weight:5|${pathStr}&key=${GOOGLE_MAPS_API_KEY}`;

                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = staticMapUrl;
                });
                if (img.complete && img.naturalWidth > 0) {
                    mapBackgroundImg = img;
                }
            }
        } catch (e) {
            console.error('Failed to load static map background:', e);
        }

        const mapHeight = 1100;
        const padding = 80;

        if (mapBackgroundImg) {
            // Draw real map
            const aspect = mapBackgroundImg.width / mapBackgroundImg.height;
            const targetAspect = width / mapHeight;
            let dw, dh, dx, dy;

            if (aspect > targetAspect) {
                dh = mapHeight;
                dw = mapHeight * aspect;
                dx = (width - dw) / 2;
                dy = 0;
            } else {
                dw = width;
                dh = width / aspect;
                dx = 0;
                dy = (mapHeight - dh) / 2;
            }
            ctx.drawImage(mapBackgroundImg, dx, dy, dw, dh);

            // Subtle dark overlay to map
            const overlay = ctx.createLinearGradient(0, 0, 0, mapHeight);
            overlay.addColorStop(0, 'rgba(0,0,0,0.2)');
            overlay.addColorStop(0.8, 'rgba(0,0,0,0)');
            overlay.addColorStop(1, 'rgba(26,26,26,1)');
            ctx.fillStyle = overlay;
            ctx.fillRect(0, 0, width, mapHeight);
        } else {
            // Fallback grid
            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = 1;
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * (mapHeight / 20));
                ctx.lineTo(width, i * (mapHeight / 20));
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(i * (width / 15), 0);
                ctx.lineTo(i * (width / 15), mapHeight);
                ctx.stroke();
            }

            // Draw route on top of grid if no real map
            if (positions.length > 1) {
                const lats = positions.map(p => p.lat);
                const lngs = positions.map(p => p.lng);
                const minLat = Math.min(...lats);
                const maxLat = Math.max(...lats);
                const minLng = Math.min(...lngs);
                const maxLng = Math.max(...lngs);
                const latRange = maxLat - minLat || 0.01;
                const lngRange = maxLng - minLng || 0.01;
                const scaleX = (width - padding * 2) / lngRange;
                const scaleY = (mapHeight - padding * 2) / latRange;
                const scale = Math.min(scaleX, scaleY) * 0.8;
                const centerX = width / 2;
                const centerY = mapHeight / 2;

                ctx.strokeStyle = '#1bda67';
                ctx.lineWidth = 14;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                positions.forEach((pos, index) => {
                    const x = centerX + (pos.lng - (minLng + lngRange / 2)) * scale;
                    const y = centerY - (pos.lat - (minLat + latRange / 2)) * scale;
                    if (index === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
            }
        }

        // Logo badge
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.roundRect(width - 240, mapHeight - 70, 210, 50, 12);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px system-ui';
        ctx.fillText('🏃 FITCRAT', width - 220, mapHeight - 35);

        // Stats section background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, mapHeight, width, height - mapHeight);

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px system-ui';
        const displayTitle = title.replace(/[^\w\s🌙☀️🌤️]/g, '').trim() || 'Corrida';
        ctx.fillText(displayTitle, padding, mapHeight + 80);

        // Stats grid
        const statsY = mapHeight + 150;
        const statWidth = (width - padding * 2) / 2;

        // Ritmo
        ctx.fillStyle = '#888';
        ctx.font = '24px system-ui';
        ctx.fillText('Ritmo', padding, statsY);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 64px system-ui';
        ctx.fillText(`${pace}`, padding, statsY + 70);
        ctx.font = '32px system-ui';
        ctx.fillStyle = '#888';
        ctx.fillText('/km', padding + ctx.measureText(pace).width + 10, statsY + 70);

        // Tempo
        ctx.fillStyle = '#888';
        ctx.font = '24px system-ui';
        ctx.fillText('Tempo', padding + statWidth, statsY);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 64px system-ui';
        ctx.fillText(formatTime(duration), padding + statWidth, statsY + 70);

        // Distância
        const statsY2 = statsY + 150;
        ctx.fillStyle = '#888';
        ctx.font = '24px system-ui';
        ctx.fillText('Distância', padding, statsY2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 64px system-ui';
        ctx.fillText(`${distance.toFixed(2)}`, padding, statsY2 + 70);
        ctx.font = '32px system-ui';
        ctx.fillStyle = '#888';
        ctx.fillText(' km', padding + ctx.measureText(distance.toFixed(2)).width + 10, statsY2 + 70);

        // Calorias
        ctx.fillStyle = '#888';
        ctx.font = '24px system-ui';
        ctx.fillText('Calorias', padding + statWidth, statsY2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 64px system-ui';
        ctx.fillText(`${calories}`, padding + statWidth, statsY2 + 70);
        ctx.font = '32px system-ui';
        ctx.fillStyle = '#888';
        ctx.fillText(' kcal', padding + statWidth + ctx.measureText(String(calories)).width + 10, statsY2 + 70);

        // Footer hashtag
        ctx.fillStyle = '#666';
        ctx.font = '28px system-ui';
        ctx.fillText('#FitCrat #Corrida #Running', padding, height - 100);

        const dataUrl = canvas.toDataURL('image/png');
        setShareImageUrl(dataUrl);
        setGeneratingImage(false);

        return dataUrl;
    }, [positions, title, pace, duration, distance, calories, startPos, endPos]);

    // Open share modal and generate image
    const openShareModal = async () => {
        setShowShareModal(true);
        await generateShareImage();
    };

    // Share with native share
    const handleShare = async () => {
        if (!shareImageUrl) {
            await generateShareImage();
        }

        const text = `🏃 ${title}\n\n📏 Distância: ${distance.toFixed(2)} km\n⏱️ Tempo: ${formatTime(duration)}\n⚡ Ritmo: ${pace}/km\n🔥 Calorias: ${calories} kcal\n\n#FitCrat #Corrida`;

        try {
            // Try to share with image
            const base64Data = shareImageUrl.split(',')[1];

            // Save to temp file
            const fileName = `corrida_${Date.now()}.png`;

            try {
                await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache,
                });

                const fileUri = await Filesystem.getUri({
                    path: fileName,
                    directory: Directory.Cache,
                });

                await Share.share({
                    title: title,
                    text: text,
                    url: fileUri.uri,
                    dialogTitle: 'Compartilhar corrida',
                });
            } catch (fsError) {
                console.log('Filesystem error, sharing text only:', fsError);
                await Share.share({
                    title: title,
                    text: text,
                    dialogTitle: 'Compartilhar corrida',
                });
            }
        } catch (error) {
            console.log('Share error:', error);
            // Fallback to text only
            try {
                await Share.share({
                    title: title,
                    text: text,
                    dialogTitle: 'Compartilhar corrida',
                });
            } catch (e) {
                console.log('Share fallback error:', e);
            }
        }

        setShowShareModal(false);
    };

    // Download image
    const downloadImage = async () => {
        if (!shareImageUrl) {
            await generateShareImage();
        }

        const link = document.createElement('a');
        link.download = `corrida_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = shareImageUrl;
        link.click();
    };

    // ── Save activity (with retry + offline queue) ──────────────────────────
    const MAX_RETRIES = 3;

    const trySaveToApi = async (activity, attempt = 1) => {
        const { data, error } = await createActivity(activity);
        if (error) {
            console.error(`Save attempt ${attempt} failed:`, error);
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, 1500 * attempt)); // exponential backoff
                return trySaveToApi(activity, attempt + 1);
            }
            return { data: null, error };
        }
        return { data, error: null };
    };

    const saveToOfflineQueue = (activity) => {
        try {
            const queue = JSON.parse(localStorage.getItem('fitcrat_offline_activities') || '[]');
            queue.push({ ...activity, _queuedAt: new Date().toISOString() });
            localStorage.setItem('fitcrat_offline_activities', JSON.stringify(queue));
            console.log('[Offline] Activity queued for later sync');
        } catch (e) {
            console.error('[Offline] Failed to queue:', e);
        }
    };

    const handleSave = async () => {
        if (!user?.id) {
            alert('Voce precisa estar logado para salvar a atividade');
            return;
        }

        setSaving(true);
        console.log('Initiating save process...');

        try {
            let mapImageUrl = null;

            // Try to generate and upload map image (non-blocking)
            try {
                const dataUrl = await generateShareImage();
                if (dataUrl) {
                    const { publicUrl, error: uploadError } = await uploadActivityImage(user.id, dataUrl);
                    if (!uploadError) mapImageUrl = publicUrl;
                }
            } catch (imgError) {
                console.error('Image upload skipped:', imgError.message);
            }

            // Simplify route — keep max 500 points (lighter payload, faster save)
            let simplifiedRoute = positions || [];
            if (simplifiedRoute.length > 500) {
                const step = Math.ceil(simplifiedRoute.length / 500);
                simplifiedRoute = simplifiedRoute.filter((_, i) => i % step === 0);
            }
            // Strip heavy fields from each point (keep only lat, lng, timestamp)
            simplifiedRoute = simplifiedRoute.map(p => ({
                lat: p.lat, lng: p.lng, timestamp: p.timestamp
            }));

            // Safely parse numeric values — prevent NaN/undefined crashes
            const safeDist = typeof distance === 'number' && isFinite(distance) ? parseFloat(distance.toFixed(2)) : 0;
            const safeDur = typeof duration === 'number' && isFinite(duration) ? Math.round(duration) : 0;
            const safeCal = typeof calories === 'number' && isFinite(calories) ? Math.round(calories) : 0;

            const activity = {
                user_id: user.id,
                title: title || 'Corrida',
                description: description || '',
                type: activityType,
                distance_km: safeDist,
                duration_seconds: safeDur,
                pace: pace || '--:--',
                calories: safeCal,
                effort_level: effortLevel,
                route_data: simplifiedRoute,
                map_image_url: mapImageUrl,
                is_public: isPublic,
                notes: notes || '',
            };

            console.log('Saving activity:', { ...activity, route_data: `[${simplifiedRoute.length} pts]` });

            // Retry up to 3x, then queue offline
            const { data, error: saveError } = await trySaveToApi(activity);

            if (saveError) {
                saveToOfflineQueue(activity);
                alert('Sem conexao — sua corrida foi salva localmente e sera enviada quando a internet voltar.');
                navigate(ROUTES.DASHBOARD, { replace: true });
                return;
            }

            console.log('Activity saved:', data?.id);

            // Auto-mark today's training as complete
            try {
                const { autoMarkTodayComplete } = useTrainingStore.getState();
                autoMarkTodayComplete({
                    distance: activity.distance_km,
                    duration: activity.duration_seconds,
                    pace: activity.pace,
                    calories: activity.calories
                });
            } catch (_) {}

            navigate(ROUTES.DASHBOARD, { replace: true });
        } catch (error) {
            console.error('Critical save error:', error);
            alert(`Erro ao salvar: ${error?.message || 'Erro desconhecido'}. Tente novamente.`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center gap-4 px-4 py-4 pt-safe-top bg-background-dark border-b border-white/10">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full bg-white/5"
                >
                    <span className="material-symbols-outlined text-white">arrow_back</span>
                </motion.button>
                <h1 className="text-white text-xl font-bold">Salvar atividade</h1>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto pb-32">
                {/* Title Input */}
                <div className="px-4 py-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Dê um título para sua corrida"
                        className="w-full bg-surface-dark text-white text-lg px-4 py-4 rounded-xl border border-white/10 focus:border-primary focus:outline-none placeholder:text-white/40"
                    />
                </div>

                {/* Description Input */}
                <div className="px-4 pb-4">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Como foi? Compartilhe mais informações..."
                        rows={2}
                        className="w-full bg-surface-dark text-white px-4 py-4 rounded-xl border border-white/10 focus:border-primary focus:outline-none placeholder:text-white/40 resize-none"
                    />
                </div>

                {/* Activity Type Selector */}
                <div className="px-4 pb-4">
                    <button
                        onClick={() => setShowTypePicker(!showTypePicker)}
                        className="w-full flex items-center justify-between bg-surface-dark px-4 py-4 rounded-xl border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">
                                {activityTypes.find(t => t.id === activityType)?.icon || 'directions_run'}
                            </span>
                            <span className="text-white font-medium">
                                {activityTypes.find(t => t.id === activityType)?.label || 'Corrida'}
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-white/40">expand_more</span>
                    </button>

                    {showTypePicker && (
                        <div className="mt-2 bg-surface-dark rounded-xl border border-white/10 overflow-hidden">
                            {activityTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setActivityType(type.id);
                                        setShowTypePicker(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 ${activityType === type.id ? 'bg-primary/20' : ''}`}
                                >
                                    <span className={`material-symbols-outlined ${activityType === type.id ? 'text-primary' : 'text-white/60'}`}>
                                        {type.icon}
                                    </span>
                                    <span className={activityType === type.id ? 'text-primary font-bold' : 'text-white'}>
                                        {type.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map Preview */}
                <div className="px-4 pb-4">
                    <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: '200px' }}>
                        {positions.length > 0 ? (
                            <LiveMap
                                positions={positions}
                                center={startPos}
                                followUser={false}
                                mapType={mapStyle}
                                zoom={15}
                            />
                        ) : (
                            <div className="h-full bg-surface-dark flex flex-col items-center justify-center text-white/40">
                                <span className="material-symbols-outlined text-4xl mb-2">map</span>
                                <span className="text-sm">Mapa da atividade</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowMapStylePicker(!showMapStylePicker)}
                        className="w-full mt-2 py-3 text-primary font-medium border border-primary/30 rounded-xl"
                    >
                        Alterar tipo de mapa
                    </button>

                    {showMapStylePicker && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {mapStyles.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => {
                                        setMapStyle(style.id);
                                        setShowMapStylePicker(false);
                                    }}
                                    className={`py-2 rounded-lg text-sm font-medium ${mapStyle === style.id ? 'bg-primary text-background-dark' : 'bg-surface-dark text-white border border-white/10'}`}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-4 gap-2 bg-surface-dark rounded-xl p-4 border border-white/10">
                        <div className="text-center">
                            <span className="text-white text-lg font-bold">{distance.toFixed(2)}</span>
                            <span className="block text-white/50 text-xs">km</span>
                        </div>
                        <div className="text-center">
                            <span className="text-white text-lg font-bold">{formatTimeShort(duration)}</span>
                            <span className="block text-white/50 text-xs">tempo</span>
                        </div>
                        <div className="text-center">
                            <span className="text-white text-lg font-bold">{pace}</span>
                            <span className="block text-white/50 text-xs">/km</span>
                        </div>
                        <div className="text-center">
                            <span className="text-white text-lg font-bold">{calories}</span>
                            <span className="block text-white/50 text-xs">kcal</span>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="px-4 pb-4">
                    <h3 className="text-white font-bold text-lg mb-3">Detalhes</h3>

                    {/* Effort Level */}
                    <button
                        onClick={() => setShowEffortPicker(!showEffortPicker)}
                        className="w-full flex items-center justify-between bg-surface-dark px-4 py-4 rounded-xl border border-white/10 mb-3"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-white/60">sentiment_satisfied</span>
                            <span className="text-white/80">Nível de esforço</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{effortLevels.find(e => e.id === effortLevel)?.emoji}</span>
                        </div>
                    </button>

                    {showEffortPicker && (
                        <div className="mb-3 bg-surface-dark rounded-xl border border-white/10 overflow-hidden">
                            {effortLevels.map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => {
                                        setEffortLevel(level.id);
                                        setShowEffortPicker(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 ${effortLevel === level.id ? 'bg-primary/20' : ''}`}
                                >
                                    <span className={effortLevel === level.id ? 'text-primary font-bold' : 'text-white'}>
                                        {level.label}
                                    </span>
                                    <span className="text-2xl">{level.emoji}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Privacy toggle */}
                    <div className="flex items-center justify-between bg-surface-dark px-4 py-4 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-white/60">
                                {isPublic ? 'public' : 'lock'}
                            </span>
                            <span className="text-white/80">
                                {isPublic ? 'Atividade pública' : 'Atividade privada'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsPublic(!isPublic)}
                            className={`w-12 h-7 rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-white/20'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Share Section */}
                <div className="px-4 pb-4">
                    <h3 className="text-white font-bold text-lg mb-3">Compartilhar</h3>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={openShareModal}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 py-4 rounded-xl mb-3"
                    >
                        <span className="material-symbols-outlined text-white text-2xl">share</span>
                        <span className="text-white font-bold text-lg">Compartilhar Corrida</span>
                    </motion.button>
                </div>
            </div>

            {/* Save Button - Fixed at bottom */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-8">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-5 bg-[#ff6b35] text-white font-bold text-xl rounded-full disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                    {saving ? (
                        <>
                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Salvando...</span>
                        </>
                    ) : (
                        <span>Salvar atividade</span>
                    )}
                </motion.button>
            </div>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col bg-black"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 pt-safe-top border-b border-white/10">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowShareModal(false)}
                                className="p-2"
                            >
                                <span className="material-symbols-outlined text-white text-2xl">close</span>
                            </motion.button>
                            <span className="text-white font-bold text-lg">Compartilhar atividade</span>
                            <div className="w-10" />
                        </div>

                        {/* Image Preview */}
                        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                            {generatingImage ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="text-white/60">Gerando imagem...</span>
                                </div>
                            ) : shareImageUrl ? (
                                <img
                                    src={shareImageUrl}
                                    alt="Share preview"
                                    className="max-h-full max-w-full rounded-xl shadow-2xl"
                                    style={{ maxHeight: 'calc(100vh - 250px)' }}
                                />
                            ) : null}
                        </div>

                        {/* Share buttons */}
                        <div className="p-4 pb-safe-bottom border-t border-white/10">
                            <div className="grid grid-cols-5 gap-3 mb-4">
                                <button
                                    onClick={handleShare}
                                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
                                >
                                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                    <span className="text-white text-[10px]">Stories</span>
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#1877F2]"
                                >
                                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span className="text-white text-[10px]">Facebook</span>
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#25D366]"
                                >
                                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    <span className="text-white text-[10px]">WhatsApp</span>
                                </button>

                                <button
                                    onClick={downloadImage}
                                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface-dark border border-white/10"
                                >
                                    <span className="material-symbols-outlined text-white text-[28px]">download</span>
                                    <span className="text-white text-[10px]">Salvar</span>
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface-dark border border-white/10"
                                >
                                    <span className="material-symbols-outlined text-white text-[28px]">share</span>
                                    <span className="text-white text-[10px]">Mais</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SaveActivity;
