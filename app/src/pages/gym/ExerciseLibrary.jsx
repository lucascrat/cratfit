import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getMuscleGroups, getExercises, searchExercises, getExercisesCount } from '../../services/exerciseApi';
import { getExerciseGifUrl, muscleGroups as localMuscleGroups } from '../../data/exerciseData';
import { useGymStore } from '../../store/gymStore';
import { ROUTES } from '../../constants';

const ExerciseLibrary = () => {
    const navigate = useNavigate();
    const { currentGymPlan, addExerciseToDay } = useGymStore();

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    // Data states
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [totalExercises, setTotalExercises] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [exerciseToAdd, setExerciseToAdd] = useState(null);
    const [addConfig, setAddConfig] = useState({ sets: 4, reps: '10-12', selectedDay: null });
    const [addedExercises, setAddedExercises] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);

    // Fullscreen GIF viewer
    const [fullscreenGif, setFullscreenGif] = useState(null);

    // Promo video state
    const [promoVideoUrl, setPromoVideoUrl] = useState('/gym_animation.webm');

    // Vídeo promocional servido pela API própria
    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';
        if (apiBase) {
            const remoteUrl = `${apiBase}/uploads/promo/gym_animation.webm`;
            fetch(remoteUrl, { method: 'HEAD' })
                .then((r) => { if (r.ok) setPromoVideoUrl(remoteUrl); })
                .catch(() => {}); // fallback silencioso para /gym_animation.webm
        }
    }, []);

    // Carregar grupos musculares e exercícios do Supabase
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Carregar grupos musculares
            const { data: groupsData, error: groupsError } = await getMuscleGroups();
            if (groupsError) {
                console.warn('Erro ao carregar grupos do Supabase:', groupsError);
                setMuscleGroups(localMuscleGroups);
            } else if (groupsData && groupsData.length > 0) {
                setMuscleGroups(groupsData);
            } else {
                setMuscleGroups(localMuscleGroups);
            }

            // Carregar exercícios do Supabase
            const { data: exercisesData, error: exercisesError } = await searchExercises(searchQuery, selectedGroup);

            if (exercisesError) {
                console.warn('Erro ao carregar exercícios do Supabase:', exercisesError);
                // Fallback para dados locais apenas em caso de ERRO
                const { exerciseDatabase } = await import('../../data/exerciseData');
                let localExercises = [];

                if (selectedGroup) {
                    localExercises = exerciseDatabase[selectedGroup] || [];
                } else {
                    Object.values(exerciseDatabase).forEach(group => {
                        localExercises.push(...group);
                    });
                }

                // Filtrar por busca
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    localExercises = localExercises.filter(ex =>
                        ex.name.toLowerCase().includes(query) ||
                        ex.primaryMuscle?.toLowerCase().includes(query) ||
                        ex.equipment?.toLowerCase().includes(query)
                    );
                }

                setExercises(localExercises);
                setTotalExercises(Object.values(exerciseDatabase).reduce((total, group) => total + group.length, 0));
            } else {
                // Usar dados do Supabase (mesmo se vazio)
                const mappedExercises = (exercisesData || []).map(ex => ({
                    ...ex,
                    primaryMuscle: ex.primary_muscle,
                    secondaryMuscles: ex.secondary_muscles || [],
                    gif: ex.media_url || ex.gif_path,
                }));
                setExercises(mappedExercises);

                // Carregar contagem total
                const { count } = await getExercisesCount();
                setTotalExercises(count || mappedExercises.length);
            }

        } catch (err) {
            console.error('Erro ao carregar dados, usando fallback local:', err);
            // Fallback para dados locais em caso de erro
            const { exerciseDatabase } = await import('../../data/exerciseData');
            let localExercises = [];

            if (selectedGroup) {
                localExercises = exerciseDatabase[selectedGroup] || [];
            } else {
                Object.values(exerciseDatabase).forEach(group => {
                    localExercises.push(...group);
                });
            }

            setExercises(localExercises);
            setMuscleGroups(localMuscleGroups);
            setTotalExercises(Object.values(exerciseDatabase).reduce((total, group) => total + group.length, 0));
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedGroup]);

    // Carregar dados quando o componente montar ou filtros mudarem
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Debounce para busca
    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Exercícios filtrados (já vem filtrado do servidor)
    const filteredExercises = exercises;

    // Abrir modal para adicionar exercício
    const openAddModal = (exercise, e) => {
        e?.stopPropagation();
        setExerciseToAdd(exercise);
        setAddConfig({ sets: 4, reps: '10-12', selectedDay: currentGymPlan?.days?.[0]?.id || null });
        setShowAddModal(true);
    };

    // Confirmar adição do exercício
    const confirmAddExercise = () => {
        if (!exerciseToAdd || !addConfig.selectedDay) return;

        const newExercise = {
            ...exerciseToAdd,
            sets: addConfig.sets,
            reps: addConfig.reps,
            weight: null,
            completed: false
        };

        if (addExerciseToDay) {
            addExerciseToDay(addConfig.selectedDay, newExercise);
        }

        setAddedExercises([...addedExercises, exerciseToAdd.id]);
        setShowAddModal(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const isExerciseAdded = (exerciseId) => addedExercises.includes(exerciseId);

    const getDifficultyBadge = (difficulty) => {
        const badges = {
            iniciante: { label: 'Iniciante', color: 'bg-green-500/20 text-green-400' },
            intermediario: { label: 'Intermediário', color: 'bg-yellow-500/20 text-yellow-400' },
            avancado: { label: 'Avançado', color: 'bg-red-500/20 text-red-400' }
        };
        return badges[difficulty] || badges.iniciante;
    };

    const getEquipmentIcon = (equipment) => {
        const icons = {
            barra: 'fitness_center',
            halteres: 'exercise',
            halter: 'exercise',
            maquina: 'precision_manufacturing',
            cabo: 'cable',
            corpo: 'accessibility_new',
            smith: 'apps',
        };
        return icons[equipment] || 'fitness_center';
    };

    const getGroupColor = (groupId) => {
        const group = muscleGroups.find(g => g.id === groupId);
        return group?.color || 'from-gray-500 to-gray-600';
    };

    // Abrir GIF em tela cheia
    const openFullscreenGif = (exercise) => {
        setFullscreenGif(exercise);
    };

    return (
        <div className="min-h-screen bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-md border-b border-white/5 pt-safe-top">
                <div className="px-3 py-3">
                    <div className="flex items-center gap-3 mb-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(-1)}
                            className="p-1.5 -ml-1"
                        >
                            <span className="material-symbols-outlined text-white text-xl">arrow_back</span>
                        </motion.button>
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-white">Biblioteca de Exercícios</h1>
                            <p className="text-white/50 text-xs">
                                {loading ? 'Carregando...' : `${totalExercises} exercícios com GIFs`} • Toque para ver
                            </p>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="p-2 rounded-lg bg-white/5"
                        >
                            <span className="material-symbols-outlined text-white/70 text-xl">
                                {viewMode === 'grid' ? 'view_list' : 'grid_view'}
                            </span>
                        </motion.button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-3">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar exercício..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary/50"
                        />
                        {searchQuery && (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <span className="material-symbols-outlined text-white/40 text-lg">close</span>
                            </motion.button>
                        )}
                    </div>

                    {/* Muscle Group Filter */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedGroup(null)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!selectedGroup ? 'bg-primary text-background-dark' : 'bg-white/5 text-white/70'
                                }`}
                        >
                            Todos
                        </motion.button>
                        {muscleGroups.map((group) => (
                            <motion.button
                                key={group.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedGroup(group.id)}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedGroup === group.id
                                    ? `bg-gradient-to-r ${group.color} text-white`
                                    : 'bg-white/5 text-white/70'
                                    }`}
                            >
                                {group.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="px-3 py-4 pb-24">
                {/* Group Header */}
                {selectedGroup && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <div className={`bg-gradient-to-r ${getGroupColor(selectedGroup)} rounded-xl p-4`}>
                            <h2 className="text-white font-bold text-lg">
                                {muscleGroups.find(g => g.id === selectedGroup)?.name}
                            </h2>
                            <p className="text-white/70 text-sm">{filteredExercises.length} exercícios com GIFs</p>
                        </div>
                    </motion.div>
                )}

                {searchQuery && (
                    <p className="text-white/50 text-sm mb-3">
                        {filteredExercises.length} resultado(s) para "{searchQuery}"
                    </p>
                )}

                {/* Promo Video Card - Professional Banner */}
                {!selectedGroup && !searchQuery && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20">
                            {/* Video Background */}
                            <div className="relative h-44 bg-gradient-to-br from-purple-900 to-pink-900">
                                <video
                                    src={promoVideoUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 via-transparent to-pink-900/60" />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                    Premium
                                                </span>
                                                <span className="text-white/60 text-xs">
                                                    Atualizado
                                                </span>
                                            </div>
                                            <h3 className="text-white font-bold text-lg leading-tight">Treinos com GIFs Animados</h3>
                                            <p className="text-white/70 text-xs mt-1">
                                                {totalExercises}+ exercícios • Todos os grupos musculares
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                                <span className="material-symbols-outlined text-white text-xl">play_arrow</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Animated Border */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                                    style={{
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 2s linear infinite'
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-white/50 text-sm">Carregando exercícios...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-red-400 text-5xl mb-3">error</span>
                        <p className="text-white/50 mb-4">{error}</p>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={loadData}
                            className="px-6 py-2 bg-primary text-background-dark rounded-xl font-medium"
                        >
                            Tentar novamente
                        </motion.button>
                    </div>
                )}

                {/* Exercises Grid */}
                {!loading && !error && viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredExercises.map((exercise, index) => (
                            <motion.div
                                key={exercise.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className="bg-surface-dark rounded-xl overflow-hidden border border-white/5 relative"
                            >
                                {/* Added Badge */}
                                {isExerciseAdded(exercise.id) && (
                                    <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">check</span>
                                        Adicionado
                                    </div>
                                )}

                                {/* Exercise GIF - Clickable */}
                                <div
                                    className="relative aspect-square bg-black/30 cursor-pointer"
                                    onClick={() => openFullscreenGif(exercise)}
                                >
                                    <img
                                        src={getExerciseGifUrl(exercise.gif)}
                                        alt={exercise.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                        onError={(e) => {
                                            if (!e.target.dataset.fallback) {
                                                e.target.dataset.fallback = 'true';
                                                e.target.classList.add('hidden');
                                                e.target.nextElementSibling.classList.remove('hidden');
                                            }
                                        }}
                                    />

                                    {/* Abstract Fallback for broken images */}
                                    <div className="hidden absolute inset-0 bg-gradient-to-br from-purple-900/40 to-black flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                                        <div className="absolute inset-0 opacity-20">
                                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/30 via-transparent to-transparent -translate-y-1/2" />
                                        </div>
                                        <span className="material-symbols-outlined text-white/10 text-6xl mb-2 rotate-12">fitness_center</span>
                                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest leading-tight">{exercise.name}</p>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-transparent to-transparent opacity-80" />

                                    {/* Play indicator */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 transform hover:scale-110">
                                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                                            <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                                        </div>
                                    </div>

                                    {/* Add Button */}
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => openAddModal(exercise, e)}
                                        className="absolute top-2 right-2 w-9 h-9 bg-primary text-background-dark rounded-xl flex items-center justify-center shadow-lg z-30 transition-transform active:scale-95"
                                    >
                                        <span className="material-symbols-outlined font-black">add</span>
                                    </motion.button>

                                    {/* Difficulty Badge */}
                                    <div className="absolute bottom-2 left-2">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getDifficultyBadge(exercise.difficulty).color.includes('green') ? 'bg-green-500/20 border-green-500/30 text-green-400' : getDifficultyBadge(exercise.difficulty).color.includes('yellow') ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' : 'bg-red-500/20 border-red-500/30 text-red-500'}`}>
                                            {getDifficultyBadge(exercise.difficulty).label}
                                        </span>
                                    </div>
                                </div>

                                {/* Exercise Info */}
                                <div className="p-3 bg-surface-dark border-t border-white/5">
                                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                        {exercise.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest truncate">{exercise.primaryMuscle || 'Musculação'}</p>
                                        <div className="flex items-center gap-1 text-primary">
                                            <span className="material-symbols-outlined text-[10px]">{getEquipmentIcon(exercise.equipment)}</span>
                                            <span className="text-[9px] font-black uppercase">{exercise.equipment || 'Livre'}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : !loading && !error && viewMode === 'list' ? (
                    <div className="space-y-2">
                        {filteredExercises.map((exercise, index) => (
                            <motion.div
                                key={exercise.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="bg-surface-dark rounded-xl p-3 flex items-center gap-3 border border-white/5"
                            >
                                {/* Thumbnail - Clickable */}
                                <div
                                    className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black/30 relative cursor-pointer"
                                    onClick={() => openFullscreenGif(exercise)}
                                >
                                    <img
                                        src={getExerciseGifUrl(exercise.gif)}
                                        alt={exercise.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {isExerciseAdded(exercise.id) && (
                                        <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-lg">check</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <span className="material-symbols-outlined text-white/70 text-sm">fullscreen</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium text-sm truncate">{exercise.name}</h3>
                                    <p className="text-white/50 text-xs capitalize">{exercise.primaryMuscle} • {exercise.equipment}</p>
                                    <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] ${getDifficultyBadge(exercise.difficulty).color}`}>
                                        {getDifficultyBadge(exercise.difficulty).label}
                                    </span>
                                </div>

                                {/* Add Button */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => openAddModal(exercise, e)}
                                    className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0"
                                >
                                    <span className="material-symbols-outlined text-background-dark">add</span>
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                ) : null}

                {!loading && !error && filteredExercises.length === 0 && (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-white/20 text-5xl mb-3">search_off</span>
                        <p className="text-white/50">Nenhum exercício encontrado</p>
                    </div>
                )}
            </main>

            {/* Fullscreen GIF Modal */}
            <AnimatePresence>
                {fullscreenGif && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col"
                        onClick={() => setFullscreenGif(null)}
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-white text-lg font-bold">{fullscreenGif.name}</h2>
                                    <p className="text-white/60 text-sm capitalize">{fullscreenGif.primaryMuscle} • {fullscreenGif.equipment}</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setFullscreenGif(null)}
                                    className="p-2 bg-white/10 rounded-full"
                                >
                                    <span className="material-symbols-outlined text-white">close</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* GIF */}
                        <div className="flex-1 flex items-center justify-center p-4">
                            <img
                                src={getExerciseGifUrl(fullscreenGif.gif)}
                                alt={fullscreenGif.name}
                                className="max-w-full max-h-full object-contain rounded-2xl"
                            />
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 to-transparent p-4 pb-safe-bottom">
                            <div className="bg-white/5 rounded-xl p-4 mb-4">
                                <h3 className="text-white font-medium mb-2">Como executar:</h3>
                                <p className="text-white/70 text-sm">{fullscreenGif.description}</p>
                            </div>

                            <div className="flex gap-3">
                                <span className={`px-3 py-1.5 rounded-full text-sm ${getDifficultyBadge(fullscreenGif.difficulty).color}`}>
                                    {getDifficultyBadge(fullscreenGif.difficulty).label}
                                </span>
                                {fullscreenGif.secondaryMuscles?.length > 0 && (
                                    <span className="px-3 py-1.5 bg-white/10 rounded-full text-white/70 text-sm capitalize">
                                        + {fullscreenGif.secondaryMuscles.join(', ')}
                                    </span>
                                )}
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openAddModal(fullscreenGif, e);
                                    setFullscreenGif(null);
                                }}
                                className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-emerald-400 rounded-xl font-bold text-background-dark flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                Adicionar ao Treino
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Exercise Modal */}
            <AnimatePresence>
                {showAddModal && exerciseToAdd && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-end"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-surface-dark rounded-t-3xl"
                        >
                            <div className="flex justify-center py-3">
                                <div className="w-12 h-1 bg-white/30 rounded-full" />
                            </div>

                            <div className="px-4 pb-8">
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/30">
                                        <img
                                            src={getExerciseGifUrl(exerciseToAdd.gif)}
                                            alt={exerciseToAdd.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-white text-lg font-bold">{exerciseToAdd.name}</h2>
                                        <p className="text-white/50 text-sm capitalize">{exerciseToAdd.primaryMuscle}</p>
                                    </div>
                                </div>

                                {/* Select Day */}
                                {currentGymPlan?.days?.length > 0 && (
                                    <div className="mb-4">
                                        <label className="text-white/70 text-sm mb-2 block">Adicionar ao treino:</label>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                            {currentGymPlan.days.map((day) => (
                                                <motion.button
                                                    key={day.id}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setAddConfig({ ...addConfig, selectedDay: day.id })}
                                                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${addConfig.selectedDay === day.id
                                                        ? 'bg-primary text-background-dark'
                                                        : 'bg-white/5 text-white/70'
                                                        }`}
                                                >
                                                    {day.letter} - {day.name.split('-')[1]?.trim() || day.name}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sets & Reps */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="text-white/70 text-sm mb-2 block">Séries</label>
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setAddConfig({ ...addConfig, sets: Math.max(1, addConfig.sets - 1) })}
                                                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined text-white">remove</span>
                                            </motion.button>
                                            <span className="text-white text-2xl font-bold w-10 text-center">{addConfig.sets}</span>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setAddConfig({ ...addConfig, sets: addConfig.sets + 1 })}
                                                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined text-white">add</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-white/70 text-sm mb-2 block">Repetições</label>
                                        <div className="grid grid-cols-2 gap-1">
                                            {['8-10', '10-12', '12-15', '15+'].map((rep) => (
                                                <motion.button
                                                    key={rep}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setAddConfig({ ...addConfig, reps: rep })}
                                                    className={`py-2 rounded-lg text-xs font-medium ${addConfig.reps === rep
                                                        ? 'bg-primary text-background-dark'
                                                        : 'bg-white/10 text-white/70'
                                                        }`}
                                                >
                                                    {rep}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Add Button */}
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={confirmAddExercise}
                                    disabled={!addConfig.selectedDay}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${addConfig.selectedDay
                                        ? 'bg-gradient-to-r from-primary to-emerald-400 text-background-dark'
                                        : 'bg-white/10 text-white/30'
                                        }`}
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Adicionar ao Treino
                                </motion.button>

                                {!currentGymPlan && (
                                    <p className="text-center text-white/50 text-sm mt-4">
                                        Crie um plano de treino primeiro para adicionar exercícios
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-4 right-4 z-[101]"
                    >
                        <div className="bg-green-500 rounded-xl p-4 flex items-center gap-3 shadow-lg">
                            <span className="material-symbols-outlined text-white">check_circle</span>
                            <span className="text-white font-medium">Exercício adicionado com sucesso!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExerciseLibrary;
