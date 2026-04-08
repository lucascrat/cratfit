import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as CapacitorApp } from '@capacitor/app';

// Stores
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';
import { setTokens } from './services/api';

// Layout Components
import BottomNav from './components/common/BottomNav';
import { ROUTES } from './constants';

// Auth Pages (carrega imediatamente — necessário antes de qualquer auth check)
import Login from './pages/auth/Login';

// Lazy load de todas as páginas para reduzir bundle inicial
const Dashboard        = lazy(() => import('./pages/dashboard/Dashboard'));
const StartRun         = lazy(() => import('./pages/tracking/StartRun'));
const ActiveRun        = lazy(() => import('./pages/tracking/ActiveRun'));
const SaveActivity     = lazy(() => import('./pages/tracking/SaveActivity'));
const ActivityDetails  = lazy(() => import('./pages/tracking/ActivityDetails'));
const Explore          = lazy(() => import('./pages/maps/Explore'));
const Communities      = lazy(() => import('./pages/social/Communities'));
const SocialHub        = lazy(() => import('./pages/social/SocialHub'));
const Profile          = lazy(() => import('./pages/social/Profile'));
const Settings         = lazy(() => import('./pages/settings/Settings'));
const TrainingPlan     = lazy(() => import('./pages/training/TrainingPlan'));
const PersonalTrainer  = lazy(() => import('./pages/training/PersonalTrainer'));
const PersonalSetup    = lazy(() => import('./pages/training/PersonalSetup'));
const Nutrition        = lazy(() => import('./pages/nutrition/Nutrition'));
const NutritionGuide   = lazy(() => import('./pages/nutrition/NutritionGuide'));
const NutritionHistory = lazy(() => import('./pages/nutrition/NutritionHistory'));
const VideoFeed        = lazy(() => import('./pages/feed/VideoFeed'));
const FastingHome      = lazy(() => import('./pages/fasting/FastingHome'));
const GymHome          = lazy(() => import('./pages/gym/GymHome'));
const GymSetup         = lazy(() => import('./pages/gym/GymSetup'));
const GymWorkout       = lazy(() => import('./pages/gym/GymWorkout'));
const ExerciseLibrary  = lazy(() => import('./pages/gym/ExerciseLibrary'));
const WorkoutHistory   = lazy(() => import('./pages/gym/WorkoutHistory'));
const AdminPanel       = lazy(() => import('./pages/admin/AdminPanel'));
const AIPersonal       = lazy(() => import('./pages/ai/AIPersonal'));
const Onboarding       = lazy(() => import('./pages/onboarding/Onboarding'));

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Spinner de fallback para Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background-dark">
    <div className="flex flex-col items-center gap-4">
      <div className="size-16 bg-primary/20 rounded-2xl flex items-center justify-center animate-pulse">
        <span className="material-symbols-outlined text-primary text-4xl">directions_run</span>
      </div>
      <p className="text-gray-400 text-sm">Carregando...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, skipOnboarding = false }) => {
  const { isAuthenticated, isLoading, profile } = useAuthStore();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  if (!skipOnboarding && !profile?.onboarding_completed) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  return children;
};

// Admin Route - exige autenticação + papel admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, profile } = useAuthStore();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!profile?.is_admin) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : children;
};

function App() {
  const { initialize } = useAuthStore();
  const { settings } = useSettingsStore();

  useEffect(() => {
    initialize();

    const setupDeepLinkListener = async () => {
      await CapacitorApp.removeAllListeners();

      CapacitorApp.addListener('appUrlOpen', async (data) => {
        if (data.url.includes('access_token') || data.url.includes('refresh_token')) {
          try {
            const urlObj = new URL(data.url);
            const hash = urlObj.hash.substring(1);
            const params = new URLSearchParams(hash);

            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');

            if (access_token && refresh_token) {
              // Salvar tokens e reinicializar auth
              setTokens(access_token, refresh_token);
              await initialize();
              console.log('Deep link auth successful');
            }
          } catch (e) {
            console.error('Error handling deep link:', e);
          }
        }
      });
    };

    setupDeepLinkListener();
  }, [initialize]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Auth */}
              <Route path={ROUTES.LOGIN} element={<PublicRoute><Login /></PublicRoute>} />

              {/* Onboarding */}
              <Route path={ROUTES.ONBOARDING} element={<ProtectedRoute skipOnboarding><Onboarding /></ProtectedRoute>} />

              {/* Main */}
              <Route path={ROUTES.DASHBOARD}        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path={ROUTES.RECORD}           element={<ProtectedRoute><StartRun /></ProtectedRoute>} />
              <Route path={ROUTES.TRACKING}         element={<ProtectedRoute><ActiveRun /></ProtectedRoute>} />
              <Route path={ROUTES.SAVE_ACTIVITY}    element={<ProtectedRoute><SaveActivity /></ProtectedRoute>} />
              <Route path={ROUTES.ACTIVITY_DETAILS} element={<ProtectedRoute><ActivityDetails /></ProtectedRoute>} />
              <Route path={ROUTES.SOCIAL}           element={<ProtectedRoute><SocialHub /></ProtectedRoute>} />
              <Route path={ROUTES.TRAINING}         element={<ProtectedRoute><TrainingPlan /></ProtectedRoute>} />
              <Route path={ROUTES.NUTRITION}        element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
              <Route path={ROUTES.NUTRITION_GUIDE}  element={<ProtectedRoute><NutritionGuide /></ProtectedRoute>} />
              <Route path={ROUTES.NUTRITION_HISTORY}element={<ProtectedRoute><NutritionHistory /></ProtectedRoute>} />
              <Route path={ROUTES.FEED}             element={<ProtectedRoute><VideoFeed /></ProtectedRoute>} />
              <Route path={ROUTES.FASTING}          element={<ProtectedRoute><FastingHome /></ProtectedRoute>} />
              <Route path={ROUTES.PERSONAL}         element={<ProtectedRoute><PersonalTrainer /></ProtectedRoute>} />
              <Route path={ROUTES.PERSONAL_SETUP}   element={<ProtectedRoute><PersonalSetup /></ProtectedRoute>} />
              <Route path={ROUTES.PROFILE}          element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path={ROUTES.SETTINGS}         element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Gym */}
              <Route path={ROUTES.GYM}          element={<ProtectedRoute><GymHome /></ProtectedRoute>} />
              <Route path={ROUTES.GYM_SETUP}    element={<ProtectedRoute><GymSetup /></ProtectedRoute>} />
              <Route path={ROUTES.GYM_WORKOUT}  element={<ProtectedRoute><GymWorkout /></ProtectedRoute>} />
              <Route path={ROUTES.GYM_EXERCISES}element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
              <Route path={ROUTES.GYM_HISTORY}  element={<ProtectedRoute><WorkoutHistory /></ProtectedRoute>} />

              {/* Admin — protegido por papel is_admin */}
              <Route path={ROUTES.ADMIN} element={<AdminRoute><AdminPanel /></AdminRoute>} />

              {/* AI */}
              <Route path={ROUTES.AI_PERSONAL} element={<ProtectedRoute><AIPersonal /></ProtectedRoute>} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </Suspense>

          <BottomNav />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
