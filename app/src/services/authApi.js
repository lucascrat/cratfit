/**
 * Auth API service - replaces supabase.auth calls.
 * All functions return { data, error } or { user, error } to match existing component expectations.
 */

import { post, get, put, setTokens, clearTokens } from './api';
import { Capacitor } from '@capacitor/core';

export const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await post('/auth/register', { email, password, metadata });
    if (data?.token) {
        setTokens(data.token, data.refreshToken);
    }
    return { data, error };
};

export const signIn = async (email, password) => {
    const { data, error } = await post('/auth/login', { email, password });
    if (data?.token) {
        setTokens(data.token, data.refreshToken);
    }
    return { data, error };
};

export const signInWithGoogle = async () => {
    const redirectTo = Capacitor.isNativePlatform()
        ? 'com.fitcrat.app://login-callback'
        : window.location.origin;

    const { data, error } = await post('/auth/google', { redirectTo });
    // The API may return a redirect URL for OAuth flow
    if (data?.url) {
        window.location.href = data.url;
    }
    return { data, error };
};

export const signInWithApple = async () => {
    const redirectTo = Capacitor.isNativePlatform()
        ? 'com.fitcrat.app://login-callback'
        : window.location.origin;

    const { data, error } = await post('/auth/apple', { redirectTo });
    if (data?.url) {
        window.location.href = data.url;
    }
    return { data, error };
};

export const signOut = async () => {
    const { error } = await post('/auth/logout');
    clearTokens();
    return { error };
};

export const getUser = async () => {
    const { data, error } = await get('/users/me');
    if (error) return { user: null, error };
    // data already combines user + profile from the API
    return { user: data, error: null };
};

export const getProfile = async (userId) => {
    const { data, error } = await get(`/users/${userId}`);
    return { data, error };
};

export const updateProfile = async (userId, updates) => {
    const { data, error } = await put('/users/me', updates);
    return { data, error };
};
