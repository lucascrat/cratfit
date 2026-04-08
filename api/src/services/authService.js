const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtSecret, jwtRefreshSecret, accessTokenExpiry, refreshTokenExpiry, bcryptRounds } = require('../config/auth');

const hashPassword = (password) => bcrypt.hash(password, bcryptRounds);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

const generateTokens = (userId, email, isAdmin = false) => {
    const accessToken = jwt.sign(
        { userId, email, isAdmin },
        jwtSecret,
        { expiresIn: accessTokenExpiry }
    );
    const refreshToken = jwt.sign(
        { userId, type: 'refresh', jti: crypto.randomUUID() },
        jwtRefreshSecret,
        { expiresIn: refreshTokenExpiry }
    );
    return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, jwtRefreshSecret);
};

module.exports = { hashPassword, comparePassword, generateTokens, verifyRefreshToken };
