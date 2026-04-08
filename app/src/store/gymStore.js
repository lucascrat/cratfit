import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { exerciseDatabase as fullExerciseDatabase } from '../data/exerciseData';
import { calculateBMR, calculateCaloriesWithBMR } from '../utils/fitnessUtils';

// Map stored keys to database keys
const muscleMap = {
    peito: 'peitoral',
    costas: 'costas',
    ombros: 'ombros',
    biceps: 'biceps',
    triceps: 'triceps',
    pernas: 'pernas',
    gluteos: 'gluteos',
    abdomen: 'abdomen',
    trapezio: 'trapezio',
    antebraco: 'antebraco'
};

const exerciseDatabase = fullExerciseDatabase;

// Treinos baseados em ciência (Frequência 2x/semana idealmente)
const workoutTemplates = {
    hipertrofia: {
        name: 'Hipertrofia (Ganho de Massa)',
        description: 'Foco em volume e frequência otimizada (2x/semana por músculo)',
        icon: 'fitness_center',
        color: 'from-purple-500 to-pink-500',
        splits: {
            // 3 Dias - Fullbody 3x (Melhor opção para 3 dias para atingir frequencia)
            'ABC': {
                name: 'Fullbody 3x',
                days: ['A - Fullbody Foco Empurrar', 'B - Fullbody Foco Puxar', 'C - Fullbody Foco Pernas']
            },
            // 4 Dias - Upper/Lower 2x (Superior/Inferior)
            'ABCD': {
                name: 'Superior/Inferior 2x',
                days: ['A - Superior (Força)', 'B - Inferior (Força)', 'C - Superior (Hipertrofia)', 'D - Inferior (Hipertrofia)']
            },
            // 5 Dias - Híbrido PPL + Upper/Lower
            'ABCDE': {
                name: 'Híbrido PPL + Upper/Lower',
                days: ['A - Superior', 'B - Inferior', 'C - Empurrar (Push)', 'D - Puxar (Pull)', 'E - Pernas (Legs)']
            }
        },
        defaultSets: 3, // 3 séries é mais equilibrado para alta frequência
        defaultReps: '8-12',
        restTime: 90
    },
    forca: {
        name: 'Força Pura',
        description: 'Foco em cargas altas e descanso longo',
        icon: 'sports_gymnastics',
        color: 'from-red-500 to-orange-500',
        splits: {
            'ABC': {
                name: 'Fullbody Força',
                days: ['A - Agachamento/Empurrar', 'B - Terra/Puxar', 'C - Fullbody Completo']
            },
            'ABCD': {
                name: 'Upper/Lower Força',
                days: ['A - Superior Força', 'B - Inferior Força', 'C - Superior Explosão', 'D - Inferior Explosão']
            },
            'ABCDE': { // Fallback to frequency structure
                name: 'Periodização Ondulatória',
                days: ['A - Superior', 'B - Inferior', 'C - Empurrar', 'D - Puxar', 'E - Pernas']
            }
        },
        defaultSets: 5,
        defaultReps: '3-5',
        restTime: 180
    },
    definicao: {
        name: 'Definição (Metabólico)',
        description: 'Alto volume e densidade para queima calórica',
        icon: 'local_fire_department',
        color: 'from-orange-500 to-yellow-500',
        splits: {
            'ABC': {
                name: 'Circuito Metabólico',
                days: ['A - Circuito Superior', 'B - Circuito Inferior', 'C - Circuito Fullbody']
            },
            'ABCD': { // Upper/Lower com cardio
                name: 'Superior/Inferior + Cardio',
                days: ['A - Superior + HIIT', 'B - Inferior + Abs', 'C - Superior + Cardio', 'D - Inferior + Core']
            },
            'ABCDE': {
                name: 'ABCDE Alta Intensidade',
                days: ['A - Superior', 'B - Inferior', 'C - Empurrar', 'D - Puxar', 'E - Pernas']
            }
        },
        defaultSets: 3,
        defaultReps: '12-20',
        restTime: 45
    }
};

