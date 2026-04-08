import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymStore } from '../../store/gymStore';

const WorkoutHistory = () => {
    const navigate = useNavigate();
    const { workoutLogs } = useGymStore();
    const [selectedLog, setSelectedLog] = useState(null);

    const sortedLogs = [...workoutLogs].sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    const getDayName = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { weekday: 'long' });
    };

    return (
        <div className="min-h-screen bg-background-dark pb-24">
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
                    <div>
                        <h1 className="text-white font-bold text-lg">Histórico de Treinos</h1>
                        <p className="text-purple-400 text-sm font-medium">{workoutLogs.length} treinos realizados</p>
                    </div>
                </div>
            </header>

            <main className="px-4 py-6 space-y-4">
                {sortedLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-white/20 text-4xl">history</span>
                        </div>
                        <p className="text-white font-medium">Nenhum treino registrado</p>
                        <p className="text-white/40 text-sm mt-1">Seus treinos finalizados aparecerão aqui</p>
                    </div>
                ) : (
                    sortedLogs.map((log, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface-dark rounded-2xl p-4 border border-white/10"
                            onClick={() => setSelectedLog(log)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
                                        {formatDate(log.startTime)}
                                    </p>
                                    <h3 className="text-white font-bold text-lg">{log.name}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-purple-400 font-bold">{formatTime(log.duration)}</p>
                                    <p className="text-white/30 text-xs capitalize">{getDayName(log.startTime)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/5 rounded-xl p-2 text-center">
                                    <p className="text-white/40 text-[10px] uppercase">Exercícios</p>
                                    <p className="text-white font-bold">{log.exercises.length}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-2 text-center">
                                    <p className="text-white/40 text-[10px] uppercase">Séries</p>
                                    <p className="text-white font-bold">
                                        {log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-2 text-center">
                                    <p className="text-white/40 text-[10px] uppercase">Músculos</p>
                                    <p className="text-white font-bold truncate">
                                        {log.muscleGroups[0]}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </main>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-end"
                        onClick={() => setSelectedLog(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-surface-dark rounded-t-3xl max-h-[85vh] overflow-hidden"
                        >
                            <div className="flex justify-center py-3">
                                <div className="w-12 h-1 bg-white/30 rounded-full" />
                            </div>

                            <div className="px-4 pb-8 overflow-auto max-h-[calc(85vh-50px)]">
                                <header className="mb-6">
                                    <p className="text-purple-400 font-medium">{formatDate(selectedLog.startTime)}</p>
                                    <h2 className="text-white text-2xl font-bold">{selectedLog.name}</h2>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-white/40 text-sm">schedule</span>
                                            <span className="text-white/60 text-sm">{formatTime(selectedLog.duration)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-white/40 text-sm">fitness_center</span>
                                            <span className="text-white/60 text-sm">{selectedLog.exercises.length} exercícios</span>
                                        </div>
                                    </div>
                                </header>

                                <div className="space-y-4">
                                    {selectedLog.exercises.map((exercise, i) => (
                                        <div key={i} className="bg-white/5 rounded-2xl p-4">
                                            <h3 className="text-white font-bold mb-3">{exercise.name}</h3>
                                            <div className="space-y-2">
                                                {exercise.sets.map((set, si) => (
                                                    <div key={si} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
                                                        <span className="text-white/50">Série {si + 1}</span>
                                                        <div className="flex gap-4">
                                                            <span className="text-white font-medium">{set.weight}kg</span>
                                                            <span className="text-white/70">×</span>
                                                            <span className="text-white font-medium">{set.reps} reps</span>
                                                            {set.completed && (
                                                                <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedLog(null)}
                                    className="w-full mt-8 py-4 bg-white/10 text-white font-bold rounded-xl"
                                >
                                    Fechar
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkoutHistory;
