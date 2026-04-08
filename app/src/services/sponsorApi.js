/**
 * Sponsor API service - replaces supabase sponsor queries.
 * All functions return { data, error } for component compatibility.
 */

import { get } from './api';

export const getSponsors = async () => {
    const { data, error } = await get('/sponsors');
    return { data, error };
};
