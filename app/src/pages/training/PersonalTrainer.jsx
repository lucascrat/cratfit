import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrainingStore } from '../../store/trainingStore';
import { ROUTES } from '../../constants';

const PersonalTrainer = () => {
    const navigate = useNavigate();
    const {
        profile,
        currentPlan,
        markWorkoutComplete,
        isWorkoutComplete,
        getTodayWorkout,
        resetProfile,
        getWeeklyProgress,
        getTrainingStreak,
        getWorkoutCompletionData
    } = useTrainingStore();
    const [selectedDay, setSelectedDay] = useState(null);
    const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);

    // Redirect to setup if not configured
    if (!profile.isSetupComplete || !currentPlan) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary text-5xl">fitness_center</span>
                </div>
                <h1 className="text-white text-2xl font-bold text-center mb-2">Personal Trainer</h1>
                <p className="text-white/60 text-center mb-8">Configure seu plano de treino personalizado</p>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(ROUTES.PERSONAL_SETUP)}
                    className="bg-primary text-background-dark font-bold py-4 px-8 rounded-full flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">rocket_launch</span>
                    Começar Configuração
                </motion.button>
            </div>
        );
    }

    const todayWorkout = getTodayWorkout();
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const today = days[new Date().getDay()];
    const isTodayComplete = isWorkoutComplete(today);
    const todayCompletionData = getWorkoutCompletionData(today);
    const weeklyProgress = getWeeklyProgress();
    const streak = getTrainingStreak();

    const getIntensityColor = (intensity) => {
        const colors = {
            'baixa': 'bg-green-500',
            'moderada': 'bg-yellow-500',
            'alta': 'bg-orange-500',
            'máxima': 'bg-red-500',
            'descanso': 'bg-blue-400',
            'recuperação': 'bg-cyan-400'
        };
        return colors[intensity] || 'bg-gray-500';
    };

    const getTypeIcon = (type) => {
        const icons = {
            'aerobico_leve': 'directions_walk',
            'aerobico_moderado': 'directions_run',
            'hiit': 'bolt',
            'intervalado': 'speed',
            'tempo': 'timer',
            'longo': 'route',
            'descanso': 'hotel',
            'recuperacao': 'self_improvement',
            'simulado': 'military_tech',
            'resistencia': 'fitness_center',
            'base': 'directions_run'
        };
        return icons[type] || 'directions_run';
    };

    const handleStartWorkout = (workout) => {
        // Navigate to run screen with workout data
        navigate(ROUTES.RECORD, { state: { workout } });
    };

    const selectedWorkout = selectedDay !== null ? currentPlan.weeklyPlan[selectedDay] : null;

    // Calculate weekly stats
    const weeklyCalories = currentPlan.weeklyPlan.reduce((sum, w) => sum + (w.calories || 0), 0);
    const weeklyDuration = currentPlan.weeklyPlan.reduce((sum, w) => sum + (w.duration || 0), 0);
    const trainingDays = currentPlan.weeklyPlan.filter(w => w.type !== 'descanso').length;

    return (
        <div className="min-h-screen bg-background-dark pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-dark/90 backdrop-blur-md border-b border-white/10 px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2"
                        >
                            <span className="material-symbols-outlined text-white">arrow_back</span>
                        </motion.button>
                        <div>
                            <h1 className="text-white font-bold text-lg">Personal Trainer</h1>
                            <p className="text-primary text-sm font-medium">{currentPlan.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {streak > 0 && (
                            <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-orange-400 text-sm">local_fire_department</span>
                                <span className="text-orange-400 text-sm font-bold">{streak}</span>
                            </div>
                        )}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                if (confirm('Resetar plano de treino?')) {
                                    resetProfile();
                                }
                            }}
                            className="p-2"
                        >
                            <span className="material-symbols-outlined text-white/50">settings</span>
                        </motion.button>
                    </div>
                </div>
            </header>

            <main className="px-4 py-4 space-y-6">
                {/* Weekly Progress Bar */}
                <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70 text-sm">Progresso Semanal</span>
                        <span className="text-primary font-bold">{weeklyProgress.completed}/{weeklyProgress.total}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full transition-all duration-500"
                            style={{ width: `${weeklyProgress.percentage}%` }}
                        />
                    </div>
                    <p className="text-white/50 text-xs mt-2">
                        {weeklyProgress.percentage}% - {weeklyProgress.completed === weeklyProgress.total ? '🎉 Semana completa!' : 'Continue assim!'}
                    </p>
                </div>

                {/* Today's Workout Card - Completed */}
                {todayWorkout && todayWorkout.type !== 'descanso' && isTodayComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-2xl bg-green-600"
                    >
                        <div className="relative p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
                                <span className="text-white font-bold">TREINO CONCLUÍDO!</span>
                            </div>
                            <h2 className="text-white text-xl font-bold mb-2">{todayWorkout.title}</h2>

                            {todayCompletionData?.activityData && (
                                <div className="flex items-center gap-4 mt-3">
                                    <div className="text-white/90">
                                        <span className="font-bold">{(Number(todayCompletionData.activityData.distance) || 0).toFixed(2)}</span>
                                        <span className="text-sm ml-1">km</span>
                                    </div>
                                    <div className="text-white/90">
                                        <span className="font-bold">{todayCompletionData.activityData.pace || '--:--'}</span>
                                        <span className="text-sm ml-1">/km</span>
                                    </div>
                                    <div className="text-white/90">
                                        <span className="font-bold">{todayCompletionData.activityData.calories || '--'}</span>
                                        <span className="text-sm ml-1">kcal</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Today's Workout Card - Not Completed */}
                {todayWorkout && todayWorkout.type !== 'descanso' && !isTodayComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-2xl"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${currentPlan.name.includes('Gordura') ? 'from-orange-600 to-red-600' :
                            currentPlan.name.includes('Pace') ? 'from-blue-600 to-cyan-600' :
                                'from-purple-600 to-pink-600'
                            }`} />
                        <div className="relative p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-white/80 text-sm font-medium">TREINO DE HOJE</span>
                                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{today}</span>
                            </div>
                            <h2 className="text-white text-2xl font-bold mb-2">{todayWorkout.title}</h2>
                            <p className="text-white/80 text-sm mb-4">{todayWorkout.description}</p>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-white text-lg">schedule</span>
                                    <span className="text-white font-bold">{todayWorkout.duration} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-white text-lg">local_fire_department</span>
                                    <span className="text-white font-bold">{todayWorkout.calories} kcal</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${getIntensityColor(todayWorkout.intensity)} text-white`}>
                                    {todayWorkout.intensity.toUpperCase()}
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleStartWorkout(todayWorkout)}
                                className="w-full py-4 bg-white text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">play_arrow</span>
                                Iniciar Treino
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Rest Day */}
                {todayWorkout && todayWorkout.type === 'descanso' && (
                    <div className="bg-surface-dark rounded-2xl p-6 border border-white/10 text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 mx-auto flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-blue-400 text-3xl">hotel</span>
                        </div>
                        <h2 className="text-white text-xl font-bold mb-2">Dia de Descanso</h2>
                        <p className="text-white/60">{todayWorkout.description}</p>
                    </div>
                )}

                {/* Weekly Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-surface-dark rounded-xl p-4 border border-white/10 text-center">
                        <span className="material-symbols-outlined text-primary text-2xl mb-1">calendar_month</span>
                        <p className="text-2xl font-bold text-white">{trainingDays}</p>
                        <p className="text-white/50 text-xs">Treinos/Semana</p>
                    </div>
                    <div className="bg-surface-dark rounded-xl p-4 border border-white/10 text-center">
                        <span className="material-symbols-outlined text-orange-400 text-2xl mb-1">local_fire_department</span>
                        <p className="text-2xl font-bold text-white">{weeklyCalories}</p>
                        <p className="text-white/50 text-xs">Calorias/Semana</p>
                    </div>
                    <div className="bg-surface-dark rounded-xl p-4 border border-white/10 text-center">
                        <span className="material-symbols-outlined text-blue-400 text-2xl mb-1">schedule</span>
                        <p className="text-2xl font-bold text-white">{Math.round(weeklyDuration / 60)}h</p>
                        <p className="text-white/50 text-xs">Tempo/Semana</p>
                    </div>
                </div>

                {/* Weekly Plan */}
                <section>
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">view_week</span>
                        Plano Semanal
                    </h3>

                    <div className="space-y-3">
                        {currentPlan.weeklyPlan.map((workout, index) => {
                            const isToday = workout.day === today;
                            const isComplete = isWorkoutComplete(workout.day);
                            const isRest = workout.type === 'descanso';

                            return (
                                <motion.button
                                    key={workout.day}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setSelectedDay(index);
                                        setShowWorkoutDetail(true);
                                    }}
                                    className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${isToday
                                        ? 'border-primary bg-primary/10'
                                        : 'border-white/10 bg-surface-dark'
                                        }`}
                                >
                                    {/* Day indicator */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isComplete ? 'bg-green-500' :
                                        isRest ? 'bg-blue-500/20' :
                                            isToday ? 'bg-primary' : 'bg-white/10'
                                        }`}>
                                        {isComplete ? (
                                            <span className="material-symbols-outlined text-white">check</span>
                                        ) : (
                                            <span className={`material-symbols-outlined ${isToday ? 'text-background-dark' :
                                                isRest ? 'text-blue-400' : 'text-white/70'
                                                }`}>
                                                {getTypeIcon(workout.type)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-white/50'}`}>
                                                {workout.day.slice(0, 3).toUpperCase()}
                                            </span>
                                            {isToday && (
                                                <span className="bg-primary text-background-dark text-xs px-2 py-0.5 rounded-full font-bold">
                                                    HOJE
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-white font-bold truncate">{workout.title}</h4>
                                        {!isRest && (
                                            <p className="text-white/50 text-sm">
                                                {workout.duration} min • {workout.calories} kcal
                                            </p>
                                        )}
                                    </div>

                                    {/* Intensity badge */}
                                    {!isRest && (
                                        <div className={`w-2 h-10 rounded-full ${getIntensityColor(workout.intensity)}`} />
                                    )}

                                    <span className="material-symbols-outlined text-white/30">chevron_right</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </section>
            </main>

            {/* Workout Detail Modal */}
            <AnimatePresence>
                {showWorkoutDetail && selectedWorkout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-end"
                        onClick={() => setShowWorkoutDetail(false)}
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
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-primary font-medium">{selectedWorkout.day}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getIntensityColor(selectedWorkout.intensity)} text-white`}>
                                            {selectedWorkout.intensity.toUpperCase()}
                                        </span>
                                    </div>
                                    <h2 className="text-white text-2xl font-bold">{selectedWorkout.title}</h2>
                                    <p className="text-white/60 mt-1">{selectedWorkout.description}</p>
                                </div>

                                {/* Stats */}
                                {selectedWorkout.type !== 'descanso' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="bg-white/5 rounded-xl p-4">
                                                <span className="material-symbols-outlined text-primary mb-1">schedule</span>
                                                <p className="text-2xl font-bold text-white">{selectedWorkout.duration}</p>
                                                <p className="text-white/50 text-sm">minutos</p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-4">
                                                <span className="material-symbols-outlined text-orange-400 mb-1">local_fire_department</span>
                                                <p className="text-2xl font-bold text-white">{selectedWorkout.calories}</p>
                                                <p className="text-white/50 text-sm">calorias</p>
                                            </div>
                                        </div>

                                        {/* Workout Structure */}
                                        {selectedWorkout.structure && selectedWorkout.structure.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-lg">list</span>
                                                    Estrutura do Treino
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedWorkout.structure.map((segment, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${segment.type === 'sprint' ? 'bg-red-500' :
                                                                segment.type === 'run' ? 'bg-primary' :
                                                                    segment.type === 'jog' ? 'bg-yellow-500' :
                                                                        segment.type === 'taf' ? 'bg-purple-500' :
                                                                            'bg-blue-400'
                                                                }`}>
                                                                <span className="text-white text-xs font-bold">{i + 1}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-white font-medium">{segment.name}</p>
                                                                <p className="text-white/50 text-sm">
                                                                    {segment.duration} min
                                                                    {segment.pace && ` • Pace: ${segment.pace}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Start Button */}
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setShowWorkoutDetail(false);
                                                handleStartWorkout(selectedWorkout);
                                            }}
                                            className="w-full py-4 bg-primary text-background-dark font-bold rounded-xl flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">play_arrow</span>
                                            Iniciar Este Treino
                                        </motion.button>
                                    </>
                                )}

                                {selectedWorkout.type === 'descanso' && (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 rounded-full bg-blue-500/20 mx-auto flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-blue-400 text-4xl">self_improvement</span>
                                        </div>
                                        <h3 className="text-white text-xl font-bold mb-2">Dia de Descanso</h3>
                                        <p className="text-white/60">Aproveite para recuperar o corpo e a mente. O descanso é parte essencial do treino!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PersonalTrainer;
