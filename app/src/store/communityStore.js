import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCommunityStore = create(
    persist(
        (set, get) => ({
            // User's joined communities (local IDs)
            userCommunities: {},

            // User's joined events (local IDs)
            userEvents: {},

            // Join a community
            joinCommunity: (communityId) => {
                set((state) => ({
                    userCommunities: { ...state.userCommunities, [communityId]: true }
                }));
            },

            // Leave a community
            leaveCommunity: (communityId) => {
                set((state) => ({
                    userCommunities: { ...state.userCommunities, [communityId]: false }
                }));
            },

            // Check if user is in community
            isInCommunity: (communityId) => {
                return get().userCommunities[communityId] === true;
            },

            // Join an event
            joinEvent: (eventId) => {
                set((state) => ({
                    userEvents: { ...state.userEvents, [eventId]: true }
                }));
            },

            // Leave an event
            leaveEvent: (eventId) => {
                set((state) => ({
                    userEvents: { ...state.userEvents, [eventId]: false }
                }));
            },

            // Check if user is in event
            isInEvent: (eventId) => {
                return get().userEvents[eventId] === true;
            },

            // Sync from server data
            syncFromServer: (communities, events) => {
                const commsMap = {};
                const eventsMap = {};

                if (communities && communities.length > 0) {
                    communities.forEach(c => { commsMap[c.community_id] = true; });
                }

                if (events && events.length > 0) {
                    events.forEach(e => { eventsMap[e.event_id] = true; });
                }

                set({ userCommunities: commsMap, userEvents: eventsMap });
            },

            // Get count of joined communities
            getJoinedCommunitiesCount: () => {
                return Object.values(get().userCommunities).filter(Boolean).length;
            },

            // Get count of joined events
            getJoinedEventsCount: () => {
                return Object.values(get().userEvents).filter(Boolean).length;
            },

            // Clear all (on logout)
            clearAll: () => {
                set({ userCommunities: {}, userEvents: {} });
            }
        }),
        {
            name: 'community-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
