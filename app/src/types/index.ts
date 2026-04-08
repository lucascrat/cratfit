// =============================================================
// Tipos centrais do FitCrat
// =============================================================

// ---- Usuário & Auth ----

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  total_distance_km: number;
  total_time_seconds: number;
  total_activities: number;
  average_pace?: string;
  is_vip: boolean;
  vip_expires_at?: string;
  google_id?: string;
  apple_id?: string;
  country: string;
  is_admin?: boolean;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user?: User;
}

export interface AuthState {
  user: User | null;
  profile: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ---- Atividades ----

export type ActivityType = 'running' | 'walking' | 'cycling' | 'gym';

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number;
  altitude?: number;
}

export interface Activity {
  id: string;
  user_id: string;
  title?: string;
  type: ActivityType;
  distance_km: number;
  duration_seconds: number;
  pace?: string;
  calories: number;
  elevation_gain_m?: number;
  route_data?: RoutePoint[];
  map_image_url?: string;
  is_public: boolean;
  description?: string;
  effort_level?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  created_at: string;
  // Campos de social (join)
  user?: Pick<User, 'id' | 'name' | 'avatar_url'>;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

// ---- Treino / Gym ----

export interface ExerciseSet {
  id: string;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise_id: string;
  name: string;
  muscle_group: string;
  sets: ExerciseSet[];
}

export interface GymWorkout {
  id?: string;
  title?: string;
  started_at: string;
  finished_at?: string;
  exercises: WorkoutExercise[];
  total_volume_kg?: number;
  total_sets?: number;
}

// ---- Nutrição ----

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string;
}

export interface NutritionGoals {
  calories_target: number;
  protein_g_target?: number;
  carbs_g_target?: number;
  fat_g_target?: number;
  water_ml_target?: number;
}

// ---- Jejum ----

export interface FastingEntry {
  startTime: number;
  endTime: number;
  duration: number;
  plan: string;
  completed: boolean;
}

// ---- Comunidade ----

export interface Community {
  id: string;
  name: string;
  description?: string;
  cover_image?: string;
  members_count: number;
  created_by?: string;
  is_private: boolean;
  created_at: string;
  is_member?: boolean;
}

// ---- Configurações ----

export interface UserSettings {
  units: 'metric' | 'imperial';
  language: string;
  theme: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
  privacyProfile: 'public' | 'followers' | 'private';
  privacyActivities: 'public' | 'followers' | 'private';
  coachVoice: string;
  coachEnabled: boolean;
  hydrationReminders: boolean;
  heartRateAlerts: boolean;
}

// ---- API helpers ----

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}
