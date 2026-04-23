/**
 * profileStore — seletor fino sobre authStore.
 *
 * Historicamente existiam dois stores (auth + profile) com persist keys
 * distintos, o que permitia divergência do `profile` do cliente. Para
 * manter uma ÚNICA fonte de verdade dos dados do cliente, este módulo
 * agora delega tudo ao authStore.
 */

import { useAuthStore } from './authStore';
import type { User } from '../types';

export interface ProfileStoreView {
  profile: User | null;
  isLoadingProfile: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ data: User | null; error: unknown }>;
  clearProfile: () => Promise<void>;
}

export const useProfileStore = (): ProfileStoreView => {
  const profile = useAuthStore((s) => s.profile);
  const isLoadingProfile = useAuthStore((s) => s.isLoading);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const updateUserProfile = useAuthStore((s) => s.updateUserProfile);
  const logout = useAuthStore((s) => s.logout);

  return {
    profile,
    isLoadingProfile,
    fetchProfile: refreshProfile,
    updateProfile: updateUserProfile,
    clearProfile: logout,
  };
};

export default useProfileStore;
