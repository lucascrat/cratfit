const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.slice(7);
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = { id: decoded.userId, email: decoded.email };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Optional auth - sets req.user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return next();
    }

    try {
        const token = header.slice(7);
        const decoded = jwt.verify(token, jwtSecret);
        req.user = { id: decoded.userId, email: decoded.email };
    } catch (_) {
        // Ignore invalid tokens for optional auth
    }
    next();
};

module.exports = { requireAuth, optionalAuth };
