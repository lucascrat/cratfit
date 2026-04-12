/**
 * Nutrition API service - replaces supabase nutrition queries.
 * All functions return { data, error } for component compatibility.
 */

import { get, put, post } from './api';

export const getNutritionGoals = async (userId) => {
    const { data, error } = await get('/nutrition/goals');
    return { data, error };
};

export const updateNutritionGoals = async (userId, goals) => {
    const { data, error } = await put('/nutrition/goals', goals);
    return { data, error };
};

export const logMeal = async (userId, mealName, items, date = new Date()) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dateStr = dateObj.toISOString().split('T')[0];

    const { data, error } = await post('/nutrition/meals', {
        name: mealName,
        items,
        date: dateStr,
    });
    return { data, error };
};

export const getDailyMeals = async (userId, date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const { data, error } = await get(`/nutrition/meals/daily?date=${dateStr}`);

    // The API returns { meals, water } or similar structure.
    // Normalize to match the old supabase shape: { data: meals[], water: number, error }
    if (data && Array.isArray(data)) {
        return { data, water: 0, error };
    }
    return { data: data?.meals || data, water: data?.water || 0, error };
};

export const getMealsRange = async (userId, startDate, endDate) => {
    const sDate = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
    const eDate = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];
    const { data, error } = await get(`/nutrition/meals/range?start=${sDate}&end=${eDate}`);
    return { data, error };
};

export const saveWaterIntake = async (userId, amount, date = new Date()) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const { data, error } = await put('/nutrition/water', { amount_ml: amount, date: dateStr });
    return { data, error };
};

export const getNutritionGuides = async () => {
    const { data, error } = await get('/nutrition/guides');
    return { data, error };
};

export const getRecipes = async () => {
    const { data, error } = await get('/nutrition/recipes');
    return { data, error };
};

export const analyzeFood = async (description) => {
    const { data, error } = await post('/nutrition/analyze/text', { description });
    return { data, error };
};

export const analyzeFoodPhoto = async (imageBase64, mimeType = 'image/jpeg') => {
    const { data, error } = await post('/nutrition/analyze/image', { imageBase64, mimeType });
    return { data, error };
};

// ─── Foods database ─────────────────────────────────────────────────────────

export const searchFoods = async (query, limit = 10) => {
    if (!query || query.length < 2) return { data: [], error: null };
    const { data, error } = await get(`/nutrition/foods/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return { data, error };
};

export const getFoodCategories = async () => {
    const { data, error } = await get('/nutrition/foods/categories');
    return { data, error };
};

export const getPopularFoods = async (limit = 12) => {
    const { data, error } = await get(`/nutrition/foods/popular?limit=${limit}`);
    return { data, error };
};

// ─── Nutrition Calendar / History ─────────────────────────────────────────────

export const getNutritionCalendar = async (month) => {
    // month format: 'YYYY-MM'
    const m = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const { data, error } = await get(`/nutrition/calendar?month=${m}`);
    return { data, error };
};

export const getNutritionStreak = async () => {
    const { data, error } = await get('/nutrition/history/streak');
    return { data, error };
};
