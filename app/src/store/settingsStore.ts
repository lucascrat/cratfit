import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings } from '../types';
import { DEFAULT_USER_SETTINGS } from '../utils/constants';

interface SettingsStore {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
  toggleNotifications: () => void;
  toggleCoach: () => void;
  setCoachVoice: (voice: string) => void;
  toggleHydration: () => void;
  setPrivacy: (type: 'profile' | 'activities', level: UserSettings['privacyProfile']) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_USER_SETTINGS as UserSettings,

      updateSetting: (key, value) => {
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_USER_SETTINGS as UserSettings });
      },

      toggleTheme: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme: state.settings.theme === 'dark' ? 'light' : 'dark',
          },
        }));
      },

      toggleNotifications: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            notificationsEnabled: !state.settings.notificationsEnabled,
          },
        }));
      },

      toggleCoach: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            coachEnabled: !state.settings.coachEnabled,
          },
        }));
      },

      setCoachVoice: (voice) => {
        set((state) => ({
          settings: { ...state.settings, coachVoice: voice },
        }));
      },

      toggleHydration: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            hydrationReminders: !state.settings.hydrationReminders,
          },
        }));
      },

      setPrivacy: (type, level) => {
        const key = type === 'profile' ? 'privacyProfile' : 'privacyActivities';
        set((state) => ({
          settings: { ...state.settings, [key]: level },
        }));
      },
    }),
    { name: 'fitcrat-settings' }
  )
);

export default useSettingsStore;
