const { Router } = require('express');
const { query } = require('../config/database');
const { requireAdmin } = require('../middleware/adminAuth');
const { generateTokens } = require('../services/authService');

const router = Router();

// POST /admin/login
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password !== process.env.ADMIN_PASS) {
        return res.status(401).json({ error: 'Invalid admin password' });
    }
    const tokens = generateTokens('admin', 'admin@fitcrat.app', true);
    res.json({ data: { access_token: tokens.accessToken }, error: null });
});

// ==================== EXERCISES CRUD ====================
router.get('/exercises', requireAdmin, async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM exercises ORDER BY name');
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

router.post('/exercises', requireAdmin, async (req, res, next) => {
    try {
        const { id, name, muscle_group_id, equipment, difficulty, primary_muscle,
            secondary_muscles, gif_path, description, tips, video_url, media_url } = req.body;
        const result = await query(
            `INSERT INTO exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle,
             secondary_muscles, gif_path, description, tips, video_url, media_url)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [id, name, muscle_group_id, equipment, difficulty, primary_muscle,
             secondary_muscles, gif_path, description, tips, video_url, media_url]
        );
        res.status(201).json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

router.put('/exercises/:id', requireAdmin, async (req, res, next) => {
    try {
        const updates = req.body;
        const allowed = ['name', 'muscle_group_id', 'equipment', 'difficulty', 'primary_muscle',
            'secondary_muscles', 'gif_path', 'description', 'tips', 'video_url', 'is_active', 'media_url'];
        const sets = [];
        const vals = [req.params.id];
        let idx = 2;

        for (const key of allowed) {
            if (updates[key] !== undefined) {
                sets.push(`${key} = $${idx++}`);
                vals.push(updates[key]);
            }
        }

        if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

        const result = await query(
            `UPDATE exercises SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, vals
        );
        res.json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// ==================== SPONSORS CRUD ====================
router.get('/sponsors', requireAdmin, async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM sponsors ORDER BY order_index');
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

router.post('/sponsors', requireAdmin, async (req, res, next) => {
    try {
        const { name, image_url, link_url, is_active, order_index } = req.body;
        const result = await query(
            'INSERT INTO sponsors (name, image_url, link_url, is_active, order_index) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [name, image_url, link_url, is_active ?? true, order_index ?? 0]
        );
        res.status(201).json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

router.put('/sponsors/:id', requireAdmin, async (req, res, next) => {
    try {
        const { name, image_url, link_url, is_active, order_index } = req.body;
        const result = await query(
            `UPDATE sponsors SET name = COALESCE($2, name), image_url = COALESCE($3, image_url),
             link_url = COALESCE($4, link_url), is_active = COALESCE($5, is_active),
             order_index = COALESCE($6, order_index) WHERE id = $1 RETURNING *`,
            [req.params.id, name, image_url, link_url, is_active, order_index]
        );
        res.json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

router.delete('/sponsors/:id', requireAdmin, async (req, res, next) => {
    try {
        await query('DELETE FROM sponsors WHERE id = $1', [req.params.id]);
        res.json({ error: null });
    } catch (err) { next(err); }
});

// ==================== GYM IMAGES ====================
router.get('/gym-images', requireAdmin, async (req, res, next) => {
    try {
        const { category } = req.query;
        let result;
        if (category) {
            result = await query('SELECT * FROM gym_images WHERE category = $1 ORDER BY created_at DESC', [category]);
        } else {
            result = await query('SELECT * FROM gym_images ORDER BY created_at DESC');
        }
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

router.post('/gym-images', requireAdmin, async (req, res, next) => {
    try {
        const { category, url, filename, description } = req.body;
        const result = await query(
            'INSERT INTO gym_images (category, url, filename, description) VALUES ($1,$2,$3,$4) RETURNING *',
            [category, url, filename, description]
        );
        res.status(201).json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// ==================== APP SETTINGS ====================
router.get('/settings', requireAdmin, async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM app_settings ORDER BY key');
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

router.put('/settings/:key', requireAdmin, async (req, res, next) => {
    try {
        const { value, description } = req.body;
        const result = await query(
            `INSERT INTO app_settings (key, value, description) VALUES ($1, $2, $3)
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = COALESCE(EXCLUDED.description, app_settings.description)
             RETURNING *`,
            [req.params.key, value, description]
        );
        res.json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// ==================== VIDEOS CRUD ====================
router.post('/videos', requireAdmin, async (req, res, next) => {
    try {
        const { title, description, video_url, thumbnail_url, category, duration_seconds } = req.body;
        const result = await query(
            `INSERT INTO feed_videos (title, description, video_url, thumbnail_url, category, duration_seconds)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [title, description, video_url, thumbnail_url, category, duration_seconds]
        );
        res.status(201).json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// ==================== MUSCLE GROUPS ====================
router.get('/muscle-groups', requireAdmin, async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM muscle_groups ORDER BY name');
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

module.exports = router;
