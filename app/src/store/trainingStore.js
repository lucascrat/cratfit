import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateBMR, calculateCaloriesWithBMR } from '../utils/fitnessUtils';

// Treinos por objetivo
const trainingPlans = {
    fat_burn: {
        name: 'Queima de Gordura',
        icon: 'local_fire_department',
        color: '#f97316',
        description: 'Treinos focados em emagrecimento, combinando corrida leve e HIIT',
        weeklyPlan: [
            {
                day: 'Segunda',
                type: 'aerobico_leve',
                title: 'Corrida Leve + Caminhada',
                description: 'Aquecimento + Corrida leve intercalada com caminhada',
                duration: 45,
                intensity: 'baixa',
                structure: [
                    { name: 'Aquecimento', duration: 5, type: 'walk' },
                    { name: 'Corrida Leve', duration: 5, type: 'run', pace: '7:00-8:00' },
                    { name: 'Caminhada', duration: 2, type: 'walk' },
                    { name: 'Corrida Leve', duration: 5, type: 'run', pace: '7:00-8:00' },
                    { name: 'Caminhada', duration: 2, type: 'walk' },
                    { name: 'Corrida Leve', duration: 5, type: 'run', pace: '7:00-8:00' },
                    { name: 'Caminhada', duration: 2, type: 'walk' },
                    { name: 'Corrida Leve', duration: 5, type: 'run', pace: '7:00-8:00' },
                    { name: 'Caminhada', duration: 2, type: 'walk' },
                    { name: 'Corrida Leve', duration: 5, type: 'run', pace: '7:00-8:00' },
                    { name: 'Desaquecimento', duration: 7, type: 'walk' }
                ],
                calories: 350
            },
            {
                day: 'Terça',
                type: 'hiit',
                title: 'HIIT Queima Total',
                description: 'Treino intervalado de alta intensidade para acelerar metabolismo',
                duration: 30,
                intensity: 'alta',
                structure: [
                    { name: 'Aquecimento', duration: 5, type: 'walk' },
                    { name: 'Sprint', duration: 0.5, type: 'sprint', pace: '< 5:00' },
                    { name: 'Recuperação', duration: 1.5, type: 'walk' },
                    { name: 'Sprint', duration: 0.5, type: 'sprint', pace: '< 5:00' },
                    { name: 'Recuperação', duration: 1.5, type: 'walk' },
                    { name: 'Sprint', duration: 0.5, type: 'sprint', pace: '< 5:00' },
                    { name: 'Recuperação', duration: 1.5, type: 'walk' },
                    { name: 'Sprint', duration: 0.5, type: 'sprint', pace: '< 5:00' },
                    { name: 'Recuperação', duration: 1.5, type: 'walk' },
                    { name: 'Sprint', duration: 0.5, type: 'sprint', pace: '< 5:00' },
                    { name: 'Recuperação', duration: 1.5, type: 'walk' },
                    { name: 'Sprint', duration: 0.5, type: 'sprint', pace: '< 5:00' },
                    { name: 'Recuperação', duration: 1.5, type: 'walk' },
                    { name: 'Sprint', duration: 0.5, type: 'sprint', pace: '< 5:00' },
                    { name: 'Recuperação', duration: 1.5, type: 'walk' },
                    { name: 'Sprint', duration: 0.5, type: 'sprint', pace: '< 5:00' },
                    { name: 'Desaquecimento', duration: 5, type: 'walk' }
                ],
                calories: 400
            },
            {
                day: 'Quarta',
                type: 'descanso',
                title: 'Descanso Ativo',
                description: 'Caminhada leve para recuperação muscular',
                duration: 30,
                intensity: 'recuperação',
                structure: [
                    { name: 'Caminhada Leve', duration: 30, type: 'walk' }
                ],
                calories: 150
            },
            {
                day: 'Quinta',
                type: 'aerobico_moderado',
                title: 'Corrida Contínua',
                description: 'Corrida em ritmo constante na zona de queima de gordura',
                duration: 40,
                intensity: 'moderada',
                structure: [
                    { name: 'Aquecimento', duration: 5, type: 'walk' },
                    { name: 'Corrida Moderada', duration: 30, type: 'run', pace: '6:30-7:30' },
                    { name: 'Desaquecimento', duration: 5, type: 'walk' }
                ],
                calories: 380
            },
            {
                day: 'Sexta',
                type: 'hiit',
                title: 'Fartlek Queima',
                description: 'Variação de ritmos para maximizar queima calórica',
                duration: 35,
                intensity: 'alta',
                structure: [
                    { name: 'Aquecimento', duration: 5, type: 'walk' },
                    { name: 'Corrida Leve', duration: 3, type: 'run', pace: '7:00' },
                    { name: 'Corrida Forte', duration: 2, type: 'run', pace: '5:30' },
                    { name: 'Corrida Leve', duration: 3, type: 'run', pace: '7:00' },
                    { name: 'Corrida Forte', duration: 2, type: 'run', pace: '5:30' },
                    { name: 'Corrida Leve', duration: 3, type: 'run', pace: '7:00' },
                    { name: 'Corrida Forte', duration: 2, type: 'run', pace: '5:30' },
                    { name: 'Corrida Leve', duration: 3, type: 'run', pace: '7:00' },
                    { name: 'Corrida Forte', duration: 2, type: 'run', pace: '5:30' },
                    { name: 'Desaquecimento', duration: 5, type: 'walk' }
                ],
                calories: 420
            },
            {
                day: 'Sábado',
                type: 'longo',
                title: 'Longão Queima',
                description: 'Corrida longa em baixa intensidade - máxima queima de gordura',
                duration: 60,
                intensity: 'baixa',
                structure: [
                    { name: 'Aquecimento', duration: 5, type: 'walk' },
                    { name: 'Corrida Leve', duration: 50, type: 'run', pace: '7:30-8:30' },
                    { name: 'Desaquecimento', duration: 5, type: 'walk' }
                ],
                calories: 550
            },
            {
                day: 'Domingo',
                type: 'descanso',
                title: 'Descanso Total',
                description: 'Dia de recuperação completa. Descanse!',
                duration: 0,
                intensity: 'descanso',
                structure: [],
                calories: 0
            }
        ]
    },
    improve_pace: {
        name: 'Melhorar Pace',
        icon: 'speed',
        color: '#3b82f6',
        description: 'Treinos focados em aumentar velocidade e resistência',
        weeklyPlan: [
            {
                day: 'Segunda',
                type: 'base',
                title: 'Corrida Base',
                description: 'Corrida em ritmo confortável para construir base aeróbica',
                duration: 45,
                intensity: 'moderada',
                structure: [
                    { name: 'Aquecimento', duration: 10, type: 'jog' },
                    { name: 'Corrida Moderada', duration: 30, type: 'run', pace: '6:00-6:30' },
                    { name: 'Desaquecimento', duration: 5, type: 'walk' }
                ],
                calories: 380
            },
            {
                day: 'Terça',
                type: 'intervalado',
                title: 'Tiros 400m',
                description: 'Intervalados de 400m para desenvolver velocidade',
                duration: 40,
                intensity: 'alta',
                structure: [
                    { name: 'Aquecimento', duration: 10, type: 'jog' },
                    { name: 'Tiro 400m', duration: 1.5, type: 'sprint', pace: '< 4:30' },
                    { name: 'Recuperação', duration: 2, type: 'walk' },
                    { name: 'Tiro 400m', duration: 1.5, type: 'sprint', pace: '< 4:30' },
                    { name: 'Recuperação', duration: 2, type: 'walk' },
                    { name: 'Tiro 400m', duration: 1.5, type: 'sprint', pace: '< 4:30' },
                    { name: 'Recuperação', duration: 2, type: 'walk' },
                    { name: 'Tiro 400m', duration: 1.5, type: 'sprint', pace: '< 4:30' },
                    { name: 'Recuperação', duration: 2, type: 'walk' },
                    { name: 'Tiro 400m', duration: 1.5, type: 'sprint', pace: '< 4:30' },
                    { name: 'Recuperação', duration: 2, type: 'walk' },
                    { name: 'Tiro 400m', duration: 1.5, type: 'sprint', pace: '< 4:30' },
                    { name: 'Desaquecimento', duration: 5, type: 'walk' }
                ],
                calories: 450
            },
            {
                day: 'Quarta',
                type: 'recuperacao',
                title: 'Recuperação Ativa',
                description: 'Trote leve para recuperação',
                duration: 30,
                intensity: 'baixa',
                structure: [
                    { name: 'Trote Leve', duration: 30, type: 'jog', pace: '7:30-8:00' }
                ],
                calories: 200
            },
            {
                day: 'Quinta',
                type: 'tempo',
                title: 'Tempo Run',
                description: 'Corrida em ritmo de limiar - desconfortavelmente forte',
                duration: 45,
                intensity: 'alta',
                structure: [
                    { name: 'Aquecimento', duration: 10, type: 'jog' },
                    { name: 'Tempo Run', duration: 25, type: 'run', pace: '5:30-5:45' },
                    { name: 'Desaquecimento', duration: 10, type: 'jog' }
                ],
                calories: 420
            },
            {
                day: 'Sexta',
                type: 'descanso',
                title: 'Descanso',
                description: 'Recuperação antes do longão',
                duration: 0,
                intensity: 'descanso',
                structure: [],
                calories: 0
            },
            {
                day: 'Sábado',
                type: 'longo',
                title: 'Longão Progressivo',
                description: 'Corrida longa com aumento gradual de ritmo',
                duration: 70,
                intensity: 'moderada',
                structure: [
                    { name: 'Aquecimento', duration: 10, type: 'jog' },
                    { name: 'Ritmo Leve', duration: 20, type: 'run', pace: '6:30-7:00' },
                    { name: 'Ritmo Moderado', duration: 20, type: 'run', pace: '6:00-6:30' },
                    { name: 'Ritmo Forte', duration: 10, type: 'run', pace: '5:30-6:00' },
                    { name: 'Desaquecimento', duration: 10, type: 'jog' }
                ],
                calories: 600
            },
            {
                day: 'Domingo',
                type: 'recuperacao',
                title: 'Recuperação',
                description: 'Caminhada ou descanso completo',
                duration: 30,
                intensity: 'baixa',
                structure: [
                    { name: 'Caminhada Leve', duration: 30, type: 'walk' }
                ],
                calories: 120
            }
        ]
    },
    taf_12min: {
        name: 'TAF - Corrida 12min',
        icon: 'military_tech',
        color: '#8b5cf6',
        description: 'Preparação específica para teste de aptidão física - corrida de 12 minutos',
        weeklyPlan: [
            { day: 'Segunda', type: 'simulado', title: 'Simulado TAF', duration: 30, intensity: 'máxima', structure: [{ name: 'Simulado', duration: 12, type: 'taf' }] },
            { day: 'Terça', type: 'intervalado', title: 'Tiros 800m', duration: 45, intensity: 'alta' },
            { day: 'Quarta', type: 'recuperacao', title: 'Trote Leve', duration: 25, intensity: 'baixa' },
            { day: 'Quinta', type: 'intervalado', title: 'Tiros 400m', duration: 40, intensity: 'alta' },
            { day: 'Sexta', type: 'descanso', title: 'Descanso', duration: 0, intensity: 'descanso' },
            { day: 'Sábado', type: 'resistencia', title: 'Corrida de Resistência', duration: 50, intensity: 'moderada' },
            { day: 'Domingo', type: 'recuperacao', title: 'Caminhada Leve', duration: 30, intensity: 'baixa' }
        ]
    },
    hypertrophy: {
        name: 'Hipertrofia Muscular',
        icon: 'fitness_center',
        color: '#ec4899',
        description: 'Foco em ganho de massa muscular com alta densidade de treino',
        weeklyPlan: [
            { day: 'Segunda', type: 'gym', title: 'Peito e Tríceps', duration: 60, intensity: 'alta', exercises: [{ name: 'Supino Reto', sets: 4, reps: '8-10' }, { name: 'Crucifixo', sets: 3, reps: '12' }, { name: 'Tríceps Corda', sets: 4, reps: '12' }] },
            { day: 'Terça', type: 'gym', title: 'Costas e Bíceps', duration: 60, intensity: 'alta', exercises: [{ name: 'Puxada Frente', sets: 4, reps: '8-10' }, { name: 'Remada Baixa', sets: 3, reps: '12' }, { name: 'Rosca Direta', sets: 4, reps: '10' }] },
            { day: 'Quarta', type: 'descanso', title: 'Descanso Ativo', duration: 20, intensity: 'baixa' },
            { day: 'Quinta', type: 'gym', title: 'Pernas Completo', duration: 70, intensity: 'máxima', exercises: [{ name: 'Agachamento', sets: 4, reps: '10' }, { name: 'Leg Press', sets: 3, reps: '12' }, { name: 'Cadeira Extensora', sets: 3, reps: '15' }] },
            { day: 'Sexta', type: 'gym', title: 'Ombros e Trapézio', duration: 50, intensity: 'alta', exercises: [{ name: 'Desenv. Halteres', sets: 4, reps: '10' }, { name: 'Elevação Lateral', sets: 4, reps: '12' }] },
            { day: 'Sábado', type: 'aerobico_leve', title: 'Cardio Regenerativo', duration: 30, intensity: 'baixa' },
            { day: 'Domingo', type: 'descanso', title: 'Descanso Total', duration: 0, intensity: 'descanso' }
        ]
    },
    strength: {
        name: 'Força Bruta (Powerlifting)',
        icon: 'weight',
        color: '#6366f1',
        description: 'Foco nos levantamentos básicos e ganho de força máxima',
        weeklyPlan: [
            { day: 'Segunda', type: 'gym', title: 'Agachamento Pesado', duration: 75, intensity: 'máxima', exercises: [{ name: 'Agachamento Livre', sets: 5, reps: '3-5' }, { name: 'Leg Press', sets: 3, reps: '8' }] },
            { day: 'Terça', type: 'descanso', title: 'RecuperaçãoS', duration: 0, intensity: 'descanso' },
            { day: 'Quarta', type: 'gym', title: 'Supino Pesado', duration: 60, intensity: 'máxima', exercises: [{ name: 'Supino Reto', sets: 5, reps: '3-5' }, { name: 'Militar', sets: 3, reps: '6-8' }] },
            { day: 'Quinta', type: 'descanso', title: 'Recuperação', duration: 0, intensity: 'descanso' },
            { day: 'Sexta', type: 'gym', title: 'Terra e Acessórios', duration: 75, intensity: 'máxima', exercises: [{ name: 'Levantamento Terra', sets: 3, reps: '3' }, { name: 'Remada Curvada', sets: 4, reps: '8' }] },
            { day: 'Sábado', type: 'aerobico_leve', title: 'Mobilidade e Cardio', duration: 40, intensity: 'baixa' },
            { day: 'Domingo', type: 'descanso', title: 'Descanso Total', duration: 0, intensity: 'descanso' }
        ]
    }
};

