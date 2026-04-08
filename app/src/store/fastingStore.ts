
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFastingStore = create(
    persist(
        (set, get) => ({
            isFasting: false,
            startTime: null,
            endTime: null,
            plan: '16:8', // Default plan
            history: [],

            // Start a fast
            startFasting: () => {
                const now = Date.now();
                const planHours = parseInt(get().plan.split(':')[0]);
                const endTime = now + (planHours * 60 * 60 * 1000);

                set({
                    isFasting: true,
                    startTime: now,
                    endTime: endTime,
                });
            },

            // End a fast
            endFasting: () => {
                const state = get();
                if (!state.isFasting) return;

                const now = Date.now();
                const duration = now - state.startTime;

                const newEntry = {
                    startTime: state.startTime,
                    endTime: now,
                    duration: duration,
                    plan: state.plan,
                    completed: duration >= (state.endTime - state.startTime)
                };

                set({
                    isFasting: false,
                    startTime: null,
                    endTime: null,
                    history: [newEntry, ...state.history]
                });
            },

            // Change Plan
            setPlan: (newPlan) => {
                // If currently fasting, we might need to adjust end time, but usually you change plan before starting
                // For simplicity, just update plan preference
                set({ plan: newPlan });

                // If actively fasting, update the target end time
                const state = get();
                if (state.isFasting) {
                    const planHours = parseInt(newPlan.split(':')[0]);
                    set({ endTime: state.startTime + (planHours * 60 * 60 * 1000) });
                }
            },

            // Delete history item
            deleteHistoryItem: (index) => {
                const newHistory = [...get().history];
                newHistory.splice(index, 1);
                set({ history: newHistory });
            }

        }),
        {
            name: 'fasting-storage', // unique name
        }
    )
);
