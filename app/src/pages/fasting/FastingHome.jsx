
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFastingStore } from '../../store/fastingStore';
import FastingPlans from './FastingPlans';
import FastingLearn from './FastingLearn';

// Icons
import iconStage1 from '../../assets/fasting_stage_1.png';
import iconStage2 from '../../assets/fasting_stage_2.png';
import iconStage3 from '../../assets/fasting_stage_3.png';
import iconStage4 from '../../assets/fasting_stage_4.png';
import iconStage5 from '../../assets/fasting_stage_5.png';
import iconStage6 from '../../assets/fasting_stage_6.png';

// Helper to format duration
const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const FASTING_STAGES = [
    {
        start: 0,
        end: 4,
        title: 'Digestão Ativa',
        desc: 'Seu corpo está digerindo a última refeição. A insulina está alta e você está usando a glicose do alimento como energia.',
        bullets: ['Insulina Alta', 'Glicose como energia', 'Não é jejum ainda'],
        icon: iconStage1,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10'
    },
    {
        start: 4,
        end: 8,
        title: 'Queda da Insulina',
        desc: 'A insulina começa a cair e seu corpo passa a usar o glicogênio armazenado no fígado.',
        bullets: ['Insulina cai', 'Uso de glicogênio', 'Fome inicial'],
        icon: iconStage2,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        start: 8,
        end: 12,
        title: 'Início do Jejum Real',
        desc: 'O glicogênio hepático está acabando. O corpo começa timidamente a usar gordura.',
        bullets: ['Fim do glicogênio', 'Aumento do Glucagon', 'Início da queima de gordura'],
        icon: iconStage3,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10'
    },
    {
        start: 12,
        end: 18,
        title: 'Queima de Gordura',
        desc: 'Seu corpo entra no modo de queima de gordura e começa a produzir corpos cetônicos. O GH aumenta.',
        bullets: ['Queima de gordura ativa', 'Produção de cetonas', 'GH aumenta'],
        icon: iconStage4,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10'
    },
    {
        start: 18,
        end: 24,
        title: 'Autofagia Inicia',
        desc: 'Reciclagem celular! O corpo começa a limpar células velhas e danificadas. A insulina está muito baixa.',
        bullets: ['Autofagia (limpeza celular)', 'Cetose iniciando', 'Modo economia'],
        icon: iconStage5,
        color: 'text-green-500',
        bg: 'bg-green-500/10'
    },
    {
        start: 24,
        end: 36,
        title: 'Cetose Profunda',
        desc: 'A queima de gordura está acelerada e a autofagia aumenta. A fome costuma diminuir aqui.',
        bullets: ['Cetose eficiente', 'Fome diminui', 'Alta queima de gordura'],
        icon: iconStage6,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    },
    {
        start: 36,
        end: 48,
        title: 'Pico de Autofagia',
        desc: 'A limpeza celular é significativa. O corpo usa gordura como combustível principal.',
        bullets: ['Autofagia máxima', 'Queima acelerada', 'Cuidado com eletrólitos'],
        icon: iconStage6,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10'
    },
    {
        start: 48,
        end: 72,
        title: 'Estado Avançado',
        desc: 'Níveis altos de corpos cetônicos. Clareza mental para alguns, mas exige cuidado extremo.',
        bullets: ['Hormônio do crescimento alto', 'Proteção de gordura', 'Metabolismo lento'],
        icon: iconStage6,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10'
    }
];

