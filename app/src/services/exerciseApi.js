/**
 * Exercise API service - replaces supabase exercise/muscle-group queries.
 * All functions return { data, error } for component compatibility.
 */

import { get } from './api';

export const getMuscleGroups = async () => {
    const { data, error } = await get('/exercises/muscle-groups');
    return { data, error };
};

export const getExercises = async (limit = 200) => {
    const { data, error } = await get(`/exercises?limit=${limit}`);
    return { data, error };
};

export const getExercisesByMuscleGroup = async (muscleGroupId) => {
    const { data, error } = await get(`/exercises?muscle_group_id=${muscleGroupId}`);
    return { data, error };
};

export const searchExercises = async (query, muscleGroupId = null) => {
    const params = new URLSearchParams();
    if (query && query.trim()) {
        params.set('search', query.trim());
    }
    if (muscleGroupId) {
        params.set('muscle_group_id', muscleGroupId);
    }
    const qs = params.toString();
    const { data, error } = await get(`/exercises${qs ? '?' + qs : ''}`);
    return { data, error };
};

export const getExerciseById = async (exerciseId) => {
    const { data, error } = await get(`/exercises/${exerciseId}`);
    return { data, error };
};

export const getExercisesCount = async () => {
    const { data, error } = await get('/exercises/count');
    const count = typeof data === 'number' ? data : data?.count ?? 0;
    return { count, error };
};
