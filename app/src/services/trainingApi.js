/**
 * Training API service - replaces supabase training/fitness queries.
 * All functions return { data, error } for component compatibility.
 */

import { get, post, put } from './api';

export const getFitnessProfile = async (userId) => {
    const { data, error } = await get('/training/profile');
    return { data, error };
};

export const updateFitnessProfile = async (userId, profileData) => {
    const { data, error } = await put('/training/profile', profileData);
    return { data, error };
};

export const getAssignedPlan = async (userId) => {
    const { data, error } = await get('/training/assigned');
    return { data, error };
};

export const assignTrainingPlan = async (userId, planId) => {
    const { data, error } = await post('/training/assign', { planId });
    return { data, error };
};

export const logTrainingSession = async (logData) => {
    const { data, error } = await post('/training/log', logData);
    return { data, error };
};

export const getDailyWorkouts = async (userId, date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dateStr = dateObj.toISOString().split('T')[0];
    const { data, error } = await get(`/training/log/daily?date=${dateStr}`);
    return { data, error };
};

export const getTrainingPlansByCategory = async (category) => {
    const { data, error } = await get(`/training/plans?category=${encodeURIComponent(category)}`);
    return { data, error };
};

export const getWorkoutsRange = async (userId, startDate, endDate) => {
    const start = startDate instanceof Date ? startDate.toISOString() : startDate;
    const end = endDate instanceof Date ? endDate.toISOString() : endDate;
    const { data, error } = await get(`/training/log/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
    return { data, error };
};
