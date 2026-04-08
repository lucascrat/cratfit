import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymStore } from '../../store/gymStore';
import { useAuthStore } from '../../store/authStore';
import { logTrainingSession } from '../../services/trainingApi';
import { getExerciseGifUrl } from '../../data/exerciseData';
import { ROUTES } from '../../constants';
import { calculateBMR, calculateCaloriesWithBMR } from '../../utils/fitnessUtils';
import PlateCalculatorModal from '../../components/gym/PlateCalculatorModal'; // Import Modal

const GymWorkout = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        activeWorkout,
        updateExerciseSet,
        completeExercise,
        finishWorkout,
        cancelWorkout,
        currentGymPlan,
        gymProfile,
        getLastExerciseLog // Get helper
    } = useGymStore();

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [restTimer, setRestTimer] = useState(null);
    const [isResting, setIsResting] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [caloriesBurned, setCaloriesBurned] = useState(0);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [plateCalcWeight, setPlateCalcWeight] = useState(null); // Modal state (weight or null)

    // Timer for workout duration & Calories
    useEffect(() => {
        if (!activeWorkout) return;

        const interval = setInterval(() => {
            const start = new Date(activeWorkout.startTime);
            const seconds = Math.floor((new Date() - start) / 1000);
            setElapsedTime(seconds);

            // Calculate calories real-time
            const weight = Number(gymProfile?.weight) || 75;
            const height = Number(gymProfile?.height) || 175;
            const age = Number(gymProfile?.age) || 30;
            const gender = gymProfile?.gender || 'male';

            const bmr = calculateBMR(weight, height, age, gender);
            const mets = 5.0; // Standard weight training
            const cals = calculateCaloriesWithBMR(bmr, mets, seconds);
            setCaloriesBurned(cals);

        }, 1000);

        return () => clearInterval(interval);
    }, [activeWorkout, gymProfile]);

    // Rest timer countdown
    useEffect(() => {
        if (restTimer === null || restTimer <= 0) {
            setIsResting(false);
            return;
        }

        const timeout = setTimeout(() => {
            setRestTimer(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [restTimer]);

    if (!activeWorkout) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6"
                >
                    <span className="material-symbols-outlined text-6xl text-white/20">fitness_center</span>
                </motion.div>
                <h2 className="text-white text-xl font-bold mb-2">Treino não encontrado</h2>
                <p className="text-white/40 mb-8 max-w-xs">Parece que você não tem nenhum treino em andamento no momento.</p>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(ROUTES.GYM)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-500/20"
                >
                    Ir para Academia
                </motion.button>
            </div>
        );
    }

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const currentExercise = activeWorkout.exercises[currentExerciseIndex];
    const restTime = currentGymPlan?.restTime || 60;

    const handleCompleteSet = (setIndex) => {
        const set = currentExercise.sets[setIndex];

        updateExerciseSet(currentExerciseIndex, setIndex, {
            completed: true,
            reps: set.reps || parseInt(currentExercise.reps) || 12,
            weight: set.weight || 0
        });

        // Start rest timer if not the last set
        if (setIndex < currentExercise.sets.length - 1) {
            setIsResting(true);
            setRestTimer(restTime);
        }
    };

    const handleNextExercise = () => {
        if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
        } else {
            setShowFinishModal(true);
        }
    };

    const handleFinishWorkout = async () => {
        const log = finishWorkout();

        if (user && log) {
            try {
                // Prepare data for DB
                await logTrainingSession({
                    user_id: user.id,
                    plan_day_id: log.id,
                    plan_name: activeWorkout.name,
                    duration_seconds: log.duration,
                    calories_burned: log.calories,
                    exercises_log: log.exercises,
                    created_at: new Date().toISOString()
                });
                console.log('Treino salvo no Supabase!');
            } catch (error) {
                console.error('Erro ao salvar treino:', error);
            }
        }

        navigate(ROUTES.GYM, { state: { finished: true, log } });
    };

    const handleCancelWorkout = () => {
        if (confirm('Deseja cancelar o treino atual?')) {
            cancelWorkout();
            navigate(ROUTES.GYM);
        }
    };

    const skipRest = () => {
        setRestTimer(null);
        setIsResting(false);
    };

    const completedSets = currentExercise?.sets?.filter(s => s.completed).length || 0;
    const totalSets = currentExercise?.sets?.length || 0;
    const completedExercises = activeWorkout.exercises.filter(e =>
        e.sets.every(s => s.completed)
    ).length;

    // --- DATA FETCHING (Helper) ---
    const lastLog = getLastExerciseLog(currentExercise?.id || null);

    return (
        <div className="min-h-screen bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-gradient-to-b from-purple-900/50 to-background-dark px-4 py-4">
                <div className="flex items-center justify-between">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCancelWorkout}
                        className="p-2 -ml-2"
                    >
                        <span className="material-symbols-outlined text-white">close</span>
                    </motion.button>

                    <div className="text-center">
                        <p className="text-white/60 text-sm">{activeWorkout.name}</p>
                        <p className="text-white font-bold text-lg">{formatTime(elapsedTime)}</p>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowFinishModal(true)}
                        className="p-2"
                    >
                        <span className="material-symbols-outlined text-green-400">done_all</span>
                    </motion.button>
                </div>

                {/* Progress */}
                <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 px-1">
                        <span>Progresso do Treino</span>
                        <span>{Math.round(((currentExerciseIndex) / activeWorkout.exercises.length) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentExerciseIndex) / activeWorkout.exercises.length) * 100}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        />
                    </div>
                    <div className="flex justify-between text-xs text-white/50 mt-2 px-1">
                        <span>Ex. {currentExerciseIndex + 1} de {activeWorkout.exercises.length}</span>
                        <span className="text-purple-400">{completedExercises} concluídos</span>
                    </div>
                </div>
            </header>

            {/* Rest Timer Overlay */}
            <AnimatePresence>
                {isResting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                        >
                            <span className="material-symbols-outlined text-6xl text-purple-400 mb-4">timer</span>
                            <p className="text-white/60 text-lg mb-2">Tempo de Descanso</p>
                            <p className="text-8xl font-bold text-white mb-8">{restTimer}</p>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={skipRest}
                                className="px-8 py-3 bg-white/10 rounded-full text-white font-medium"
                            >
                                Pular Descanso
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Plate Calc Modal */}
            <PlateCalculatorModal
                isOpen={plateCalcWeight !== null}
                onClose={() => setPlateCalcWeight(null)}
                targetWeight={plateCalcWeight || 0}
            />

            <main className="px-4 py-6 pb-32">
                {/* Current Exercise Card */}
                <motion.div
                    key={currentExerciseIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card-dark rounded-3xl overflow-hidden border border-white/5 mb-6 shadow-2xl"
                >
                    {/* Exercise Media */}
                    <div className="relative w-full aspect-video bg-black/40">
                        {currentExercise?.gif ? (
                            <img
                                src={getExerciseGifUrl(currentExercise.gif)}
                                alt={currentExercise.name}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                <span className="material-symbols-outlined text-4xl text-white/10">video_library</span>
                                <p className="text-white/20 text-xs font-medium uppercase tracking-widest">Sem demonstração</p>
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ativo</span>
                            </div>
                        </div>

                        {/* Last History Overlay (Real Data) */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs text-yellow-500">history</span>
                            <span className="text-[10px] font-bold text-white">
                                Último: {lastLog ? `${lastLog.weight}kg - ${lastLog.reps} reps` : 'Novo Ex.'}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-white text-2xl font-black tracking-tight">{currentExercise?.name}</h2>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-purple-400 text-sm font-bold uppercase tracking-widest">
                                        {totalSets} Séries
                                    </span>
                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="text-white/40 text-sm font-medium">
                                        Foco: {currentExercise?.primaryMuscle || 'Musculação'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                                <span className="text-white font-black text-lg leading-none">{currentExerciseIndex + 1}</span>
                                <span className="text-white/30 text-[8px] font-bold uppercase mt-1">Num</span>
                            </div>
                        </div>

                        <div className="mb-4 flex justify-end">
                            <button
                                onClick={() => openPlateCalc()}
                                className="text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full"
                            >
                                <span className="material-symbols-outlined text-sm">calculate</span>
                                Calculadora de Pesos
                            </button>
                        </div>

                        {/* Sets List */}
                        <div className="space-y-3">
                            {currentExercise?.sets?.map((set, setIndex) => (
                                <div
                                    key={setIndex}
                                    className={`p-4 rounded-xl border ${set.completed
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-white/5 border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${set.completed ? 'bg-green-500' : 'bg-white/10'
                                            }`}>
                                            {set.completed ? (
                                                <span className="material-symbols-outlined text-white">check</span>
                                            ) : (
                                                <span className="text-white font-bold">{setIndex + 1}</span>
                                            )}
                                        </div>

                                        {/* Weight Input */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-white/50 text-xs">Peso (kg)</label>
                                                {/* Smart suggestion based on last set if available */}
                                                {setIndex > 0 && activeWorkout.exercises[currentExerciseIndex].sets[setIndex - 1].weight > 0 && !set.weight && (
                                                    <span onClick={() => updateExerciseSet(currentExerciseIndex, setIndex, { weight: activeWorkout.exercises[currentExerciseIndex].sets[setIndex - 1].weight })} className="text-[10px] text-purple-400 cursor-pointer">Repetir {activeWorkout.exercises[currentExerciseIndex].sets[setIndex - 1].weight}kg</span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={set.weight || ''}
                                                    onChange={(e) => updateExerciseSet(currentExerciseIndex, setIndex, { weight: parseFloat(e.target.value) || 0 })}
                                                    placeholder={setIndex > 0 && activeWorkout.exercises[currentExerciseIndex].sets[setIndex - 1].weight ? activeWorkout.exercises[currentExerciseIndex].sets[setIndex - 1].weight : "0"}
                                                    disabled={set.completed}
                                                    className="w-full bg-transparent text-white text-lg font-bold focus:outline-none placeholder-white/20"
                                                />
                                                {!set.completed && (
                                                    <button
                                                        onClick={() => openPlateCalc(set.weight || (setIndex > 0 ? activeWorkout.exercises[currentExerciseIndex].sets[setIndex - 1].weight : 0))}
                                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-500 hover:text-yellow-400 p-1"
                                                        title="Calcular Anilhas"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">calculate</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reps Input */}
                                        <div className="flex-1">
                                            <label className="text-white/50 text-xs">Reps</label>
                                            <input
                                                type="number"
                                                value={set.reps || ''}
                                                onChange={(e) => updateExerciseSet(currentExerciseIndex, setIndex, { reps: parseInt(e.target.value) || 0 })}
                                                placeholder={currentExercise?.reps}
                                                disabled={set.completed}
                                                className="w-full bg-transparent text-white text-lg font-bold focus:outline-none"
                                            />
                                        </div>

                                        {/* RPE Input (Optional, small) */}
                                        <div className="w-12">
                                            <label className="text-white/50 text-[10px]">RPE</label>
                                            <input
                                                type="number"
                                                max="10"
                                                placeholder="-"
                                                disabled={set.completed}
                                                className="w-full bg-transparent text-white text-base font-bold focus:outline-none text-center"
                                                onChange={(e) => {
                                                    // Could save RPE logic later
                                                }}
                                            />
                                        </div>

                                        {/* Complete Button */}
                                        {!set.completed && (
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleCompleteSet(setIndex)}
                                                className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20"
                                            >
                                                <span className="material-symbols-outlined text-white">check</span>
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Next Exercise Preview */}
                {currentExerciseIndex < activeWorkout.exercises.length - 1 && (
                    <div className="bg-surface-dark rounded-xl p-4 border border-white/10">
                        <p className="text-white/50 text-xs mb-2">PRÓXIMO EXERCÍCIO</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{currentExerciseIndex + 2}</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    {activeWorkout.exercises[currentExerciseIndex + 1]?.name}
                                </p>
                                <p className="text-white/50 text-sm">
                                    {activeWorkout.exercises[currentExerciseIndex + 1]?.sets?.length} séries
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Exercise List */}
                <div className="mt-6">
                    <h3 className="text-white/70 text-sm font-medium mb-3">Todos os Exercícios</h3>
                    <div className="space-y-2">
                        {activeWorkout.exercises.map((ex, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentExerciseIndex(idx)}
                                className={`w-full p-3 rounded-xl flex items-center gap-3 text-left ${idx === currentExerciseIndex
                                    ? 'bg-purple-500/20 border border-purple-500'
                                    : 'bg-white/5'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ex.sets.every(s => s.completed)
                                    ? 'bg-green-500'
                                    : idx === currentExerciseIndex
                                        ? 'bg-purple-500'
                                        : 'bg-white/10'
                                    }`}>
                                    {ex.sets.every(s => s.completed) ? (
                                        <span className="material-symbols-outlined text-white text-sm">check</span>
                                    ) : (
                                        <span className="text-white text-sm font-bold">{idx + 1}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium ${idx === currentExerciseIndex ? 'text-white' : 'text-white/70'
                                        }`}>{ex.name}</p>
                                    <p className="text-white/50 text-xs">
                                        {ex.sets.filter(s => s.completed).length}/{ex.sets.length} séries
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* Bottom Action */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-8 z-30">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextExercise}
                    disabled={!currentExercise?.sets?.every(s => s.completed)}
                    className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg ${currentExercise?.sets?.every(s => s.completed)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/10 text-white/30'
                        }`}
                >
                    {currentExerciseIndex < activeWorkout.exercises.length - 1 ? (
                        <>
                            Próximo Exercício
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">flag</span>
                            Finalizar Treino
                        </>
                    )}
                </motion.button>
            </div>

            {/* Finish Modal */}
            <AnimatePresence>
                {showFinishModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
                        onClick={() => setShowFinishModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-surface-dark rounded-3xl p-6 text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mx-auto flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-white text-4xl">celebration</span>
                            </div>

                            <h2 className="text-white text-2xl font-bold mb-2">Finalizar Treino?</h2>
                            <p className="text-white/60 mb-6">
                                Você completou {completedExercises} de {activeWorkout.exercises.length} exercícios
                            </p>

                            <div className="bg-white/5 rounded-xl p-4 mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white/50">Duração</span>
                                    <span className="text-white font-bold">{formatTime(elapsedTime)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Séries completadas</span>
                                    <span className="text-white font-bold">
                                        {activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowFinishModal(false)}
                                    className="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl"
                                >
                                    Continuar
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleFinishWorkout}
                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl"
                                >
                                    Finalizar
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GymWorkout;
