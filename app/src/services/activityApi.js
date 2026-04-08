/**
 * Activity API service - replaces supabase activity/social queries.
 * All functions return { data, error } for component compatibility.
 */

import { get, post } from './api';

export const createActivity = async (activityData) => {
    const { data, error } = await post('/activities', activityData);
    return { data, error };
};

export const getMyActivities = async (userId, limit = 10) => {
    const { data, error } = await get(`/activities/mine?limit=${limit}`);
    return { data, error };
};

export const getFeed = async (limit = 20) => {
    const { data, error } = await get(`/activities/feed?limit=${limit}`);
    return { data, error };
};

export const toggleLike = async (activityId, userId) => {
    const { data, error } = await post(`/activities/${activityId}/like`);
    return { data, error };
};

export const getLikesCount = async (activityId) => {
    const { data, error } = await get(`/activities/${activityId}/likes/count`);
    // Normalize: API returns { count } or just a number
    const count = typeof data === 'number' ? data : data?.count ?? 0;
    return { count, error };
};

export const addComment = async (activityId, userId, content) => {
    const { data, error } = await post(`/activities/${activityId}/comments`, { content });
    return { data, error };
};

export const getComments = async (activityId) => {
    const { data, error } = await get(`/activities/${activityId}/comments`);
    return { data, error };
};

export const getActivitiesRange = async (userId, startDate, endDate) => {
    const start = startDate instanceof Date ? startDate.toISOString() : startDate;
    const end = endDate instanceof Date ? endDate.toISOString() : endDate;
    const { data, error } = await get(`/activities/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
    return { data, error };
};

/**
 * Kept for compatibility - returns mock challenges until backend implements them.
 */
export const getChallenges = async () => {
    return {
        data: [
            {
                id: 1,
                title: 'Desafio 30 Dias',
                description: 'Corra todos os dias por 30 dias',
                progress: 0.4,
                icon: 'emoji_events',
                color: 'primary',
            },
            {
                id: 2,
                title: 'Primeira Maratona',
                description: 'Complete 42km este mes',
                progress: 0.15,
                icon: 'directions_run',
                color: 'purple',
            },
        ],
        error: null,
    };
};
