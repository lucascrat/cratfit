const { Router } = require('express');
const { query } = require('../config/database');

const router = Router();

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
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /exercises/:id
router.get('/:id', async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM exercises WHERE id = $1', [req.params.id]);
        if (!result.rows[0]) return res.status(404).json({ error: 'Exercise not found' });
        res.json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

module.exports = router;
