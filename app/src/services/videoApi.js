/**
 * Video API service - replaces supabase video feed queries.
 * All functions return { data, error } for component compatibility.
 */

import { get, post } from './api';

export const getVideoFeed = async (limit = 20) => {
    const { data, error } = await get(`/videos/feed?limit=${limit}`);
    return { data, error };
};

export const incrementVideoView = async (videoId) => {
    const { data, error } = await post(`/videos/${videoId}/view`);
    return { error };
};
