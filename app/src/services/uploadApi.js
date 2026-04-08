/**
 * Upload API service - replaces supabase storage uploads.
 * Returns { data, error } for avatar/activity-photo or { publicUrl, error } for activity-image
 * to match existing component expectations from supabase.js.
 */

import { upload } from './api';

export const uploadAvatar = async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await upload('/upload/avatar', formData);
    // API returns the public URL of the uploaded avatar
    return { data: data?.url || data, error };
};

export const uploadActivityImage = async (userId, dataUrl) => {
    try {
        // Convert dataUrl to blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        const formData = new FormData();
        formData.append('file', blob, `map-${Date.now()}.png`);

        const { data, error } = await upload('/upload/activity-image', formData);
        return { publicUrl: data?.url || data, error };
    } catch (error) {
        console.error('Upload Error:', error);
        return { publicUrl: null, error };
    }
};

export const uploadActivityPhoto = async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await upload('/upload/activity-image', formData);
    return { data: data?.url || data, error };
};
