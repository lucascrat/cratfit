const { Router } = require('express');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// GET /users/me
router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const result = await query(
            'SELECT * FROM users WHERE id = $1',
            [req.user.id]
        );
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        delete user.password_hash;
        delete user.refresh_token;

        res.json({ data: user, error: null });
    } catch (err) { next(err); }
});

// PUT /users/me
router.put('/me', requireAuth, async (req, res, next) => {
    try {
        const allowed = ['name', 'avatar_url', 'bio', 'location', 'level', 'total_distance_km',
            'total_time_seconds', 'total_activities', 'average_pace', 'country',
            'gender', 'weight', 'height', 'age', 'goal', 'experience', 'equipment', 'muscle_groups'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`);
        const values = [req.user.id, ...Object.values(updates)];

        const result = await query(
            `UPDATE users SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
            values
        );

        const user = result.rows[0];
        delete user.password_hash;
        delete user.refresh_token;

        res.json({ data: user, error: null });
    } catch (err) { next(err); }
});

// GET /users/:id
router.get('/:id', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT id, name, avatar_url, bio, location, level, total_distance_km,
                    total_time_seconds, total_activities, average_pace, is_vip, created_at
             FROM users WHERE id = $1`,
            [req.params.id]
        );
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ data: user, error: null });
    } catch (err) { next(err); }
});

module.exports = router;
