require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');
const { initSentry, sentryErrorMiddleware } = require('./lib/sentry');

// Inicializa Sentry antes de qualquer outro middleware (só ativo em produção)
initSentry();

const app = express();
const server = http.createServer(app);

// Parse CORS origins — fallback to '*' if env is missing or empty
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
    : ['*'];

// Socket.io
const io = new Server(server, {
    cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST'],
    },
});

app.set('io', io);

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
    origin: corsOrigins.includes('*') ? '*' : corsOrigins,
    credentials: !corsOrigins.includes('*'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Handle preflight for all routes
app.options('*', cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting específico para autenticação (mais restritivo)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
});

// Rate limiting geral para a API
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
});

// Health check (sem rate limit)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authLimiter, require('./routes/auth'));
app.use('/api/v1/users', apiLimiter, require('./routes/users'));
app.use('/api/v1/activities', apiLimiter, require('./routes/activities'));
app.use('/api/v1/communities', apiLimiter, require('./routes/communities'));
app.use('/api/v1/events', apiLimiter, require('./routes/events'));
app.use('/api/v1/training', apiLimiter, require('./routes/training'));
app.use('/api/v1/nutrition', apiLimiter, require('./routes/nutrition'));
app.use('/api/v1/exercises', apiLimiter, require('./routes/exercises'));
app.use('/api/v1/videos', apiLimiter, require('./routes/videos'));
app.use('/api/v1/sponsors', apiLimiter, require('./routes/sponsors'));
app.use('/api/v1/upload', apiLimiter, require('./routes/upload'));
app.use('/api/v1/admin', apiLimiter, require('./routes/admin'));

// Sentry deve capturar antes do errorHandler customizado
app.use(sentryErrorMiddleware());

// Error handler
app.use(errorHandler);

// Socket.io — autenticação obrigatória para todas as conexões
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error('Authentication required'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new Error('Token expired'));
        }
        return next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('join:activity', (activityId) => {
        if (typeof activityId === 'string' && activityId.length <= 64) {
            socket.join(`activity:${activityId}`);
        }
    });

    socket.on('leave:activity', (activityId) => {
        socket.leave(`activity:${activityId}`);
    });

    socket.on('error', (err) => {
        console.error(`[Socket] Erro usuário ${socket.userId}:`, err.message);
    });
});

// Start server
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`FitCrat API running on port ${PORT}`);
    });
}

module.exports = app;

