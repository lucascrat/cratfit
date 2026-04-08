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
