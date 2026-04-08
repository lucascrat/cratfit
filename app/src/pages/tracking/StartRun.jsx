import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Geolocation } from '@capacitor/geolocation';
import LiveMap from '../../components/maps/LiveMap';
import { useActivityStore, formatTime } from '../../store/activityStore';



import { ROUTES, TRAINING_MODES } from '../../constants';

const trainingModes = [
    { id: TRAINING_MODES.FREE, icon: 'directions_run', label: 'Livre', description: 'Sem metas' },
    { id: TRAINING_MODES.PACE, icon: 'speed', label: 'Ritmo', description: 'Alvo: 5:30' },
    { id: TRAINING_MODES.INTERVAL, icon: 'timer', label: 'Intervalado', description: '8x400m' },
    { id: TRAINING_MODES.DISTANCE, icon: 'flag', label: 'Meta 5K', description: '5.00 km' },
];

const mapLayers = [
    { id: 'roadmap', label: 'Padrão', icon: 'map', googleType: 'roadmap' },
    { id: 'satellite', label: 'Satélite', icon: 'satellite_alt', googleType: 'satellite' },
    { id: 'hybrid', label: 'Híbrido', icon: 'layers', googleType: 'hybrid' },
    { id: 'terrain', label: 'Terreno', icon: 'terrain', googleType: 'terrain' },
];

// Error Boundary to catch map errors
class ErrorBoundaryWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Map component crashed:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 bg-surface-dark flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-center px-8">
                        <span className="material-symbols-outlined text-4xl text-red-400">error</span>
                        <span className="text-white/80 text-sm">Erro ao carregar o mapa</span>
                        <span className="text-white/40 text-xs">Verifique sua conexão com a internet</span>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}


// ... imports

