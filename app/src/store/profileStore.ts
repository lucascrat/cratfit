/**
 * profileStore — gerencia dados de perfil do usuário autenticado.
 * Separado do authStore para isolar responsabilidades:
 *   authStore → sessão, token, isAuthenticated
 *   profileStore → dados do perfil, conquistas, estatísticas
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { getProfile, updateProfile } from '../services/authApi';

interface ProfileStore {
  profile: User | null;
  isLoadingProfile: boolean;

  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<{ data: User | null; error: unknown }>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      isLoadingProfile: false,

      fetchProfile: async (userId: string) => {
        set({ isLoadingProfile: true });
        try {
          const { data, error } = await getProfile(userId);
          if (!error && data) {
            set({ profile: data as User });
          }
        } finally {
          set({ isLoadingProfile: false });
        }
      },

      updateProfile: async (userId: string, updates: Partial<User>) => {
        const { data, error } = await updateProfile(userId, updates);
        if (!error && data) {
          set({ profile: data as User });
        }
        return { data: data as User | null, error };
      },

      clearProfile: () => {
        set({ profile: null });
      },
    }),
    {
      name: 'fitcrat-profile',
      // Não persiste isLoadingProfile
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);

export default useProfileStore;
