const { Router } = require('express');
const { query } = require('../config/database');

const router = Router();

// GET /videos/feed
router.get('/feed', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const result = await query(
            `SELECT fv.*, u.name as user_name, u.avatar_url as user_avatar_url
             FROM feed_videos fv
             LEFT JOIN users u ON u.id = fv.author_id
             WHERE fv.is_active = true
             ORDER BY fv.created_at DESC LIMIT $1`,
            [limit]
        );

        const data = result.rows.map(r => ({
            ...r,
            users: r.user_name ? { name: r.user_name, avatar_url: r.user_avatar_url } : null,
        }));

        res.json({ data, error: null });
    } catch (err) { next(err); }
});

// POST /videos/:id/view
router.post('/:id/view', async (req, res, next) => {
    try {
        await query('SELECT increment_video_view($1)', [req.params.id]);
        res.json({ error: null });
    } catch (err) { next(err); }
});

module.exports = router;
