import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymStore } from '../../store/gymStore';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants';
import { getExerciseGifUrl } from '../../data/exerciseData';
import { getExercises } from '../../services/exerciseApi';

const GymHome = () => {
    const navigate = useNavigate();
    const { profile } = useAuthStore();
    const {
        gymProfile,
        currentGymPlan,
        activeWorkout,
        startWorkout,
        workoutLogs,
        resetGymProfile
    } = useGymStore();

    const [selectedDayIndex, setSelectedDayIndex] = useState(null);
    const [showDayDetail, setShowDayDetail] = useState(false);
    const [previews, setPreviews] = useState([]);

    // Load previews for the library card
    useEffect(() => {
        const loadPreviews = async () => {
            const { data } = await getExercises(12);
            if (data) {
                // Filter ones that actually have media and randomize/shuffle a bit
                const valid = data.filter(ex => ex.media_url || ex.gif_path)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 6);
                setPreviews(valid);
            }
        };
        loadPreviews();
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        const name = profile?.full_name?.split(' ')[0] || 'Atleta';
        if (hour < 12) return `Bom dia, ${name}!`;
        if (hour < 18) return `Boa tarde, ${name}!`;
        return `Boa noite, ${name}!`;
    }, [profile]);

    // Not configured - show setup prompt
    if (!gymProfile.isSetupComplete || !currentGymPlan) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-background-dark/90 backdrop-blur-md border-b border-white/10 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2"
                        >
                            <span className="material-symbols-outlined text-white">arrow_back</span>
                        </motion.button>
                        <h1 className="text-white font-bold text-lg">Academia</h1>
                    </div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    {/* Animated Icon */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative mb-8"
                    >
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-400 text-6xl">fitness_center</span>
                        </div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30"
                        />
                    </motion.div>

                    <h1 className="text-white text-3xl font-bold text-center mb-3">
                        Treino de Academia
                    </h1>
                    <p className="text-white/60 text-center mb-8 max-w-xs">
                        Monte seu plano de treino personalizado baseado nos seus objetivos
                    </p>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
                        {[
                            { icon: 'trending_up', label: 'Hipertrofia', color: 'text-purple-400' },
                            { icon: 'bolt', label: 'Força', color: 'text-red-400' },
                            { icon: 'local_fire_department', label: 'Definição', color: 'text-orange-400' },
                            { icon: 'timer', label: 'Resistência', color: 'text-blue-400' },
                        ].map((item, i) => (
                            <div key={i} className="bg-surface-dark rounded-xl p-4 border border-white/5 flex items-center gap-3">
                                <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                                <span className="text-white/80 text-sm">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(ROUTES.GYM_SETUP)}
                        className="w-full max-w-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-lg"
                    >
                        <span className="material-symbols-outlined">rocket_launch</span>
                        Criar Meu Plano
                    </motion.button>
                </div>
            </div>
        );
    }

    // Get workout stats
    const totalWorkouts = workoutLogs.length;
    const thisWeekWorkouts = workoutLogs.filter(log => {
        const logDate = new Date(log.startTime);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= weekAgo;
    }).length;

    const selectedDay = selectedDayIndex !== null ? currentGymPlan.days[selectedDayIndex] : null;

    return (
        <div className="min-h-screen bg-background-dark pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-lg border-b border-white/5 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(-1)}
                            className="bg-white/5 p-2 rounded-xl border border-white/10"
                        >
                            <span className="material-symbols-outlined text-white text-xl">arrow_back</span>
                        </motion.button>
                        <div>
                            <h2 className="text-white/40 text-xs font-bold uppercase tracking-widest leading-none mb-1">{greeting}</h2>
                            <h1 className="text-white font-black text-xl leading-none">Minha Academia</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(ROUTES.WORKOUT_HISTORY)}
                            className="p-2 -mr-2 text-white/50 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-white/50">history</span>
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                if (confirm('Resetar plano de treino?')) {
                                    resetGymProfile();
                                }
                            }}
                            className="bg-white/5 p-2 rounded-xl border border-white/10"
                        >
                            <span className="material-symbols-outlined text-white/50">settings_suggest</span>
                        </motion.button>
                    </div>
                </div>
            </header>

            <main className="px-5 py-6 space-y-8">
                {/* Dashboard Summary */}
                <div className="bg-surface-dark rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 blur-3xl -ml-12 -mb-12" />

                    <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-white font-black text-lg">{currentGymPlan.name}</h3>
                                <p className="text-purple-400 text-sm font-bold uppercase tracking-wider">{currentGymPlan.split}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <span className="material-symbols-outlined text-white">monitoring</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Esta Semana</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-white">{thisWeekWorkouts}</span>
                                    <span className="text-white/30 text-xs">/ {gymProfile.frequency}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total</p>
                                <span className="text-2xl font-black text-white">{totalWorkouts}</span>
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Nível</p>
                                <span className="text-sm font-bold text-gradient-purple capitalize">{gymProfile.level}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Workout Banner */}
                {activeWorkout && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => navigate(ROUTES.GYM_WORKOUT)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-5 shadow-xl shadow-purple-500/20 relative overflow-hidden cursor-pointer"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl -mr-16 -mt-16 rounded-full" />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                        <span className="material-symbols-outlined text-white text-2xl animate-pulse">fitness_center</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 bg-green-400 rounded-full animate-pulse" />
                                            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Treino em andamento</p>
                                        </div>
                                        <p className="text-white font-black text-xl leading-tight">{activeWorkout.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {(() => {
                                        const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
                                        const completedSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
                                        const progress = Math.round((completedSets / totalSets) * 100);
                                        return (
                                            <div className="flex flex-col items-end">
                                                <span className="text-white font-black text-2xl">{progress}%</span>
                                                <span className="text-white/60 text-[10px] uppercase font-bold">concluído</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {(() => {
                                const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
                                const completedSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
                                const progress = (completedSets / totalSets) * 100;
                                return (
                                    <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        />
                                    </div>
                                );
                            })()}

                            <div className="flex items-center justify-between mt-4">
                                <p className="text-white/60 text-xs font-medium">
                                    {activeWorkout.exercises.length} exercícios no total
                                </p>
                                <span className="text-white text-xs font-bold flex items-center gap-1">
                                    Continuar treinado
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Next Workout Suggestion (if no active workout) */}
                {!activeWorkout && currentGymPlan && (
                    <div className="bg-surface-dark rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest">Próximo Treino</h3>
                            <button
                                onClick={() => navigate(ROUTES.WORKOUT_HISTORY)}
                                className="text-purple-400 text-xs font-bold flex items-center gap-1"
                            >
                                HISTÓRICO
                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                        </div>

                        {(() => {
                            const lastId = gymProfile.lastCompletedDayId;
                            const days = currentGymPlan.days;
                            const lastIndex = days.findIndex(d => d.id === lastId);
                            const nextIndex = (lastIndex + 1) % days.length;
                            const nextDay = days[nextIndex];

                            return (
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                                        <span className="text-purple-400 text-3xl font-black">{nextDay.letter}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold text-lg">{nextDay.name}</h4>
                                        <p className="text-white/40 text-sm">
                                            {nextDay.muscleGroups.join(' • ')}
                                        </p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            setSelectedDayIndex(nextIndex);
                                            setShowDayDetail(true);
                                        }}
                                        className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
                                    >
                                        <span className="material-symbols-outlined text-white">play_arrow</span>
                                    </motion.button>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Weekly Progress */}
                <section className="bg-surface-dark rounded-2xl p-4 border border-white/10">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400 text-xl">insights</span>
                        Progresso Semanal
                    </h3>

                    <div className="flex justify-between items-end h-24 px-2">
                        {(() => {
                            const days = ['D', '2ª', '3ª', '4ª', '5ª', '6ª', 'S'];
                            const today = new Date();
                            const weekDays = [];

                            for (let i = 6; i >= 0; i--) {
                                const date = new Date();
                                date.setDate(today.getDate() - i);
                                const isWorkoutDone = workoutLogs.some(log =>
                                    new Date(log.endTime).toDateString() === date.toDateString()
                                );
                                const dayName = days[date.getDay()];
                                const isToday = i === 0;

                                weekDays.push({ dayName, isWorkoutDone, isToday });
                            }

                            return weekDays.map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: day.isWorkoutDone ? '60px' : '10px' }}
                                        className={`w-2.5 rounded-full transition-all duration-500 ${day.isWorkoutDone
                                            ? 'bg-gradient-to-t from-purple-600 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                                            : 'bg-white/10'
                                            }`}
                                    />
                                    <span className={`text-[10px] font-bold ${day.isToday ? 'text-purple-400' : 'text-white/30'}`}>
                                        {day.dayName}
                                    </span>
                                </div>
                            ));
                        })()}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <p className="text-white/50 text-xs">
                            Meta semanal: <span className="text-white font-bold">{gymProfile.frequency} treinos</span>
                        </p>
                        <div className="flex -space-x-2">
                            {workoutLogs.slice(-3).map((log, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-surface-dark border-2 border-background-dark flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-purple-400 text-[14px]">check_circle</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Workout Days */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-400">view_week</span>
                            Sua Divisão
                        </h3>
                        <p className="text-white/30 text-xs uppercase tracking-widest font-bold">
                            {currentGymPlan.split}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {currentGymPlan.days.map((day, index) => {
                            const isDone = gymProfile.lastCompletedDayId === day.id;

                            return (
                                <motion.button
                                    key={day.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setSelectedDayIndex(index);
                                        setShowDayDetail(true);
                                    }}
                                    className={`w-full relative group p-5 rounded-3xl border transition-all text-left flex items-center gap-5 ${isDone ? 'bg-white/5 border-white/5 opacity-60' : 'bg-surface-dark border-white/10 hover:border-purple-500/30'
                                        }`}
                                >
                                    {/* Glass Background Highlight */}
                                    {!isDone && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                    )}

                                    {/* Day Letter - Premium Version */}
                                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden ${isDone ? 'bg-white/10' : 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-xl shadow-purple-500/20'
                                        }`}>
                                        <span className="text-white text-3xl font-black relative z-10">{day.letter}</span>
                                        {/* Subtle Shine */}
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`font-black text-xl tracking-tight truncate ${isDone ? 'text-white/50' : 'text-white'}`}>
                                                {day.name}
                                            </h4>
                                            {isDone && (
                                                <div className="bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px] text-green-400 font-bold">check_circle</span>
                                                    <span className="text-[10px] text-green-400 font-black tracking-widest uppercase">OK</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                                {day.exercises.length} EXERCÍCIOS
                                            </p>
                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                            <p className="text-purple-400/80 text-[10px] font-black uppercase tracking-widest truncate">
                                                {day.muscleGroups.join(' • ')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDone ? 'text-white/10' : 'bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white'
                                        }`}>
                                        <span className="material-symbols-outlined text-2xl">chevron_right</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </section>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(ROUTES.GYM_EXERCISES)}
                    className="w-full relative group rounded-3xl border border-white/10 bg-surface-dark overflow-hidden shadow-2xl transition-all hover:border-purple-500/30"
                >
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 opacity-50" />

                    {/* GIF Previews Grid */}
                    <div className="relative h-28 flex">
                        {previews.length > 0 ? (
                            previews.map((ex, i) => (
                                <div key={i} className="flex-1 h-full overflow-hidden relative border-r border-white/5 last:border-0 transform hover:scale-110 transition-transform duration-500 z-0">
                                    <img
                                        src={getExerciseGifUrl(ex.media_url || ex.gif_path)}
                                        alt={ex.name}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent opacity-80" />
                                </div>
                            ))
                        ) : (
                            // Placeholder while loading
                            <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center">
                                <span className="material-symbols-outlined text-white/10 text-4xl">fitness_center</span>
                            </div>
                        )}

                        {/* Overlay to fade the exercise images */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-dark" />
                    </div>

                    <div className="p-5 relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/40 transform group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-outlined text-white text-3xl">exercise</span>
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-black text-xl tracking-tight leading-tight">Biblioteca VIP</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-purple-500/20">
                                        100+ Exercícios
                                    </span>
                                    <span className="text-white/40 text-xs">• GIFs em HD</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-background-dark transition-colors">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </div>

                    {/* Shimmer Effect */}
                    <div
                        className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg]"
                        style={{
                            animation: 'shimmer 3s infinite'
                        }}
                    />
                </motion.button>
            </main>

            {/* Day Detail Modal */}
            <AnimatePresence>
                {showDayDetail && selectedDay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-end"
                        onClick={() => setShowDayDetail(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-surface-dark rounded-t-3xl max-h-[85vh] overflow-hidden"
                        >
                            {/* Handle */}
                            <div className="flex justify-center py-3">
                                <div className="w-12 h-1 bg-white/30 rounded-full" />
                            </div>

                            <div className="px-4 pb-8 overflow-auto max-h-[calc(85vh-50px)]">
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <span className="text-white text-3xl font-bold">{selectedDay.letter}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-white text-xl font-bold">{selectedDay.name}</h2>
                                        <p className="text-white/60">{selectedDay.exercises.length} exercícios</p>
                                    </div>
                                </div>

                                {/* Muscle Groups */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {selectedDay.muscleGroups.map((muscle, i) => (
                                        <span key={i} className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium capitalize">
                                            {muscle}
                                        </span>
                                    ))}
                                </div>

                                {/* Exercises List */}
                                <div className="space-y-3 mb-6">
                                    {selectedDay.exercises.map((exercise, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-white/5 rounded-xl flex items-center gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                <span className="text-white font-bold">{index + 1}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{exercise.name}</p>
                                                <p className="text-white/50 text-sm">
                                                    {exercise.sets} séries × {exercise.reps} reps
                                                </p>
                                            </div>
                                            <span className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded capitalize">
                                                {exercise.equipment}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Start Button */}
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        startWorkout(selectedDay.id);
                                        setShowDayDetail(false);
                                        navigate(ROUTES.GYM_WORKOUT);
                                    }}
                                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">play_arrow</span>
                                    Iniciar Treino
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(ROUTES.GYM_EXERCISES)}
                className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 z-50 text-white"
            >
                <span className="material-symbols-outlined text-2xl">animated_images</span>
            </motion.button>
        </div>
    );
};

export default GymHome;
