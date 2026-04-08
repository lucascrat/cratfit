/**
 * Admin API service - for AdminPanel.
 * All functions return { data, error } for component compatibility.
 */

import { get, post, put, del, upload } from './api';

// ---- Auth ----

export const adminLogin = async (password) => {
    const { data, error } = await post('/admin/login', { password });
    return { data, error };
};

// ---- Exercises CRUD ----

export const getExercises = async (muscleGroupId = null, limit = 500) => {
    const params = new URLSearchParams({ limit });
    if (muscleGroupId) params.append('muscle_group_id', muscleGroupId);
    const { data, error } = await get(`/admin/exercises?${params}`);
    return { data, error };
};

export const getExerciseImages = async () => {
    const { data, error } = await get('/admin/exercise-images');
    return { data, error };
};

export const uploadExerciseImage = async (exerciseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data, error } = await upload(`/admin/exercises/${exerciseId}/image`, formData);
    return { data, error };
};

export const uploadExerciseAudio = async (exerciseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data, error } = await upload(`/admin/exercises/${exerciseId}/audio`, formData);
    return { data, error };
};

export const createExercise = async (exerciseData) => {
    const { data, error } = await post('/admin/exercises', exerciseData);
    return { data, error };
};

export const updateExercise = async (id, updates) => {
    const { data, error } = await put(`/admin/exercises/${id}`, updates);
    return { data, error };
};

export const deleteExercise = async (id) => {
    const { data, error } = await del(`/admin/exercises/${id}`);
    return { data, error };
};

// ---- Promo Video ----

export const getPromoVideo = async () => {
    const { data, error } = await get('/admin/promo-video');
    return { data, error };
};

export const uploadPromoVideo = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data, error } = await upload('/admin/promo-video', formData);
    return { data, error };
};

// ---- Sponsors CRUD ----

export const uploadSponsorImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data, error } = await upload('/admin/upload/sponsor', formData);
    return { data, error };
};

export const getSponsors = async () => {
    const { data, error } = await get('/admin/sponsors');
    return { data, error };
};

export const createSponsor = async (sponsorData) => {
    const { data, error } = await post('/admin/sponsors', sponsorData);
    return { data, error };
};

export const updateSponsor = async (id, updates) => {
    const { data, error } = await put(`/admin/sponsors/${id}`, updates);
    return { data, error };
};

export const deleteSponsor = async (id) => {
    const { data, error } = await del(`/admin/sponsors/${id}`);
    return { data, error };
};

// ---- Gym Images CRUD ----

export const getGymImages = async () => {
    const { data, error } = await get('/admin/gym-images');
    return { data, error };
};

export const uploadGymImage = async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, val]) => {
        formData.append(key, val);
    });
    const { data, error } = await upload('/admin/gym-images', formData);
    return { data, error };
};

export const deleteGymImage = async (id) => {
    const { data, error } = await del(`/admin/gym-images/${id}`);
    return { data, error };
};

// ---- Settings CRUD ----

export const getSettings = async () => {
    const { data, error } = await get('/admin/settings');
    return { data, error };
};

export const updateSettings = async (settings) => {
    const { data, error } = await put('/admin/settings', settings);
    return { data, error };
};

// ---- Videos CRUD ----

export const getVideos = async (limit = 100) => {
    const { data, error } = await get(`/admin/videos?limit=${limit}`);
    return { data, error };
};

export const createVideo = async (videoData) => {
    const { data, error } = await post('/admin/videos', videoData);
    return { data, error };
};

export const updateVideo = async (id, updates) => {
    const { data, error } = await put(`/admin/videos/${id}`, updates);
    return { data, error };
};

export const deleteVideo = async (id) => {
    const { data, error } = await del(`/admin/videos/${id}`);
    return { data, error };
};

// ---- Users (read-only for admin) ----

export const getUsers = async (limit = 100) => {
    const { data, error } = await get(`/admin/users?limit=${limit}`);
    return { data, error };
};

export const getUserById = async (id) => {
    const { data, error } = await get(`/admin/users/${id}`);
    return { data, error };
};

// ---- Muscle Groups CRUD ----

export const getMuscleGroups = async () => {
    const { data, error } = await get('/admin/muscle-groups');
    return { data, error };
};

export const createMuscleGroup = async (groupData) => {
    const { data, error } = await post('/admin/muscle-groups', groupData);
    return { data, error };
};

export const updateMuscleGroup = async (id, updates) => {
    const { data, error } = await put(`/admin/muscle-groups/${id}`, updates);
    return { data, error };
};

export const deleteMuscleGroup = async (id) => {
    const { data, error } = await del(`/admin/muscle-groups/${id}`);
    return { data, error };
};

// ---- Training Plans CRUD ----

export const getTrainingPlans = async () => {
    const { data, error } = await get('/admin/training-plans');
    return { data, error };
};

export const createTrainingPlan = async (planData) => {
    const { data, error } = await post('/admin/training-plans', planData);
    return { data, error };
};

export const updateTrainingPlan = async (id, updates) => {
    const { data, error } = await put(`/admin/training-plans/${id}`, updates);
    return { data, error };
};

export const deleteTrainingPlan = async (id) => {
    const { data, error } = await del(`/admin/training-plans/${id}`);
    return { data, error };
};