const FastingHome = () => {
    const { isFasting, startTime, endTime, plan, startFasting, endFasting, setPlan, history } = useFastingStore();
    const [now, setNow] = useState(Date.now());
    const [elapsed, setElapsed] = useState(0);
    const [progress, setProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('timer'); // 'timer', 'planos', 'aprender'
    const [currentStage, setCurrentStage] = useState(FASTING_STAGES[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentTime = Date.now();
            setNow(currentTime);

            if (isFasting && startTime) {
                const e = currentTime - startTime;
                setElapsed(e);

                const totalDuration = endTime - startTime;
                const p = Math.min((e / totalDuration) * 100, 100);
                setProgress(p);

                // Find current stage
                const hoursElapsed = e / (1000 * 60 * 60);
                const stage = FASTING_STAGES.find(s => hoursElapsed >= s.start && hoursElapsed < s.end) || FASTING_STAGES[FASTING_STAGES.length - 1];
                setCurrentStage(stage);

            } else {
                setElapsed(0);
                setProgress(0);
                setCurrentStage(FASTING_STAGES[0]);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isFasting, startTime, endTime]);

    // Calculate time left
    const timeLeft = isFasting ? Math.max(0, endTime - now) : 0;

    // Circular Progress Props
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark relative overflow-hidden flex flex-col">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            {/* Header */}
            <header className="px-6 pt-12 pb-4 relative z-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white">Jejum</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-widest">{isFasting ? 'Em Progresso' : 'Vamos começar?'}</p>
                </div>
                <div className="size-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-gray-600 dark:text-white">person</span>
                </div>
            </header>

            {/* Custom Tabs */}
            <div className="px-6 mb-6 relative z-10">
                <div className="flex bg-gray-200 dark:bg-white/5 p-1 rounded-2xl">
                    {['timer', 'planos', 'aprender'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab
                                    ? 'bg-white dark:bg-white/10 text-gray-800 dark:text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'timer' && (
                        <motion.div
                            key="timer"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="px-6 flex flex-col items-center"
                        >
                            {/* Timer Circle */}
                            <div className="relative size-72 flex items-center justify-center mb-6 mt-4">
                                {/* Rings */}
                                <div className="absolute inset-0 rounded-full border-[20px] border-gray-100 dark:border-white/5" />
                                <svg className="absolute w-full h-full transform -rotate-90 drop-shadow-2xl">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r={radius}
                                        stroke="url(#gradient)"
                                        strokeWidth="20"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-linear"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Center Info */}
                                <div className="flex flex-col items-center z-10 text-center">
                                    <div className="flex items-center gap-1 mb-2 bg-white dark:bg-white/10 px-3 py-1 rounded-full shadow-sm">
                                        <span className="material-symbols-outlined text-sm text-primary">local_fire_department</span>
                                        <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-300">
                                            {isFasting ? 'Queima de Gordura' : 'Modo Alimentado'}
                                        </span>
                                    </div>

                                    {isFasting ? (
                                        <>
                                            <span className="text-6xl font-black text-gray-800 dark:text-white mb-2 tabular-nums tracking-tighter">
                                                {formatDuration(elapsed)}
                                            </span>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tempo Decorrido</p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-5xl font-black text-gray-300 dark:text-white/20 mb-2">
                                                --:--
                                            </span>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Aguardando Início</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Current Stage Card */}
                            {isFasting && currentStage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full bg-white dark:bg-white/5 p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg shadow-black/5 mb-6 relative overflow-hidden"
                                >
                                    {/* Glass Effect Background */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 ${currentStage.bg.replace('/10', '/30')}`} />

                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className={`size-16 rounded-2xl flex items-center justify-center shrink-0 ${currentStage.bg} shadow-inner`}>
                                            <img src={currentStage.icon} alt={currentStage.title} className="w-10 h-10 object-contain drop-shadow-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStage.color}`}>Fase Atual ({currentStage.start}h - {currentStage.end}h)</span>
                                                <span className="material-symbols-outlined text-gray-300 text-sm">info</span>
                                            </div>
                                            <h3 className="text-lg font-black text-gray-800 dark:text-white leading-tight mb-2">{currentStage.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{currentStage.desc}</p>

                                            <div className="flex flex-wrap gap-2">
                                                {currentStage.bullets.map((bullet, idx) => (
                                                    <span key={idx} className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-[9px] font-bold text-gray-600 dark:text-gray-300">
                                                        {bullet}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Info Grid */}
                            {isFasting && (
                                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                    <div className="bg-white dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
                                        <span className="material-symbols-outlined text-gray-400 mb-2">play_circle</span>
                                        <span className="text-xs text-gray-400 font-bold uppercase">Começou</span>
                                        <span className="text-lg font-bold text-gray-800 dark:text-white mt-1">
                                            {new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="bg-white dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
                                        <span className="material-symbols-outlined text-gray-400 mb-2">flag</span>
                                        <span className="text-xs text-gray-400 font-bold uppercase">Meta</span>
                                        <span className="text-lg font-bold text-gray-800 dark:text-white mt-1">
                                            {new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Main Action Button */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={isFasting ? endFasting : startFasting}
                                className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 ${isFasting
                                        ? 'bg-red-500 text-white shadow-red-500/20'
                                        : 'bg-primary text-background-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-2xl filled">
                                    {isFasting ? 'stop_circle' : 'play_circle'}
                                </span>
                                {isFasting ? 'Terminar Jejum' : 'Iniciar Jejum'}
                            </motion.button>

                            {/* Plan Info Small */}
                            {!isFasting && (
                                <div className="mt-6 flex items-center gap-2 text-gray-400">
                                    <span className="text-sm font-medium">Plano selecionado: <strong className="text-gray-600 dark:text-gray-300">{plan}</strong></span>
                                    <button onClick={() => setActiveTab('planos')} className="text-primary text-sm font-bold">Alterar</button>
                                </div>
                            )}

                            {/* History List Short */}
                            {history.length > 0 && (
                                <div className="w-full mt-10 mb-24">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 px-2">Últimos Jejuns</h3>
                                    <div className="space-y-3">
                                        {history.slice(0, 3).map((entry, index) => (
                                            <div key={index} className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-white/5">
                                                <div>
                                                    <span className="text-sm font-bold text-gray-800 dark:text-white block">
                                                        {formatDuration(entry.duration)}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(entry.startTime).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${entry.completed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {entry.completed ? 'Concluído' : 'Parcial'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'planos' && (
                        <motion.div
                            key="planos"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <FastingPlans
                                currentPlan={plan}
                                onSelectPlan={(p) => {
                                    setPlan(p);
                                    // Optional: Switch back to timer or show success toast
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'aprender' && (
                        <motion.div
                            key="aprender"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <FastingLearn />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FastingHome;
