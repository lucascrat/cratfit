const IS_DEV = process.env.NODE_ENV !== 'production';

const errorHandler = (err, req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const requestId = req.headers['x-request-id'] || '-';

    // Log estruturado: sempre loga, mas stack trace só em desenvolvimento
    const logEntry = {
        level: status >= 500 ? 'error' : 'warn',
        timestamp: new Date().toISOString(),
        requestId,
        method: req.method,
        path: req.path,
        status,
        message: err.message,
        ...(IS_DEV && err.stack ? { stack: err.stack } : {}),
    };

    if (status >= 500) {
        console.error(JSON.stringify(logEntry));
    } else {
        console.warn(JSON.stringify(logEntry));
    }

    // Erros conhecidos do PostgreSQL
    if (err.code === '23505') {
        return res.status(409).json({ error: 'Resource already exists' });
    }
    if (err.code === '23503') {
        return res.status(400).json({ error: 'Referenced resource not found' });
    }

    // Em produção, não vazar detalhes de erros 500
    const message = status === 500 && !IS_DEV
        ? 'Internal server error'
        : err.message;

    res.status(status).json({ error: message });
};

module.exports = { errorHandler };
