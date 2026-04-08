const Sentry = require('@sentry/node');

const IS_DEV = process.env.NODE_ENV !== 'production';

function initSentry() {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn || IS_DEV) return;

    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'production',
        // Rastreia 20% das transações
        tracesSampleRate: 0.2,
        // Ignora erros operacionais comuns (não bugs)
        ignoreErrors: [
            'ECONNRESET',
            'ETIMEDOUT',
            'ECONNREFUSED',
        ],
    });
}

/**
 * Middleware Express para capturar erros no Sentry antes do errorHandler.
 * Adicione ANTES do errorHandler: app.use(sentryErrorMiddleware())
 */
function sentryErrorMiddleware() {
    return Sentry.expressErrorHandler();
}

/**
 * Captura exceção manualmente com contexto adicional.
 */
function captureError(error, context = {}) {
    if (IS_DEV) {
        console.error('[Sentry capture]', error, context);
        return;
    }
    Sentry.withScope((scope) => {
        scope.setExtras(context);
        Sentry.captureException(error);
    });
}

module.exports = { initSentry, sentryErrorMiddleware, captureError };
