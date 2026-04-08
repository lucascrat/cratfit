/**
 * Community API service - replaces supabase community queries.
 * All functions return { data, error } for component compatibility.
 */

import { get, post, del } from './api';

export const getCommunities = async (limit = 20) => {
    const { data, error } = await get(`/communities?limit=${limit}`);
    return { data, error };
};

export const getCommunity = async (communityId) => {
    const { data, error } = await get(`/communities/${communityId}`);
    return { data, error };
};

export const joinCommunity = async (communityId, userId) => {
    const { data, error } = await post(`/communities/${communityId}/join`);
    return { data, error };
};

export const leaveCommunity = async (communityId, userId) => {
    const { error } = await del(`/communities/${communityId}/leave`);
    return { error };
};

export const isUserInCommunity = async (communityId, userId) => {
    const { data, error } = await get(`/communities/${communityId}/membership`);
    return { isMember: !!data?.isMember, error };
};

export const getMyCommunities = async (userId) => {
    const { data, error } = await get('/communities/mine');
    return { data, error };
};
