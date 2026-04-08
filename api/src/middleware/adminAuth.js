const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

const requireAdmin = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.slice(7);
    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.user = { id: decoded.userId, email: decoded.email, isAdmin: true };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { requireAdmin };