const StartRun = () => {
    const navigate = useNavigate();

    // Store state
    const {
        isTracking: isRunning,
        isPaused,
        elapsedTime,
        distance,
        currentPace,
        averagePace,
        currentSplitPace, // New state
        splits,
        positions,
        gpsAccuracy,
        startGpsWatcher,
        stopGpsWatcher,
        startActivity,
        pauseActivity,
        resumeActivity,
        stopActivity,
        updateElapsedTime,
        currentPosition: storePosition,
    } = useActivityStore();

    const [selectedMode, setSelectedMode] = useState(TRAINING_MODES.FREE);
    const [panelExpanded, setPanelExpanded] = useState(true);
    const [showMapTypeSelector, setShowMapTypeSelector] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState('roadmap');
    const [gpsReady, setGpsReady] = useState(false);

    // Initial GPS Watcher
    useEffect(() => {
        let watcher = null;
        const initGps = async () => {
            await startGpsWatcher();
        };
        initGps();
        return () => {
            // We don't stop watcher here because we want it to continue into the run
            // or we might want to stop it if we leave the screen without running.
            // For now, let's keep it running to ensure seamless transition.
        };
    }, []);

    // Monitor GPS accuracy
    useEffect(() => {
        if (gpsAccuracy > 0 && gpsAccuracy <= 50) {
            setGpsReady(true);
        } else {
            setGpsReady(false); // Strict for start, but maybe relax to 60m
        }
    }, [gpsAccuracy]);

    // Ensure timer updates if run is active and user is on this screen
    useEffect(() => {
        let interval;
        if (isRunning && !isPaused) {
            interval = setInterval(() => {
                updateElapsedTime();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, isPaused, updateElapsedTime]);

    const handleStartRun = () => {
        navigate(ROUTES.TRACKING, { state: { mode: selectedMode } });
    };

    const handleStopRun = async () => {
        const finalActivity = stopActivity();
        setPanelExpanded(true);
        navigate(ROUTES.SAVE_ACTIVITY, { state: { activityData: finalActivity } });
    };

    const handlePauseResume = () => {
        if (isPaused) {
            resumeActivity();
        } else {
            pauseActivity();
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-dark">
            {/* Map Background */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <ErrorBoundaryWrapper>
                    {gpsReady && storePosition ? (
                        <LiveMap
                            positions={[]} // No path yet for new run
                            center={storePosition}
                            zoom={16}
                            mapType={selectedLayer}
                            followUser={true}
                            showPath={false}
                        />
                    ) : (
                        <div className="flex bg-surface-dark h-full w-full items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                <span className="text-sm text-white/60">Buscando GPS...</span>
                            </div>
                        </div>
                    )}
                </ErrorBoundaryWrapper>

                {/* Gradient Overlay for Top readability */}
                <div className="pointer-events-none absolute left-0 right-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
            </div>

            {/* Header */}
            <div className="absolute left-0 right-0 top-0 z-10 px-6 pt-safe-top">
                <div className="flex items-center justify-between py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-md"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>

                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-white">Nova Atividade</span>
                        <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 ${gpsAccuracy <= 10 ? 'bg-green-500/20 text-green-400' :
                            gpsAccuracy <= 25 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            <span className="material-symbols-outlined text-[10px]">signal_cellular_alt</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {gpsAccuracy === 0 ? 'Sem Sinal' : gpsAccuracy <= 10 ? 'GPS Forte' : 'GPS Fraco'}
                            </span>
                        </div>
                    </div>

                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            {/* Map Controls */}
            <div className="absolute right-5 top-24 z-10 flex flex-col gap-3">
                <button
                    onClick={() => setShowMapTypeSelector(true)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-dark/90 text-white shadow-lg backdrop-blur-md"
                >
                    <span className="material-symbols-outlined">layers</span>
                </button>
                <button
                    onClick={() => {
                        // Recenter logic via props or just force update
                        const state = useActivityStore.getState();
                        if (state.currentPosition) {
                            // Use a ref if we had one, or just rely on re-render to recenter
                            // For now, re-triggering followUser usually happens on position update.
                            // We can just rely on the map's auto-center behavior.
                        }
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-dark/90 text-primary shadow-lg backdrop-blur-md"
                >
                    <span className="material-symbols-outlined">my_location</span>
                </button>
            </div>

            {/* Bottom Panel */}
            <motion.div
                className="absolute left-0 right-0 z-[1001] flex flex-col rounded-t-3xl bg-background-dark/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
                initial={{ bottom: 0 }}
                animate={{
                    bottom: 0,
                    height: panelExpanded ? 'auto' : (isRunning ? '180px' : 'auto')
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                {/* Handle */}
                <div
                    className="flex justify-center pt-3 pb-2 w-full cursor-pointer"
                    onClick={() => setPanelExpanded(!panelExpanded)}
                >
                    <div className="h-1.5 w-12 rounded-full bg-white/30" />
                </div>

                {/* Running stats (collapsed) */}
                {isRunning && !panelExpanded && (
                    <div className="px-6 pb-4">
                        <div className="flex justify-between items-center">
                            <div className="text-center">
                                <span className="text-white text-3xl font-bold tabular-nums">
                                    {formatTime(elapsedTime)}
                                </span>
                                <span className="block text-white/50 text-xs uppercase">Tempo</span>
                            </div>
                            <div className="text-center">
                                <span className="text-white text-3xl font-bold tabular-nums">
                                    {currentPace || '--:--'}
                                </span>
                                <span className="block text-white/50 text-xs uppercase">Ritmo (/km)</span>
                            </div>
                            <div className="text-center">
                                <span className="text-white text-3xl font-bold tabular-nums">
                                    {distance.toFixed(2)}
                                </span>
                                <span className="block text-white/50 text-xs uppercase">Distância (km)</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Full panel content */}
                <AnimatePresence>
                    {panelExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            {/* Training Mode Selector */}
                            {!isRunning && (
                                <div className="pt-2 pb-2">
                                    <div className="px-6 mb-2 flex justify-between items-center">
                                        <span className="text-white/80 text-xs font-bold uppercase tracking-wider">
                                            Modo de Treino
                                        </span>
                                        <div className="flex gap-3">
                                            <span
                                                onClick={() => navigate(ROUTES.GYM)}
                                                className="text-purple-400 text-xs font-bold cursor-pointer flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">fitness_center</span>
                                                Academia
                                            </span>
                                            <span
                                                onClick={() => navigate(ROUTES.PERSONAL)}
                                                className="text-primary text-xs font-bold cursor-pointer flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">directions_run</span>
                                                Corrida
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 overflow-x-auto px-6 pb-2 no-scrollbar">
                                        {trainingModes.map((mode) => (
                                            <motion.button
                                                key={mode.id}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedMode(mode.id)}
                                                className={`shrink-0 flex flex-col items-start justify-between w-32 h-24 p-3 rounded-2xl relative overflow-hidden transition-all ${selectedMode === mode.id
                                                    ? 'bg-primary text-background-dark shadow-glow-primary'
                                                    : 'bg-surface-dark border border-white/10 text-white'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${selectedMode === mode.id ? 'bg-black/10' : 'bg-white/5 text-primary'}`}>
                                                    <span className="material-symbols-outlined block">{mode.icon}</span>
                                                </div>
                                                <div className="text-left w-full z-10">
                                                    <span className="block font-bold text-sm leading-tight">
                                                        {mode.label}
                                                    </span>
                                                    <span className={`block text-[11px] font-medium ${selectedMode === mode.id ? 'opacity-80' : 'text-white/40'}`}>
                                                        {mode.description}
                                                    </span>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stats Display */}
                            <div className="px-6 py-1">
                                <div className="flex items-end justify-between mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
                                            Distância
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-white text-5xl font-bold tracking-tighter leading-none tabular-nums">
                                                {(distance || 0).toFixed(2).replace('.', ',')}
                                            </span>
                                            <span className="text-primary text-xl font-bold">km</span>
                                        </div>
                                    </div>
                                    {!isRunning && (
                                        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                                            <span className="material-symbols-outlined text-white/60 text-[16px]">hiking</span>
                                            <span className="text-[10px] font-medium text-white/80">Corrida</span>
                                        </div>
                                    )}
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-dark/50 border border-white/5">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="material-symbols-outlined text-primary text-[16px]">speed</span>
                                            <span className="text-white/60 text-[10px] font-bold uppercase">Ritmo Atual</span>
                                        </div>
                                        <span className="text-white text-xl font-bold tabular-nums">
                                            {currentPace || '--:--'}
                                        </span>
                                        <span className="text-white/30 text-[9px]">min/km</span>
                                    </div>

                                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-dark/50 border border-white/5">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="material-symbols-outlined text-purple-400 text-[16px]">avg_pace</span>
                                            <span className="text-white/60 text-[10px] font-bold uppercase">Ritmo Médio</span>
                                        </div>
                                        <span className="text-white text-xl font-bold tabular-nums">{averagePace || '--:--'}</span>
                                        <span className="text-white/30 text-[9px]">min/km</span>
                                    </div>

                                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-dark/50 border border-white/5">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="material-symbols-outlined text-blue-400 text-[16px]">schedule</span>
                                            <span className="text-white/60 text-[10px] font-bold uppercase">Tempo</span>
                                        </div>
                                        <span className="text-white text-xl font-bold tabular-nums">{formatTime(elapsedTime)}</span>
                                        <span className="text-white/30 text-[9px]">h:m:s</span>
                                    </div>

                                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-dark/50 border border-white/5">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="material-symbols-outlined text-rose-500 text-[16px]">local_fire_department</span>
                                            <span className="text-white/60 text-[10px] font-bold uppercase">Calorias</span>
                                        </div>
                                        <span className="text-white text-xl font-bold tabular-nums">{Math.round(distance * 65)}</span>
                                        <span className="text-white/30 text-[9px]">kcal</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Action Buttons */}
                <div className="px-6 pb-6 pt-2">
                    <div className="flex items-center gap-4">
                        {isRunning ? (
                            <>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleStopRun}
                                    className="flex size-14 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30 text-red-500"
                                >
                                    <span className="material-symbols-outlined">stop</span>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handlePauseResume}
                                    className={`flex-1 h-16 rounded-full font-extrabold text-xl shadow-lg flex items-center justify-center gap-3 ${isPaused
                                        ? 'bg-primary text-background-dark shadow-glow-primary'
                                        : 'bg-orange-500 text-white'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-3xl">
                                        {isPaused ? 'play_arrow' : 'pause'}
                                    </span>
                                    {isPaused ? 'RETOMAR' : 'PAUSAR'}
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setPanelExpanded(!panelExpanded)}
                                    className="flex size-14 items-center justify-center rounded-full bg-surface-dark border border-white/10 text-white/80"
                                >
                                    <span className="material-symbols-outlined">
                                        {panelExpanded ? 'expand_more' : 'expand_less'}
                                    </span>
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="flex size-14 items-center justify-center rounded-full bg-surface-dark border border-white/10 text-white/80"
                                >
                                    <span className="material-symbols-outlined">music_note</span>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleStartRun}
                                    disabled={!gpsReady}
                                    className="flex-1 h-16 bg-primary hover:bg-primary-dark text-background-dark rounded-full font-extrabold text-xl shadow-glow-primary disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                                    <span>INICIAR</span>
                                    <div className="bg-background-dark/10 rounded-full p-1">
                                        <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="flex size-14 items-center justify-center rounded-full bg-surface-dark border border-white/10 text-white/80"
                                >
                                    <span className="material-symbols-outlined">tune</span>
                                </motion.button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Map Type Selector Modal */}
            <AnimatePresence>
                {showMapTypeSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[2000] flex items-end"
                        onClick={() => setShowMapTypeSelector(false)}
                    >
                        <div className="absolute inset-0 bg-black/60" />
                        <motion.div
                            initial={{ y: 300 }}
                            animate={{ y: 0 }}
                            exit={{ y: 300 }}
                            className="relative w-full bg-background-dark rounded-t-3xl p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-center mb-4">
                                <div className="h-1.5 w-12 rounded-full bg-white/30" />
                            </div>

                            <h3 className="text-white font-bold text-lg mb-4">Estilo do mapa</h3>

                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {mapLayers.map((layer) => (
                                    <motion.button
                                        key={layer.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSelectedLayer(layer.id);
                                            setShowMapTypeSelector(false);
                                        }}
                                        className={`flex flex-col items-center p-3 rounded-xl ${selectedLayer === layer.id
                                            ? 'bg-primary/20 border-2 border-primary'
                                            : 'bg-surface-dark border border-white/10'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-lg mb-2 flex items-center justify-center ${selectedLayer === layer.id ? 'bg-primary/30' : 'bg-white/10'
                                            }`}>
                                            <span className={`material-symbols-outlined text-2xl ${selectedLayer === layer.id ? 'text-primary' : 'text-white/60'
                                                }`}>
                                                {layer.icon}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-medium ${selectedLayer === layer.id ? 'text-primary' : 'text-white/80'
                                            }`}>
                                            {layer.label}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StartRun;
