import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymStore } from '../../store/gymStore';
import { useAuthStore } from '../../store/authStore';
import { getFitnessProfile, updateFitnessProfile } from '../../services/trainingApi';
import { ROUTES } from '../../constants';

// Map onboarding values to gym values and vice-versa
const FITNESS_TO_GYM_LEVEL = { sedentary: 'iniciante', beginner: 'iniciante', intermediate: 'intermediario', advanced: 'avancado', athlete: 'avancado' };
const FITNESS_TO_GYM_GOAL  = { weight_loss: 'definicao', muscle_gain: 'hipertrofia', maintenance: 'definicao', performance: 'forca', health: 'resistencia' };
const GYM_TO_FITNESS_LEVEL = { iniciante: 'beginner', intermediario: 'intermediate', avancado: 'advanced' };
const GYM_TO_FITNESS_GOAL  = { hipertrofia: 'muscle_gain', forca: 'performance', definicao: 'weight_loss', resistencia: 'health' };

const GymSetup = () => {
    const navigate = useNavigate();
    const { completeGymSetup, getWorkoutTemplates } = useGymStore();
    const { user } = useAuthStore();
    const templates = getWorkoutTemplates();

    const [step, setStep] = useState(1);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
        age: '',
        gender: 'male',
        level: 'iniciante',
        goal: null,
        frequency: 4,
        equipment: 'academia'
    });

    // Pre-fill form with data already saved during onboarding
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) { setLoadingProfile(false); return; }
            try {
                const { data } = await getFitnessProfile(user.id);
                if (data) {
                    // Calculate age from birth_date if available
                    let age = '';
                    if (data.birth_date) {
                        const diff = Date.now() - new Date(data.birth_date).getTime();
                        age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                    }
                    setFormData(prev => ({
                        ...prev,
                        height:    data.height_cm           ? String(data.height_cm)    : prev.height,
                        weight:    data.weight_kg           ? String(data.weight_kg)    : prev.weight,
                        age:       age                      ? String(age)               : prev.age,
                        gender:    data.gender              || prev.gender,
                        level:     FITNESS_TO_GYM_LEVEL[data.fitness_level]  || prev.level,
                        goal:      FITNESS_TO_GYM_GOAL[data.primary_goal]    || prev.goal,
                        frequency: data.weekly_training_days ? Math.min(6, Math.max(3, data.weekly_training_days)) : prev.frequency,
                    }));
                }
            } catch (e) {
                console.error('Error loading profile for GymSetup:', e);
            } finally {
                setLoadingProfile(false);
            }
        };
        loadProfile();
    }, [user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (step < 4) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        const profileData = {
            ...formData,
            height: parseFloat(formData.height) || 170,
            weight: parseFloat(formData.weight) || 70,
            age: parseInt(formData.age) || 30
        };

        // Save to local gym store (for workout planning)
        completeGymSetup(profileData);

        // Also persist to backend DB so other pages use the updated data
        if (user) {
            updateFitnessProfile(user.id, {
                weight_kg:            profileData.weight,
                height_cm:            profileData.height,
                gender:               profileData.gender,
                fitness_level:        GYM_TO_FITNESS_LEVEL[profileData.level]    || 'beginner',
                primary_goal:         GYM_TO_FITNESS_GOAL[profileData.goal]      || 'muscle_gain',
                weekly_training_days: profileData.frequency,
            }).catch(console.error);
        }

        navigate(ROUTES.GYM);
    };

    const canProceed = () => {
        if (step === 1) return formData.height && formData.weight && formData.age;
        if (step === 2) return formData.level;
        if (step === 3) return formData.goal;
        if (step === 4) return formData.frequency;
        return true;
    };

    const goals = [
        {
            id: 'hipertrofia',
            icon: 'trending_up',
            title: 'Hipertrofia',
            description: 'Ganho de massa muscular',
            color: 'from-purple-500 to-pink-500',
            features: ['Volume alto', '8-12 reps', '60s descanso']
        },
        {
            id: 'forca',
            icon: 'sports_gymnastics',
            title: 'Força',
            description: 'Aumento de força máxima',
            color: 'from-red-500 to-orange-500',
            features: ['Cargas altas', '3-6 reps', '120s descanso']
        },
        {
            id: 'definicao',
            icon: 'local_fire_department',
            title: 'Definição',
            description: 'Perda de gordura mantendo massa',
            color: 'from-orange-500 to-yellow-500',
            features: ['Alta intensidade', '12-15 reps', '45s descanso']
        },
        {
            id: 'resistencia',
            icon: 'timer',
            title: 'Resistência',
            description: 'Condicionamento muscular',
            color: 'from-blue-500 to-cyan-500',
            features: ['Circuitos', '15-20 reps', '30s descanso']
        }
    ];

    const levels = [
        { id: 'iniciante', label: 'Iniciante', desc: 'Menos de 6 meses de treino', icon: 'emoji_events' },
        { id: 'intermediario', label: 'Intermediário', desc: '6 meses a 2 anos de treino', icon: 'fitness_center' },
        { id: 'avancado', label: 'Avançado', desc: 'Mais de 2 anos de treino', icon: 'military_tech' }
    ];

    const frequencies = [
        { value: 3, label: '3 dias', split: 'ABC' },
        { value: 4, label: '4 dias', split: 'ABCD' },
        { value: 5, label: '5 dias', split: 'ABCDE' },
        { value: 6, label: '6 dias', split: 'ABCDEF' }
    ];

    if (loadingProfile) return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center">
            <span className="animate-spin material-symbols-outlined text-white text-4xl">progress_activity</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-dark/90 backdrop-blur-md border-b border-white/10 px-4 py-4">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => step > 1 ? prevStep() : navigate(-1)}
                        className="p-2 -ml-2"
                    >
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </motion.button>
                    <div className="flex-1">
                        <h1 className="text-white font-bold text-lg">Configurar Academia</h1>
                        <p className="text-white/50 text-sm">Passo {step} de 4</p>
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            <div className="px-4 py-2">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-40 overflow-auto">
                <AnimatePresence mode="wait">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="text-center py-3">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mx-auto flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-purple-400 text-3xl">person</span>
                                </div>
                                <h2 className="text-white text-xl font-bold mb-1">Seus Dados</h2>
                                <p className="text-white/60 text-sm">Informações para personalizar seu treino</p>
                            </div>

                            {/* Height */}
                            <div className="space-y-1">
                                <label className="text-white/70 text-sm font-medium">Altura (cm)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.height}
                                        onChange={(e) => handleChange('height', e.target.value)}
                                        placeholder="170"
                                        className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:border-purple-500 focus:outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">cm</span>
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="space-y-1">
                                <label className="text-white/70 text-sm font-medium">Peso (kg)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.weight}
                                        onChange={(e) => handleChange('weight', e.target.value)}
                                        placeholder="70"
                                        className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:border-purple-500 focus:outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">kg</span>
                                </div>
                            </div>

                            {/* Age */}
                            <div className="space-y-1">
                                <label className="text-white/70 text-sm font-medium">Idade</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => handleChange('age', e.target.value)}
                                    placeholder="25"
                                    className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:border-purple-500 focus:outline-none"
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
                                            className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${formData.gender === g.id
                                                ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                                                : 'border-white/10 bg-surface-dark text-white/70'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-xl">{g.icon}</span>
                                            <span className="text-sm font-medium">{g.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Level */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center py-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mx-auto flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-purple-400 text-4xl">trending_up</span>
                                </div>
                                <h2 className="text-white text-2xl font-bold mb-2">Seu Nível</h2>
                                <p className="text-white/60">Qual sua experiência com musculação?</p>
                            </div>

                            <div className="space-y-3">
                                {levels.map(level => (
                                    <motion.button
                                        key={level.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleChange('level', level.id)}
                                        className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center gap-4 ${formData.level === level.id
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-white/10 bg-surface-dark'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${formData.level === level.id
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                            : 'bg-white/10'
                                            }`}>
                                            <span className={`material-symbols-outlined text-2xl ${formData.level === level.id ? 'text-white' : 'text-white/50'
                                                }`}>{level.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-lg">{level.label}</h3>
                                            <p className="text-white/60 text-sm">{level.desc}</p>
                                        </div>
                                        {formData.level === level.id && (
                                            <span className="material-symbols-outlined text-purple-400 text-2xl">check_circle</span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Goal */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center py-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mx-auto flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-purple-400 text-4xl">flag</span>
                                </div>
                                <h2 className="text-white text-2xl font-bold mb-2">Seu Objetivo</h2>
                                <p className="text-white/60">O que você quer alcançar?</p>
                            </div>

                            <div className="space-y-4">
                                {goals.map(goal => (
                                    <motion.button
                                        key={goal.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleChange('goal', goal.id)}
                                        className={`w-full p-5 rounded-2xl border transition-all text-left overflow-hidden relative ${formData.goal === goal.id
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-white/10 bg-surface-dark'
                                            }`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${goal.color} opacity-10`} />

                                        <div className="relative z-10">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center`}>
                                                    <span className="material-symbols-outlined text-white text-2xl">{goal.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-white font-bold text-lg">{goal.title}</h3>
                                                    <p className="text-white/60 text-sm mt-1">{goal.description}</p>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {goal.features.map((f, i) => (
                                                            <span key={i} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                                                                {f}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {formData.goal === goal.id && (
                                                    <span className="material-symbols-outlined text-purple-400 text-2xl">check_circle</span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Frequency */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center py-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mx-auto flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-purple-400 text-4xl">calendar_month</span>
                                </div>
                                <h2 className="text-white text-2xl font-bold mb-2">Frequência</h2>
                                <p className="text-white/60">Quantos dias por semana você pode treinar?</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {frequencies.map(freq => (
                                    <motion.button
                                        key={freq.value}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleChange('frequency', freq.value)}
                                        className={`p-5 rounded-2xl border transition-all text-center ${formData.frequency === freq.value
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-white/10 bg-surface-dark'
                                            }`}
                                    >
                                        <p className={`text-3xl font-bold ${formData.frequency === freq.value ? 'text-purple-400' : 'text-white'
                                            }`}>{freq.value}</p>
                                        <p className="text-white/60 text-sm">dias/semana</p>
                                        <p className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded mt-2">
                                            Divisão {freq.split}
                                        </p>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Equipment */}
                            <div className="space-y-2 mt-6">
                                <label className="text-white/70 text-sm font-medium">Onde você treina?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'academia', label: 'Academia', icon: 'fitness_center' },
                                        { id: 'casa', label: 'Casa', icon: 'home' },
                                        { id: 'hibrido', label: 'Híbrido', icon: 'sync_alt' }
                                    ].map(eq => (
                                        <button
                                            key={eq.id}
                                            onClick={() => handleChange('equipment', eq.id)}
                                            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${formData.equipment === eq.id
                                                ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                                                : 'border-white/10 bg-surface-dark text-white/70'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined">{eq.icon}</span>
                                            <span className="text-xs">{eq.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-surface-dark rounded-2xl p-4 border border-white/10 mt-6">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-400">summarize</span>
                                    Resumo do Plano
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Objetivo</span>
                                        <span className="text-white font-medium capitalize">
                                            {goals.find(g => g.id === formData.goal)?.title || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Nível</span>
                                        <span className="text-white font-medium capitalize">{formData.level}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Frequência</span>
                                        <span className="text-white font-medium">{formData.frequency} dias/semana</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Local</span>
                                        <span className="text-white font-medium capitalize">{formData.equipment}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-8">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={step === 4 ? handleSubmit : nextStep}
                    disabled={!canProceed()}
                    className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg ${canProceed()
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/10 text-white/30'
                        }`}
                >
                    {step === 4 ? (
                        <>
                            <span className="material-symbols-outlined">fitness_center</span>
                            Criar Meu Plano
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

export default GymSetup;
