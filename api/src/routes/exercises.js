const { Router } = require('express');
const { query } = require('../config/database');

const router = Router();

// Build full public URL for a gif_path
const R2_PUBLIC = process.env.R2_PUBLIC_URL || 'https://pub-4f9f26919fd14ab99c0e0208f073927d.r2.dev';

function withGifUrl(row) {
    if (!row) return row;
    if (row.gif_path && !row.media_url) {
        const encoded = row.gif_path.split('/').map(s => encodeURIComponent(s)).join('/');
        row.media_url = `${R2_PUBLIC}/${encoded}`;
    }
    return row;
}

function withGifUrls(rows) {
    return rows.map(withGifUrl);
}

// GET /exercises/muscle-groups
router.get('/muscle-groups', async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM muscle_groups ORDER BY name');
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /exercises/count
router.get('/count', async (req, res, next) => {
    try {
        const result = await query('SELECT COUNT(*) as count FROM exercises WHERE is_active = true');
        res.json({ count: parseInt(result.rows[0].count), error: null });
    } catch (err) { next(err); }
});

// GET /exercises?muscle_group_id=&search=&limit=
router.get('/', async (req, res, next) => {
    try {
        const { muscle_group_id, search, limit: limitStr } = req.query;
        const limit = parseInt(limitStr) || 200;
        const conditions = ['is_active = true'];
        const params = [];
        let idx = 1;

        if (muscle_group_id) {
            conditions.push(`muscle_group_id = $${idx++}`);
            params.push(muscle_group_id);
        }

        if (search && search.trim()) {
            conditions.push(`(name ILIKE $${idx} OR primary_muscle ILIKE $${idx} OR equipment ILIKE $${idx})`);
            params.push(`%${search.trim()}%`);
            idx++;
        }

        params.push(limit);
        const result = await query(
            `SELECT * FROM exercises WHERE ${conditions.join(' AND ')} ORDER BY name LIMIT $${idx}`,
            params
        );
        res.json({ data: withGifUrls(result.rows), error: null });
    } catch (err) { next(err); }
});

// GET /exercises/:id
router.get('/:id', async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM exercises WHERE id = $1', [req.params.id]);
        if (!result.rows[0]) return res.status(404).json({ error: 'Exercise not found' });
        res.json({ data: withGifUrl(result.rows[0]), error: null });
    } catch (err) { next(err); }
});

module.exports = router;