// Helper to get METs from intensity string
const getMETsFromIntensity = (intensity) => {
    const mets = {
        'baixa': 6,
        'moderada': 8,
        'alta': 10,
        'máxima': 12,
        'descanso': 1,
        'recuperação': 4
    };
    return mets[intensity] || 8;
};

// Ajustar pace baseado no objetivo e nível
const adjustPace = (basePace, level) => {
    const levels = {
        'iniciante': 1.3,
        'intermediario': 1.0,
        'avancado': 0.85
    };
    const factor = levels[level] || 1.0;
    // basePace é em formato 'min:sec', retorna em segundos ajustado
    const [mins, secs] = basePace.split(':').map(Number);
    const totalSecs = (mins * 60 + (secs || 0)) * factor;
    const newMins = Math.floor(totalSecs / 60);
    const newSecs = Math.round(totalSecs % 60);
    return `${newMins}:${String(newSecs).padStart(2, '0')}`;
};

export const useTrainingStore = create(
    persist(
        (set, get) => ({
            // User profile
            profile: {
                weight: null,
                height: null,
                age: null,
                gender: 'male',
                level: 'intermediario', // iniciante, intermediario, avancado
                goal: null, // fat_burn, improve_pace, taf_12min
                currentPace: null, // pace atual em min/km
                targetPace: null, // pace alvo
                weeklyKm: null, // km por semana atual
                isSetupComplete: false
            },

            // Current training plan
            currentPlan: null,

            // Completed workouts - key format: "YYYY-MM-DD_DayName"
            completedWorkouts: {},

            // Training history - stores completed workout details
            trainingHistory: [],

            // Update profile
            setProfile: (updates) => {
                set((state) => ({
                    profile: { ...state.profile, ...updates }
                }));
            },

            // Complete setup
            completeSetup: async (profileData, userId = null) => {
                const goal = profileData.goal;
                const plan = trainingPlans[goal];

                if (!plan) return;

                // Personalizar treinos baseado no perfil (BMR)
                const weight = Number(profileData.weight) || 70;
                const height = Number(profileData.height) || 175;
                const age = Number(profileData.age) || 30;
                const gender = profileData.gender || 'male';

                // Calculate BMR
                const bmr = calculateBMR(weight, height, age, gender);

                const customizedPlan = {
                    ...plan,
                    weeklyPlan: plan.weeklyPlan.map(workout => {
                        const mets = getMETsFromIntensity(workout.intensity);
                        // duration is in minutes, convert to seconds
                        // If duration is 0, calories should be 0 (usually rest days)
                        if (workout.duration === 0) return { ...workout, calories: 0 };

                        const calories = calculateCaloriesWithBMR(bmr, mets, workout.duration * 60);

                        return {
                            ...workout,
                            calories
                        };
                    })
                };

                set({
                    profile: { ...profileData, isSetupComplete: true },
                    currentPlan: customizedPlan
                });

                // Sync com API própria
                if (userId) {
                    try {
                        const { updateFitnessProfile } = await import('../services/trainingApi');
                        await updateFitnessProfile(userId, {
                            fitness_level: profileData.level,
                            goal: profileData.goal,
                            weight: weight,
                            height: profileData.height,
                            age: profileData.age,
                            current_pace: profileData.currentPace,
                            weekly_km_target: profileData.weeklyKm
                        });
                    } catch (e) {
                        console.error('Error syncing fitness profile:', e);
                    }
                }
            },

            // Mark workout as complete manually
            markWorkoutComplete: (day, activityData = null) => {
                const today = new Date().toISOString().split('T')[0];
                const workout = get().getTodayWorkout();

                set((state) => ({
                    completedWorkouts: {
                        ...state.completedWorkouts,
                        [`${today}_${day}`]: {
                            completed: true,
                            completedAt: new Date().toISOString(),
                            activityData: activityData
                        }
                    },
                    trainingHistory: [
                        ...state.trainingHistory,
                        {
                            date: today,
                            day: day,
                            workout: workout,
                            activityData: activityData,
                            completedAt: new Date().toISOString()
                        }
                    ]
                }));
            },

            // Auto-mark today's workout when activity is saved
            autoMarkTodayComplete: (activityData) => {
                const plan = get().currentPlan;
                if (!plan) return false;

                const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                const today = days[new Date().getDay()];
                const todayDate = new Date().toISOString().split('T')[0];
                const todayWorkout = plan.weeklyPlan.find(w => w.day === today);

                if (!todayWorkout || todayWorkout.type === 'descanso') return false;

                // Check if already completed
                const alreadyComplete = get().completedWorkouts[`${todayDate}_${today}`];
                if (alreadyComplete) return false;

                // Mark as complete
                set((state) => ({
                    completedWorkouts: {
                        ...state.completedWorkouts,
                        [`${todayDate}_${today}`]: {
                            completed: true,
                            completedAt: new Date().toISOString(),
                            activityData: {
                                distance: activityData.distance,
                                duration: activityData.duration,
                                pace: activityData.pace,
                                calories: activityData.calories
                            }
                        }
                    },
                    trainingHistory: [
                        ...state.trainingHistory,
                        {
                            date: todayDate,
                            day: today,
                            workout: todayWorkout,
                            activityData: activityData,
                            completedAt: new Date().toISOString()
                        }
                    ]
                }));

                return true;
            },

            // Check if workout is complete
            isWorkoutComplete: (day) => {
                const today = new Date().toISOString().split('T')[0];
                const workout = get().completedWorkouts[`${today}_${day}`];
                return workout?.completed === true;
            },

            // Get workout completion data
            getWorkoutCompletionData: (day) => {
                const today = new Date().toISOString().split('T')[0];
                return get().completedWorkouts[`${today}_${day}`] || null;
            },

            // Get today's workout
            getTodayWorkout: () => {
                const plan = get().currentPlan;
                if (!plan) return null;

                const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                const today = days[new Date().getDay()];

                return plan.weeklyPlan.find(w => w.day === today);
            },

            // Get weekly progress
            getWeeklyProgress: () => {
                const plan = get().currentPlan;
                if (!plan) return { completed: 0, total: 0, percentage: 0 };

                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());

                let completed = 0;
                const trainingDays = plan.weeklyPlan.filter(w => w.type !== 'descanso').length;

                plan.weeklyPlan.forEach(workout => {
                    if (workout.type === 'descanso') return;

                    const dayIndex = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].indexOf(workout.day);
                    const workoutDate = new Date(startOfWeek);
                    workoutDate.setDate(startOfWeek.getDate() + dayIndex);
                    const dateKey = workoutDate.toISOString().split('T')[0];

                    if (get().completedWorkouts[`${dateKey}_${workout.day}`]?.completed) {
                        completed++;
                    }
                });

                return {
                    completed,
                    total: trainingDays,
                    percentage: Math.round((completed / trainingDays) * 100)
                };
            },

            // Get training streak
            getTrainingStreak: () => {
                const history = get().trainingHistory;
                if (history.length === 0) return 0;

                // Sort by date descending
                const sorted = [...history].sort((a, b) =>
                    new Date(b.date) - new Date(a.date)
                );

                let streak = 0;
                let currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);

                for (const entry of sorted) {
                    const entryDate = new Date(entry.date);
                    entryDate.setHours(0, 0, 0, 0);

                    const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

                    if (diffDays === streak || diffDays === streak + 1) {
                        streak++;
                        currentDate = entryDate;
                    } else {
                        break;
                    }
                }

                return streak;
            },

            // Reset profile
            resetProfile: () => {
                set({
                    profile: {
                        weight: null,
                        height: null,
                        age: null,
                        gender: 'male',
                        level: 'intermediario',
                        goal: null,
                        currentPace: null,
                        targetPace: null,
                        weeklyKm: null,
                        isSetupComplete: false
                    },
                    currentPlan: null,
                    completedWorkouts: {},
                    trainingHistory: []
                });
            },

            // Get training plans
            getTrainingPlans: () => trainingPlans
        }),
        {
            name: 'training-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
