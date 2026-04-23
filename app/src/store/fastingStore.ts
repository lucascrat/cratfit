import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FastingEntry } from '../types';

interface FastingStore {
    isFasting: boolean;
    startTime: number | null;
    endTime: number | null;
    plan: string;
    history: FastingEntry[];

    startFasting: () => void;
    endFasting: () => void;
    setPlan: (newPlan: string) => void;
    deleteHistoryItem: (index: number) => void;
}

export const useFastingStore = create<FastingStore>()(
    persist(
        (set, get) => ({
            isFasting: false,
            startTime: null,
            endTime: null,
            plan: '16:8',
            history: [],

            startFasting: () => {
                const now = Date.now();
                const planHours = parseInt(get().plan.split(':')[0], 10);
                const endTime = now + planHours * 60 * 60 * 1000;

                set({
                    isFasting: true,
                    startTime: now,
                    endTime: endTime,
                });
            },

            endFasting: () => {
                const state = get();
                if (!state.isFasting || state.startTime === null || state.endTime === null) return;

                const now = Date.now();
                const duration = now - state.startTime;

                const newEntry: FastingEntry = {
                    startTime: state.startTime,
                    endTime: now,
                    duration: duration,
                    plan: state.plan,
                    completed: duration >= state.endTime - state.startTime,
                };

                set({
                    isFasting: false,
                    startTime: null,
                    endTime: null,
                    history: [newEntry, ...state.history],
                });
            },

            setPlan: (newPlan: string) => {
                set({ plan: newPlan });

                const state = get();
                if (state.isFasting && state.startTime !== null) {
                    const planHours = parseInt(newPlan.split(':')[0], 10);
                    set({ endTime: state.startTime + planHours * 60 * 60 * 1000 });
                }
            },

            deleteHistoryItem: (index: number) => {
                const newHistory = [...get().history];
                newHistory.splice(index, 1);
                set({ history: newHistory });
            },
        }),
        {
            name: 'fasting-storage',
        }
    )
);

export default useFastingStore;
