/**
 * Event API service - replaces supabase event queries.
 * All functions return { data, error } for component compatibility.
 */

import { get, post, del } from './api';

export const getEvents = async (limit = 20) => {
    const { data, error } = await get(`/events?limit=${limit}`);
    return { data, error };
};

export const getEvent = async (eventId) => {
    const { data, error } = await get(`/events/${eventId}`);
    return { data, error };
};

export const joinEvent = async (eventId, userId) => {
    const { data, error } = await post(`/events/${eventId}/join`);
    return { data, error };
};

export const leaveEvent = async (eventId, userId) => {
    const { error } = await del(`/events/${eventId}/leave`);
    return { error };
};

export const isUserInEvent = async (eventId, userId) => {
    const { data, error } = await get(`/events/${eventId}/membership`);
    return { isParticipant: !!data?.isParticipant, status: data?.status || null, error };
};

export const getEventParticipantsCount = async (eventId) => {
    const { data, error } = await get(`/events/${eventId}/participants/count`);
    const count = typeof data === 'number' ? data : data?.count ?? 0;
    return { count, error };
};
