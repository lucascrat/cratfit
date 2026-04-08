const { Router } = require('express');
const { query } = require('../config/database');
const { hashPassword, comparePassword, generateTokens, verifyRefreshToken } = require('../services/authService');
const {
    validate,
    registerSchema,
    loginSchema,
    googleAuthSchema,
    appleAuthSchema,
    refreshSchema,
} = require('../lib/schemas');

const router = Router();

// POST /auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const { email, password, name, country } = req.body;

        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const password_hash = await hashPassword(password);
        const result = await query(
            `INSERT INTO users (email, password_hash, name, country)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [email, password_hash, name || null, country || 'BR']
        );

        const user = result.rows[0];
        delete user.password_hash;
        const tokens = generateTokens(user.id, user.email);

        await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [tokens.refreshToken, user.id]);

        res.status(201).json({
            data: {
                user,
                session: {
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                },
            },
            error: null,
        });
    } catch (err) { next(err); }
});

// POST /auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !user.password_hash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await comparePassword(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const tokens = generateTokens(user.id, user.email);
        await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [tokens.refreshToken, user.id]);

        delete user.password_hash;
        delete user.refresh_token;

        res.json({
            data: {
                user,
                session: {
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                },
            },
            error: null,
        });
    } catch (err) { next(err); }
});

// POST /auth/google
// AVISO: Esta rota confia no e-mail enviado pelo cliente sem verificar o id_token com a API do
// Google. Em produção, use google-auth-library para validar o token antes de criar/logar o usuário.
router.post('/google', validate(googleAuthSchema), async (req, res, next) => {
    try {
        const { id_token, email, name, photo } = req.body;

        let result = await query('SELECT * FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (!user) {
            result = await query(
                `INSERT INTO users (email, name, avatar_url, google_id)
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [email, name || null, photo || null, id_token || null]
            );
            user = result.rows[0];
        } else if (!user.google_id && id_token) {
            await query('UPDATE users SET google_id = $1 WHERE id = $2', [id_token, user.id]);
        }

        const tokens = generateTokens(user.id, user.email);
        await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [tokens.refreshToken, user.id]);

        delete user.password_hash;
        delete user.refresh_token;

        res.json({
            data: {
                user,
                session: {
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                },
            },
            error: null,
        });
    } catch (err) { next(err); }
});

// POST /auth/apple
// AVISO: Esta rota confia no e-mail enviado pelo cliente sem verificar o identity_token com a Apple.
// Em produção, valide o JWT usando as chaves públicas da Apple (https://appleid.apple.com/auth/keys).
router.post('/apple', validate(appleAuthSchema), async (req, res, next) => {
    try {
        const { identity_token, email, name } = req.body;

        let result = await query('SELECT * FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (!user) {
            result = await query(
                `INSERT INTO users (email, name, apple_id) VALUES ($1, $2, $3) RETURNING *`,
                [email, name || null, identity_token || null]
            );
            user = result.rows[0];
        }

        const tokens = generateTokens(user.id, user.email);
        await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [tokens.refreshToken, user.id]);

        delete user.password_hash;
        delete user.refresh_token;

        res.json({
            data: { user, session: { access_token: tokens.accessToken, refresh_token: tokens.refreshToken } },
            error: null,
        });
    } catch (err) { next(err); }
});

// POST /auth/refresh
router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
    try {
        const { refresh_token } = req.body;

        const decoded = verifyRefreshToken(refresh_token);
        const result = await query('SELECT * FROM users WHERE id = $1 AND refresh_token = $2', [decoded.userId, refresh_token]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const tokens = generateTokens(user.id, user.email);
        await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [tokens.refreshToken, user.id]);

        res.json({
            data: { access_token: tokens.accessToken, refresh_token: tokens.refreshToken },
            error: null,
        });
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        next(err);
    }
});

// POST /auth/logout
router.post('/logout', async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (header?.startsWith('Bearer ')) {
            const jwt = require('jsonwebtoken');
            try {
                const decoded = jwt.verify(header.slice(7), require('../config/auth').jwtSecret);
                await query('UPDATE users SET refresh_token = NULL WHERE id = $1', [decoded.userId]);
            } catch (_) {}
        }
        res.json({ error: null });
    } catch (err) { next(err); }
});

module.exports = router;