export const useGymStore = create(
    persist(
        (set, get) => ({
            // User gym profile
            gymProfile: {
                height: null,
                weight: null,
                age: null,
                gender: 'male',
                level: 'iniciante', // iniciante, intermediario, avancado
                goal: null, // hipertrofia, forca, definicao
                frequency: 3, // dias por semana
                equipment: 'academia', // academia, casa, hibrido
                isSetupComplete: false,
                lastCompletedDayId: null
            },

            // Current workout plan
            currentGymPlan: null,

            // Today's workout
            activeWorkout: null,

            // Exercise history
            exerciseHistory: {},

            // Workout logs
            workoutLogs: [],

            // Actions
            setGymProfile: (updates) => {
                set((state) => ({
                    gymProfile: { ...state.gymProfile, ...updates }
                }));
            },

            completeGymSetup: (profileData) => {
                const goal = profileData.goal || 'hipertrofia';
                // Fallback safe
                const template = workoutTemplates[goal] || workoutTemplates['hipertrofia'];
                const frequency = profileData.frequency || 3;

                // Select appropriate split based on frequency
                let selectedSplit;
                if (frequency <= 3) {
                    selectedSplit = 'ABC';
                } else if (frequency === 4) {
                    selectedSplit = 'ABCD';
                } else {
                    selectedSplit = 'ABCDE';
                }

                const splitData = template.splits[selectedSplit] || template.splits['ABC'];

                // Map to store how many times a muscle group has been used in this plan
                const muscleUsageCount = {};

                // Generate workout days
                const workoutDays = splitData.days.map((dayName, index) => {
                    const muscleGroups = getMuscleGroupsFromDayName(dayName);

                    // We need to pass specific offsets for each muscle group for this day
                    const dayMuscleOffsets = {};

                    muscleGroups.forEach(group => {
                        if (!muscleUsageCount[group]) muscleUsageCount[group] = 0;
                        dayMuscleOffsets[group] = muscleUsageCount[group];
                        muscleUsageCount[group]++; // Increment for next time this muscle appears
                    });

                    const exercises = generateExercisesForMuscles(muscleGroups, profileData.level, dayMuscleOffsets);

                    return {
                        id: `day_${index + 1}`,
                        name: dayName,
                        letter: String.fromCharCode(65 + index),
                        muscleGroups,
                        exercises: exercises.map(ex => ({
                            ...ex,
                            sets: template.defaultSets,
                            reps: template.defaultReps,
                            weight: null,
                            completed: false
                        }))
                    };
                });

                const plan = {
                    id: Date.now(),
                    name: `${template.name} - ${splitData.name}`,
                    goal: goal,
                    template: template,
                    split: selectedSplit,
                    days: workoutDays,
                    restTime: template.restTime,
                    createdAt: new Date().toISOString()
                };

                set({
                    gymProfile: { ...profileData, isSetupComplete: true },
                    currentGymPlan: plan
                });
            },

            startWorkout: (dayId) => {
                const plan = get().currentGymPlan;
                if (!plan) return;

                const day = plan.days.find(d => d.id === dayId);
                if (!day) return;

                set({
                    activeWorkout: {
                        ...day,
                        startTime: new Date().toISOString(),
                        currentExerciseIndex: 0,
                        exercises: day.exercises.map(ex => ({
                            ...ex,
                            sets: Array(ex.sets).fill().map(() => ({
                                reps: null,
                                weight: null,
                                completed: false
                            }))
                        }))
                    }
                });
            },

            updateExerciseSet: (exerciseIndex, setIndex, data) => {
                const workout = get().activeWorkout;
                if (!workout) return;

                const updatedExercises = [...workout.exercises];
                updatedExercises[exerciseIndex].sets[setIndex] = {
                    ...updatedExercises[exerciseIndex].sets[setIndex],
                    ...data
                };

                set({
                    activeWorkout: {
                        ...workout,
                        exercises: updatedExercises
                    }
                });
            },

            completeExercise: (exerciseIndex) => {
                const workout = get().activeWorkout;
                if (!workout) return;

                const updatedExercises = [...workout.exercises];
                updatedExercises[exerciseIndex].completed = true;

                set({
                    activeWorkout: {
                        ...workout,
                        exercises: updatedExercises,
                        currentExerciseIndex: exerciseIndex + 1
                    }
                });
            },

            finishWorkout: () => {
                const workout = get().activeWorkout;
                if (!workout) return;

                const durationSeconds = Math.floor((new Date() - new Date(workout.startTime)) / 1000);

                // Calorie Calculation (BMR Based)
                // METs for general weight training ~ 5.0
                const mets = 5.0;

                const profile = get().gymProfile;
                const weight = Number(profile.weight) || 75;
                const height = Number(profile.height) || 175;
                const age = Number(profile.age) || 30;
                const gender = profile.gender || 'male';

                const bmr = calculateBMR(weight, height, age, gender);
                const calories = calculateCaloriesWithBMR(bmr, mets, durationSeconds);

                const log = {
                    ...workout,
                    endTime: new Date().toISOString(),
                    duration: durationSeconds,
                    calories: calories,
                    calories_burned: calories
                };

                // Save to history
                set((state) => ({
                    workoutLogs: [...state.workoutLogs, log],
                    activeWorkout: null,
                    gymProfile: { ...state.gymProfile, lastCompletedDayId: workout.id }
                }));

                return log;
            },

            cancelWorkout: () => {
                set({ activeWorkout: null });
            },

            getExerciseDatabase: () => exerciseDatabase,
            getWorkoutTemplates: () => workoutTemplates,

            // Get last log for a specific exercise
            getLastExerciseLog: (exerciseId) => {
                const logs = get().workoutLogs;
                // Search backwards (newest first)
                for (let i = logs.length - 1; i >= 0; i--) {
                    const foundEx = logs[i].exercises?.find(e => e.id === exerciseId);
                    if (foundEx && foundEx.completed) {
                        // Find best set or last valid set
                        const bestSet = foundEx.sets.find(s => s.completed && s.weight > 0);
                        if (bestSet) return bestSet;
                    }
                }
                return null;
            },

            // Adicionar exercício a um dia específico do plano
            addExerciseToDay: (dayId, exercise) => {
                const plan = get().currentGymPlan;
                if (!plan) return;

                const updatedDays = plan.days.map(day => {
                    if (day.id === dayId) {
                        // Verificar se exercício já existe
                        const exists = day.exercises.some(ex => ex.id === exercise.id);
                        if (exists) return day;

                        return {
                            ...day,
                            exercises: [...day.exercises, {
                                ...exercise,
                                sets: exercise.sets || 4,
                                reps: exercise.reps || '10-12',
                                weight: null,
                                completed: false
                            }]
                        };
                    }
                    return day;
                });

                set({
                    currentGymPlan: {
                        ...plan,
                        days: updatedDays
                    }
                });
            },

            // Remover exercício de um dia
            removeExerciseFromDay: (dayId, exerciseId) => {
                const plan = get().currentGymPlan;
                if (!plan) return;

                const updatedDays = plan.days.map(day => {
                    if (day.id === dayId) {
                        return {
                            ...day,
                            exercises: day.exercises.filter(ex => ex.id !== exerciseId)
                        };
                    }
                    return day;
                });

                set({
                    currentGymPlan: {
                        ...plan,
                        days: updatedDays
                    }
                });
            },

            resetGymProfile: () => {
                set({
                    gymProfile: {
                        height: null,
                        weight: null,
                        age: null,
                        gender: 'male',
                        level: 'iniciante',
                        goal: null,
                        frequency: 3,
                        equipment: 'academia',
                        isSetupComplete: false
                    },
                    currentGymPlan: null,
                    activeWorkout: null,
                    workoutLogs: []
                });
            }
        }),
        {
            name: 'gym-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Helper functions
function getMuscleGroupsFromDayName(name) {
    const lowerName = name.toLowerCase();

    // --- LÓGICA DE DETECÇÃO DE SPLITS ---

    // 1. Fullbody (Corpo Inteiro)
    if (lowerName.includes('fullbody') || lowerName.includes('folly') || lowerName.includes('circuito')) {
        // Reduzimos o volume focando nos grandes
        return ['peito', 'costas', 'pernas', 'ombros', 'biceps', 'triceps', 'abdomen'];
        // Nota: gera muitos exercícios se não limitarmos no generator.
    }

    // 2. Superior (Upper Body)
    // Se diz "Superior", geralmente é tudo da cintura pra cima
    if (lowerName.includes('superior') || lowerName.includes('upper')) {
        return ['peito', 'costas', 'ombros', 'biceps', 'triceps'];
    }

    // 3. Inferior (Lower Body)
    if (lowerName.includes('inferior') || lowerName.includes('lower')) {
        return ['pernas', 'gluteos', 'panturrilhas', 'abdomen'];
    }

    // 4. Empurrar (Push) - Peito, Ombro, Triceps
    if (lowerName.includes('empurrar') || lowerName.includes('push')) {
        return ['peito', 'ombros', 'triceps'];
    }

    // 5. Puxar (Pull) - Costas, Biceps, Trapezio/Posterior
    if (lowerName.includes('puxar') || lowerName.includes('pull')) {
        return ['costas', 'biceps', 'reverso']; // Reverso mapeia para ombros/costas no DB? Vamos usar 'costas' e 'biceps'
    }

    // --- DETECÇÃO ESPECÍFICA (LEGADO OU CUSTOM) ---
    const groups = [];
    if (lowerName.includes('peito')) groups.push('peito');
    if (lowerName.includes('costas')) groups.push('costas');
    if (lowerName.includes('ombro')) groups.push('ombros');
    if (lowerName.includes('bíceps') || lowerName.includes('biceps')) groups.push('biceps');
    if (lowerName.includes('tríceps') || lowerName.includes('triceps')) groups.push('triceps');
    if (lowerName.includes('perna') || lowerName.includes('leg')) groups.push('pernas');
    if (lowerName.includes('glúteo') || lowerName.includes('gluteo')) groups.push('gluteos');
    if (lowerName.includes('abdômen') || lowerName.includes('abdomen') || lowerName.includes('core') || lowerName.includes('abs')) groups.push('abdomen');
    if (lowerName.includes('braço') || lowerName.includes('braco')) {
        groups.push('biceps');
        groups.push('triceps');
    }

    return groups.length > 0 ? groups : ['peito', 'costas']; // fallback
}

function generateExercisesForMuscles(muscleGroups, level, muscleOffsets = {}) {
    const exercises = [];
    const difficultyFilter = level === 'iniciante' ? ['iniciante'] :
        level === 'intermediario' ? ['iniciante', 'intermediario'] :
            ['iniciante', 'intermediario', 'avancado'];

    // Ajuste dinâmico de volume para não matar o usuário
    // Se tivermos muitos grupos musculares no dia (ex: Fullbody com 6 grupos), limitamos exercícios por grupo.
    let baseCountPerGroup = 2; // Padrão
    if (muscleGroups.length >= 5) {
        baseCountPerGroup = 1; // Fullbody/Upper -> 1 ex por grupo (talvez 2 para grandes)
    } else if (muscleGroups.length <= 2) {
        baseCountPerGroup = 3; // Split ABCDE -> 3 ou 4 ex por grupo
    }

    muscleGroups.forEach(group => {
        const dbKey = muscleMap[group] || group;
        let groupExercises = exerciseDatabase[dbKey] || [];

        // Filter by difficulty
        let filtered = groupExercises.filter(ex => difficultyFilter.includes(ex.difficulty));

        // Se filtro de dificuldade for muito restrito e não tiver nada, pegar qualquer um
        if (filtered.length === 0) filtered = groupExercises;
        if (filtered.length === 0) return;

        // Determinar quantidade específica para este grupo
        let count = baseCountPerGroup;

        // Pernas e Costas geralmente aguentam mais volume ou precisam de mais variação
        if (group === 'pernas' && baseCountPerGroup === 1) count = 2; // No fullbody, perna merece 2 (agacho + algo)
        if (group === 'costas' && baseCountPerGroup === 1) count = 2;

        // Use offset to rotate exercises based on how many times we trained this muscle
        const usageCount = muscleOffsets[group] || 0;

        // Lógica de Rotação: Pula os exercícios já usados baseados no `count`
        // Ex: Se count é 2. Treino 1 pega index 0, 1. Treino 2 pega index 2, 3.
        const offset = (usageCount * count) % Math.max(1, filtered.length);

        const selected = [];
        for (let i = 0; i < count; i++) {
            // Modulo garante que se acabar a lista, volta pro começo
            const index = (offset + i) % filtered.length;
            selected.push(filtered[index]);
        }

        exercises.push(...selected);
    });

    return exercises;
}
