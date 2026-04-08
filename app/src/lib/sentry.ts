import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const IS_DEV = import.meta.env.DEV;

export function initSentry(): void {
  if (!SENTRY_DSN || IS_DEV) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    // Captura 10% das sessões para Session Replay (ajuste conforme cota do plano)
    replaysSessionSampleRate: 0.1,
    // Captura 100% das sessões com erro
    replaysOnErrorSampleRate: 1.0,
    // Rastreia 20% das transações de performance
    tracesSampleRate: 0.2,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mascara todos os inputs por padrão para proteger dados do usuário
        maskAllInputs: true,
        blockAllMedia: false,
      }),
    ],
    // Ignora erros de rede comuns e inofensivos
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Network request failed',
      'Failed to fetch',
      'Load failed',
    ],
  });
}

/**
 * Associa o usuário autenticado ao Sentry para facilitar triagem de erros.
 */
export function setSentryUser(user: { id: string; email?: string } | null): void {
  if (!SENTRY_DSN) return;
  Sentry.setUser(user);
}

/**
 * Captura uma exceção manualmente com contexto adicional.
 */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (IS_DEV) {
    console.error('[Sentry capture]', error, context);
    return;
  }
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}
