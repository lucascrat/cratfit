const { Router } = require('express');
const { query } = require('../config/database');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = Router();

// POST /activities
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { title, type, distance_km, duration_seconds, pace, calories, elevation_gain_m,
            route_data, map_image_url, is_public, description, effort_level, notes } = req.body;

        const result = await query(
            `INSERT INTO activities (user_id, title, type, distance_km, duration_seconds, pace, calories,
             elevation_gain_m, route_data, map_image_url, is_public, description, effort_level, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
            [req.user.id, title, type, distance_km, duration_seconds, pace, calories,
             elevation_gain_m, route_data ? JSON.stringify(route_data) : null,
             map_image_url, is_public ?? true, description, effort_level, notes]
        );

        res.status(201).json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// GET /activities/mine
router.get('/mine', requireAuth, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const result = await query(
            'SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
            [req.user.id, limit]
        );
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /activities/feed
router.get('/feed', optionalAuth, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const result = await query(
            'SELECT * FROM feed_activities ORDER BY created_at DESC LIMIT $1',
            [limit]
        );
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /activities/range
router.get('/range', requireAuth, async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const result = await query(
            `SELECT * FROM activities WHERE user_id = $1
             AND created_at >= $2 AND created_at <= $3
             ORDER BY created_at DESC`,
            [req.user.id, start, end]
        );
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /activities/:id
router.get('/:id', async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM activities WHERE id = $1', [req.params.id]);
        if (!result.rows[0]) return res.status(404).json({ error: 'Activity not found' });
        res.json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// POST /activities/:id/like (toggle)
router.post('/:id/like', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = await query(
            'SELECT id FROM activity_likes WHERE activity_id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (existing.rows.length > 0) {
            await query('DELETE FROM activity_likes WHERE id = $1', [existing.rows[0].id]);
            res.json({ data: { liked: false }, error: null });
        } else {
            await query(
                'INSERT INTO activity_likes (activity_id, user_id) VALUES ($1, $2)',
                [id, req.user.id]
            );
            res.json({ data: { liked: true }, error: null });
        }
    } catch (err) { next(err); }
});

// GET /activities/:id/likes/count
router.get('/:id/likes/count', async (req, res, next) => {
    try {
        const result = await query(
            'SELECT COUNT(*) as count FROM activity_likes WHERE activity_id = $1',
            [req.params.id]
        );
        res.json({ count: parseInt(result.rows[0].count), error: null });
    } catch (err) { next(err); }
});

// GET /activities/:id/comments
router.get('/:id/comments', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT ac.*, u.id as user_id, u.name, u.avatar_url
             FROM activity_comments ac
             JOIN users u ON u.id = ac.user_id
             WHERE ac.activity_id = $1
             ORDER BY ac.created_at ASC`,
            [req.params.id]
        );

        // Transform to match Supabase nested format
        const comments = result.rows.map(r => ({
            id: r.id,
            activity_id: r.activity_id,
            user_id: r.user_id,
            content: r.content,
            created_at: r.created_at,
            users: { id: r.user_id, name: r.name, avatar_url: r.avatar_url },
        }));

        res.json({ data: comments, error: null });
    } catch (err) { next(err); }
});

// POST /activities/:id/comments
router.post('/:id/comments', requireAuth, async (req, res, next) => {
    try {
        const { content } = req.body;
        const result = await query(
            'INSERT INTO activity_comments (activity_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [req.params.id, req.user.id, content]
        );
        res.status(201).json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

module.exports = router;
