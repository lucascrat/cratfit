export * from './routes';
export * from './activity';
export * from './theme';

// App Config
export const APP_NAME = 'FitCrat';
export const APP_TAGLINE = 'Corrida • Treino • Personal';

// API Keys
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Default User Settings
export const DEFAULT_USER_SETTINGS = {
    units: 'metric',
    language: 'pt-BR',
    theme: 'dark',
    notificationsEnabled: true,
    privacyProfile: 'public',
    privacyActivities: 'public',
    coachVoice: 'Ana',
    coachEnabled: true,
    hydrationReminders: true,
    heartRateAlerts: false,
};
