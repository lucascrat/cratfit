export const ACTIVITY_TYPES = {
    RUNNING: 'running',
    WALKING: 'walking',
    CYCLING: 'cycling',
    HIKING: 'hiking',
    GYM: 'gym',
};

export const ACTIVITY_METADATA = {
    [ACTIVITY_TYPES.RUNNING]: { icon: 'directions_run', label: 'Corrida', color: '#1bda67' },
    [ACTIVITY_TYPES.WALKING]: { icon: 'directions_walk', label: 'Caminhada', color: '#3b82f6' },
    [ACTIVITY_TYPES.CYCLING]: { icon: 'directions_bike', label: 'Ciclismo', color: '#f59e0b' },
    [ACTIVITY_TYPES.HIKING]: { icon: 'hiking', label: 'Trilha', color: '#8b5cf6' },
    [ACTIVITY_TYPES.GYM]: { icon: 'fitness_center', label: 'Academia', color: '#ec4899' },
};

export const TRAINING_MODES = {
    FREE: 'free',
    PACE: 'pace',
    INTERVAL: 'interval',
    DISTANCE: 'distance',
    TIME: 'time',
};

export const EFFORT_LEVELS = [
    { id: 1, label: 'Muito leve', emoji: '😌' },
    { id: 2, label: 'Leve', emoji: '🙂' },
    { id: 3, label: 'Moderado', emoji: '😐' },
    { id: 4, label: 'Intenso', emoji: '😤' },
    { id: 5, label: 'Máximo', emoji: '🔥' },
];

export default {
    ACTIVITY_TYPES,
    ACTIVITY_METADATA,
    TRAINING_MODES,
    EFFORT_LEVELS,
};
