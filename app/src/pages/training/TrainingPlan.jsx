import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useTrainingStore } from '../../store/trainingStore';
import TopAppBar from '../../components/common/TopAppBar';
import Card from '../../components/common/Card';
import { ROUTES } from '../../constants';

const TrainingPlan = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const {
        profile,
        currentPlan,
        getTodayWorkout,
        isWorkoutComplete,
        getWeeklyProgress
    } = useTrainingStore();

    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('running'); // 'running', 'gym'

    useEffect(() => {
        if (!profile.isSetupComplete) {
            navigate(ROUTES.PERSONAL_SETUP);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(false);
            // Default to gym tab if the plan is gym-based
            if (currentPlan?.weeklyPlan?.[0]?.type === 'gym') {
                setTab('gym');
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [profile, navigate, currentPlan]);

    if (!profile.isSetupComplete) return null;

    const todayWorkout = getTodayWorkout();
    const weeklyProgress = getWeeklyProgress();

    const getIntensityColor = (intensity) => {
        switch (intensity) {
            case 'high': return 'bg-red-500';
            case 'med': return 'bg-orange-500';
            case 'low': return 'bg-primary';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <TopAppBar
                title="Planilha de Treino"
                showNotifications
                rightAction={
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(ROUTES.AI_PERSONAL)}
                        className="size-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20"
                    >
                        <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
                    </motion.button>
                }
            />

            {/* Coach Insights Section */}
            <div className="px-4 py-4">
                <Card className="bg-gradient-to-br from-[#ff6b35] to-[#ff9f1c] border-none shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-white">psychology</span>
                            <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Dica do Treinador</span>
                        </div>
                        <h3 className="text-white font-bold text-lg leading-tight mb-2">
                            Mantenha a consistência, {user?.name?.split(' ')[0] || 'Atleta'}!
                        </h3>
                        <p className="text-white/90 text-sm italic">
                            "A fase de base é onde construímos o motor. Não pule os treinos regenerativos, eles são fundamentais para sua evolução."
                        </p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 opacity-20">
                        <span className="material-symbols-outlined text-white text-9xl">sports_score</span>
                    </div>
                </Card>
            </div>

            {/* Tab Selection */}
            <div className="px-4 mb-6">
                <div className="flex bg-gray-100 dark:bg-surface-dark rounded-2xl p-1.5 shadow-inner">
                    <button
                        onClick={() => setTab('running')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'running'
                            ? 'bg-white dark:bg-surface-dark-highlight text-primary shadow-lg shadow-black/10'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        <span className="material-symbols-outlined">directions_run</span>
                        Planilha Corrida
                    </button>
                    <button
                        onClick={() => setTab('gym')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'gym'
                            ? 'bg-white dark:bg-surface-dark-highlight text-primary shadow-lg shadow-black/10'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        <span className="material-symbols-outlined">fitness_center</span>
                        Ficha Academia
                    </button>
                </div>
            </div>

            <main className="flex-1 px-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm">Montando sua ficha personalizada...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {tab === 'running' ? (
                            <motion.div
                                key="running"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col gap-4"
                            >
                                <div className="flex justify-between items-center px-1">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentPlan.name}</h2>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">Progresso: {weeklyProgress.percentage}% esta semana</p>
                                    </div>
                                    <button className="p-2 rounded-full bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined">calendar_month</span>
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3 mt-2">
                                    {currentPlan.weeklyPlan.map((w, i) => (
                                        <motion.div
                                            key={i}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Card className={`flex items-center gap-4 border-l-4 transition-all p-4 ${isWorkoutComplete(w.day) ? 'border-l-green-500 opacity-80' : 'border-l-transparent'}`}>
                                                <div className="flex flex-col items-center min-w-[36px]">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{w.day.slice(0, 3)}</span>
                                                    <div className={`mt-1 size-1.5 rounded-full ${getIntensityColor(w.intensity)}`} />
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{w.title}</h4>
                                                    {w.duration > 0 && (
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                                                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                                {w.duration} min
                                                            </div>
                                                            {w.pace && (
                                                                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                                                                    <span className="material-symbols-outlined text-[14px]">speed</span>
                                                                    {w.pace}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {w.type !== 'descanso' && !isWorkoutComplete(w.day) && (
                                                    <button
                                                        onClick={() => navigate(ROUTES.RECORD, { state: { workout: w } })}
                                                        className="flex items-center justify-center size-10 rounded-xl bg-primary shadow-lg shadow-primary/20 text-background-dark"
                                                    >
                                                        <span className="material-symbols-outlined">play_arrow</span>
                                                    </button>
                                                )}
                                                {isWorkoutComplete(w.day) && (
                                                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                                        <span className="material-symbols-outlined">check_circle</span>
                                                    </div>
                                                )}
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="gym"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col gap-4"
                            >
                                <div className="flex justify-between items-center px-1">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Ficha de Força</h2>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">Treinos focados em carga</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-xl bg-surface-dark-highlight text-white text-xs font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">history</span>
                                            Histórico
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 mt-2">
                                    {currentPlan.weeklyPlan.filter(w => w.type === 'gym').map((workout, idx) => (
                                        <div key={idx} className="space-y-3">
                                            <h3 className="text-primary font-bold text-sm px-1 uppercase">{workout.title} - {workout.day}</h3>
                                            {workout.exercises?.map((ex, i) => (
                                                <Card key={i} className="p-4 bg-white dark:bg-surface-dark shadow-sm">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-base">{ex.name}</h4>
                                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Hipertrofia</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2 text-center">
                                                            <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Séries</span>
                                                            <span className="text-sm font-black text-primary">{ex.sets}</span>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2 text-center">
                                                            <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Reps</span>
                                                            <span className="text-sm font-black text-primary">{ex.reps}</span>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2 text-center">
                                                            <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">RPE</span>
                                                            <span className="text-sm font-black text-orange-400">8</span>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(ROUTES.GYM_WORKOUT)}
                                    className="w-full py-4 mt-4 bg-primary text-background-dark font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined font-black">fitness_center</span>
                                    ABRIR TREINO DO DIA
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
};

export default TrainingPlan;
