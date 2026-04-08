import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useTrainingStore } from '../../store/trainingStore';
import { ROUTES } from '../../constants';

const PersonalSetup = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { completeSetup, getTrainingPlans } = useTrainingStore();
    const plans = getTrainingPlans();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        age: '',
        gender: 'male',
        level: 'intermediario',
        goal: null,
        currentPace: '',
        weeklyKm: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        const profileData = {
            ...formData,
            weight: parseFloat(formData.weight) || 70,
            height: parseFloat(formData.height) || 170,
            age: parseInt(formData.age) || 30,
            weeklyKm: parseFloat(formData.weeklyKm) || 0
        };
        completeSetup(profileData, user?.id);
        navigate(ROUTES.TRAINING);
    };

    const canProceed = () => {
        if (step === 1) {
            return formData.weight && formData.height && formData.age;
        }
        if (step === 2) {
            return formData.goal !== null;
        }
        return true;
    };

    const objectives = [
        {
            id: 'fat_burn',
            icon: 'local_fire_department',
            title: 'Queima de Gordura',
            description: 'Emagrecer e perder peso com treinos focados em queima calórica',
            color: 'from-orange-500 to-red-500',
            features: ['Corrida intercalada', 'HIIT', 'Longões leves']
        },
        {
            id: 'improve_pace',
            icon: 'speed',
            title: 'Melhorar Pace',
            description: 'Aumentar velocidade e resistência para correr mais rápido',
            color: 'from-blue-500 to-cyan-500',
            features: ['Tiros intervalados', 'Tempo Run', 'Progressivos']
        },
        {
            id: 'hypertrophy',
            icon: 'fitness_center',
            title: 'Massa Muscular',
            description: 'Foco total em ganho de massa e definição na academia',
            color: 'from-ec-4899 to-pink-500',
            features: ['Ficha ABC', 'Hipertrofia', 'Foco em Carga']
        },
        {
            id: 'strength',
            icon: 'weight',
            title: 'Força Máxima',
            description: 'Treino de powerlifting para levantar mais peso',
            color: 'from-indigo-500 to-blue-700',
            features: ['Levantamento Terra', 'Agachamento', 'Supino']
        },
        {
            id: 'taf_12min',
            icon: 'military_tech',
            title: 'TAF - 12 Minutos',
            description: 'Preparação para teste de aptidão física de concursos',
            color: 'from-purple-500 to-pink-500',
            features: ['Simulados', 'Tiros 800m', 'Resistência']
        }
    ];

    const levels = [
        { id: 'iniciante', label: 'Iniciante', desc: 'Corro há menos de 6 meses' },
        { id: 'intermediario', label: 'Intermediário', desc: 'Corro há mais de 6 meses' },
        { id: 'avancado', label: 'Avançado', desc: 'Corro há mais de 2 anos' }
    ];

    return (
        <div className="min-h-screen bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-dark/90 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center gap-4">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => step > 1 ? prevStep() : navigate(-1)}
                    className="p-2 -ml-2"
                >
                    <span className="material-symbols-outlined text-white">arrow_back</span>
                </motion.button>
                <div className="flex-1">
                    <h1 className="text-white font-bold text-lg">Configurar Personal</h1>
                    <p className="text-white/50 text-sm">Passo {step} de 3</p>
                </div>
            </header>

            {/* Progress bar */}
            <div className="px-4 py-2">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-32">
                <AnimatePresence mode="wait">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center py-6">
                                <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-primary text-4xl">person</span>
                                </div>
                                <h2 className="text-white text-2xl font-bold mb-2">Seus Dados</h2>
                                <p className="text-white/60">Precisamos de algumas informações para personalizar seu treino</p>
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <label className="text-white/70 text-sm font-medium">Peso (kg)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.weight}
                                        onChange={(e) => handleChange('weight', e.target.value)}
                                        placeholder="70"
                                        className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:border-primary focus:outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">kg</span>
                                </div>
                            </div>

                            {/* Height */}
                            <div className="space-y-2">
                                <label className="text-white/70 text-sm font-medium">Altura (cm)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.height}
                                        onChange={(e) => handleChange('height', e.target.value)}
                                        placeholder="170"
                                        className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:border-primary focus:outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">cm</span>
                                </div>
                            </div>

                            {/* Age */}
                            <div className="space-y-2">
                                <label className="text-white/70 text-sm font-medium">Idade</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => handleChange('age', e.target.value)}
                                    placeholder="30"
                                    className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:border-primary focus:outline-none"
                                />
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="text-white/70 text-sm font-medium">Gênero</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'male', label: 'Masculino', icon: 'male' },
                                        { id: 'female', label: 'Feminino', icon: 'female' }
                                    ].map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => handleChange('gender', g.id)}
                                            className={`p-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${formData.gender === g.id
                                                ? 'border-primary bg-primary/20 text-primary'
                                                : 'border-white/10 bg-surface-dark text-white/70'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined">{g.icon}</span>
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Level */}
                            <div className="space-y-2">
                                <label className="text-white/70 text-sm font-medium">Nível de Experiência</label>
                                <div className="space-y-2">
                                    {levels.map(level => (
                                        <button
                                            key={level.id}
                                            onClick={() => handleChange('level', level.id)}
                                            className={`w-full p-4 rounded-xl border transition-all text-left ${formData.level === level.id
                                                ? 'border-primary bg-primary/20'
                                                : 'border-white/10 bg-surface-dark'
                                                }`}
                                        >
                                            <span className={`font-bold ${formData.level === level.id ? 'text-primary' : 'text-white'}`}>
                                                {level.label}
                                            </span>
                                            <p className="text-white/50 text-sm">{level.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Objective */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center py-6">
                                <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-primary text-4xl">flag</span>
                                </div>
                                <h2 className="text-white text-2xl font-bold mb-2">Seu Objetivo</h2>
                                <p className="text-white/60">Escolha o objetivo do seu plano de treino</p>
                            </div>

                            <div className="space-y-4">
                                {objectives.map(obj => (
                                    <motion.button
                                        key={obj.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleChange('goal', obj.id)}
                                        className={`w-full p-5 rounded-2xl border transition-all text-left overflow-hidden relative ${formData.goal === obj.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-white/10 bg-surface-dark'
                                            }`}
                                    >
                                        {/* Gradient Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${obj.color} opacity-10`} />

                                        <div className="relative z-10">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${obj.color} flex items-center justify-center`}>
                                                    <span className="material-symbols-outlined text-white text-2xl">{obj.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-white font-bold text-lg">{obj.title}</h3>
                                                    <p className="text-white/60 text-sm mt-1">{obj.description}</p>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {obj.features.map((f, i) => (
                                                            <span key={i} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                                                                {f}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {formData.goal === obj.id && (
                                                    <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Running Info */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center py-6">
                                <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-primary text-4xl">directions_run</span>
                                </div>
                                <h2 className="text-white text-2xl font-bold mb-2">Sua Corrida</h2>
                                <p className="text-white/60">Informações sobre sua corrida atual (opcional)</p>
                            </div>

                            {/* Current Pace */}
                            <div className="space-y-2">
                                <label className="text-white/70 text-sm font-medium">Ritmo Atual (min/km)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.currentPace}
                                        onChange={(e) => handleChange('currentPace', e.target.value)}
                                        placeholder="6:30"
                                        className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:border-primary focus:outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">min/km</span>
                                </div>
                                <p className="text-white/40 text-xs">Seu pace médio em corridas leves</p>
                            </div>

                            {/* Weekly KM */}
                            <div className="space-y-2">
                                <label className="text-white/70 text-sm font-medium">Quilômetros por Semana</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.weeklyKm}
                                        onChange={(e) => handleChange('weeklyKm', e.target.value)}
                                        placeholder="20"
                                        className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:border-primary focus:outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">km</span>
                                </div>
                                <p className="text-white/40 text-xs">Média de km que você corre por semana</p>
                            </div>

                            {/* Preview */}
                            {formData.goal && (
                                <div className="bg-surface-dark rounded-2xl p-4 border border-white/10 mt-6">
                                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">summarize</span>
                                        Resumo do Plano
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Objetivo</span>
                                            <span className="text-white font-medium">
                                                {objectives.find(o => o.id === formData.goal)?.title}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Nível</span>
                                            <span className="text-white font-medium capitalize">{formData.level}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Treinos/Semana</span>
                                            <span className="text-white font-medium">6 dias</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Calorias Est./Semana</span>
                                            <span className="text-primary font-bold">~2.500 kcal</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-8">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={step === 3 ? handleSubmit : nextStep}
                    disabled={!canProceed()}
                    className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg ${canProceed()
                        ? 'bg-primary text-background-dark'
                        : 'bg-white/10 text-white/30'
                        }`}
                >
                    {step === 3 ? (
                        <>
                            <span className="material-symbols-outlined">rocket_launch</span>
                            Iniciar Plano de Treino
                        </>
                    ) : (
                        <>
                            Continuar
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default PersonalSetup;
