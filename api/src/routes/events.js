const { Router } = require('express');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// GET /events
router.get('/', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const result = await query(
            `SELECT e.*,
                    (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id AND ep.status = 'confirmed') AS participants_count
             FROM events e
             WHERE e.event_date >= NOW()
             ORDER BY e.event_date ASC LIMIT $1`,
            [limit]
        );
        // Shape to match Supabase nested format
        const data = result.rows.map(r => ({
            ...r,
            event_participants: [{ count: parseInt(r.participants_count) }],
        }));
        res.json({ data, error: null });
    } catch (err) { next(err); }
});

// GET /events/:id
router.get('/:id', async (req, res, next) => {
    try {
        const eResult = await query('SELECT * FROM events WHERE id = $1', [req.params.id]);
        if (!eResult.rows[0]) return res.status(404).json({ error: 'Event not found' });

        const pResult = await query(
            'SELECT user_id, status, joined_at FROM event_participants WHERE event_id = $1',
            [req.params.id]
        );

        const data = { ...eResult.rows[0], event_participants: pResult.rows };
        res.json({ data, error: null });
    } catch (err) { next(err); }
});

// POST /events/:id/join
router.post('/:id/join', requireAuth, async (req, res, next) => {
    try {
        const result = await query(
            `INSERT INTO event_participants (event_id, user_id, status) VALUES ($1, $2, 'confirmed') RETURNING *`,
            [req.params.id, req.user.id]
        );
        res.status(201).json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// DELETE /events/:id/leave
router.delete('/:id/leave', requireAuth, async (req, res, next) => {
    try {
        await query(
            'DELETE FROM event_participants WHERE event_id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ error: null });
    } catch (err) { next(err); }
});

// GET /events/:id/membership
router.get('/:id/membership', requireAuth, async (req, res, next) => {
    try {
        const result = await query(
            'SELECT id, status FROM event_participants WHERE event_id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        const row = result.rows[0];
        res.json({ isParticipant: !!row, status: row?.status || null, error: null });
    } catch (err) { next(err); }
});

// GET /events/:id/participants/count
router.get('/:id/participants/count', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT COUNT(*) as count FROM event_participants WHERE event_id = $1 AND status = 'confirmed'`,
            [req.params.id]
        );
        res.json({ count: parseInt(result.rows[0].count), error: null });
    } catch (err) { next(err); }
});

module.exports = router;
