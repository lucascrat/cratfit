import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '../types';
import { getProfile, updateProfile } from '../services/authApi';
import { getToken, getRefreshToken, setTokens, clearTokens, API_BASE_URL } from '../services/api';

interface AuthStore {
  user: User | null;
  profile: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  setUser: (user: User | null, session: Session | null) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ data: User | null; error: unknown }>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      // Inicializa a partir do token salvo em localStorage
      initialize: async () => {
        try {
          const token = getToken();
          const refreshToken = getRefreshToken();

          // Sem nenhum token — not logged in
          if (!token && !refreshToken) {
            set({ isAuthenticated: false, isLoading: false, user: null, profile: null });
            return;
          }

          // Já temos dados no store (rehydrated do persist) — usa imediatamente
          const { user: storedUser, profile: storedProfile } = get();

          if (token) {
            // Token existe — autentica imediatamente com dados do cache
            set({ isAuthenticated: true, isLoading: false });

            // Atualiza perfil do servidor silenciosamente em background
            // APENAS se o perfil já está no cache (não bloqueia a navegação)
            if (storedUser?.id) {
              getProfile(storedUser.id)
                .then(({ data: freshProfile }) => {
                  if (freshProfile) {
                    set({ profile: freshProfile as User });
                  }
                })
                .catch(() => {
                  // Sem internet — perfil do cache permanece válido
                });
            }
          } else if (refreshToken) {
            // Só tem refresh token — tenta renovar antes de liberar a UI
            try {
              const res = await fetch(
                `${API_BASE_URL}/auth/refresh`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refresh_token: refreshToken }),
                }
              );
              if (res.ok) {
                const json = await res.json();
                setTokens(json.data?.access_token, json.data?.refresh_token);
                set({ isAuthenticated: true, isLoading: false });
              } else {
                // Refresh falhou — limpa tudo e manda para login
                clearTokens();
                set({ isAuthenticated: false, isLoading: false, user: null, profile: null });
              }
            } catch {
              // Sem internet — usa dados do cache se tiver
              if (storedUser) {
                set({ isAuthenticated: true, isLoading: false });
              } else {
                set({ isAuthenticated: false, isLoading: false });
              }
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Em caso de erro, mantém o estado do cache
          set({ isLoading: false });
        }
      },

      setUser: async (user, session) => {
        if (user) {
          const { data: profile } = await getProfile(user.id);
          set({
            user,
            session,
            profile: profile as User,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            session: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUserProfile: async (updates) => {
        const { user } = get();
        if (!user) return { data: null, error: 'No user logged in' };

        const { data, error } = await updateProfile(user.id, updates);
        if (!error && data) {
          set({ profile: data as User });
        }
        return { data: data as User | null, error };
      },

      completeOnboarding: async () => {
        const { profile, user } = get();
        set({ profile: { ...(profile ?? ({} as User)), onboarding_completed: true } });

        if (user) {
          const { error } = await updateProfile(user.id, { onboarding_completed: true });
          if (error) {
            console.error('Erro ao salvar onboarding:', error);
          }
        }
      },

      logout: async () => {
        // Limpar localStorage é feito pelo api.ts quando clearTokens() é chamado
        set({
          user: null,
          session: null,
          profile: null,
          isAuthenticated: false,
        });
      },

      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;

        const { data: profile } = await getProfile(user.id);
        if (profile) {
          set({ profile: profile as User });
        }
      },
    }),
    {
      name: 'fitcrat-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
