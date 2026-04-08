const { Router } = require('express');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// GET /communities
router.get('/', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const result = await query(
            'SELECT * FROM communities ORDER BY members_count DESC LIMIT $1',
            [limit]
        );
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /communities/mine
router.get('/mine', requireAuth, async (req, res, next) => {
    try {
        const result = await query(
            `SELECT cm.community_id, cm.role, cm.joined_at, c.*
             FROM community_members cm
             JOIN communities c ON c.id = cm.community_id
             WHERE cm.user_id = $1`,
            [req.user.id]
        );

        const data = result.rows.map(r => ({
            community_id: r.community_id,
            role: r.role,
            joined_at: r.joined_at,
            communities: {
                id: r.id, name: r.name, description: r.description,
                cover_image: r.cover_image, members_count: r.members_count,
                created_by: r.created_by, is_private: r.is_private, created_at: r.created_at,
            },
        }));

        res.json({ data, error: null });
    } catch (err) { next(err); }
});

// GET /communities/:id
router.get('/:id', async (req, res, next) => {
    try {
        const cResult = await query('SELECT * FROM communities WHERE id = $1', [req.params.id]);
        if (!cResult.rows[0]) return res.status(404).json({ error: 'Community not found' });

        const mResult = await query(
            'SELECT user_id, role, joined_at FROM community_members WHERE community_id = $1',
            [req.params.id]
        );

        const data = { ...cResult.rows[0], community_members: mResult.rows };
        res.json({ data, error: null });
    } catch (err) { next(err); }
});

// POST /communities/:id/join
router.post('/:id/join', requireAuth, async (req, res, next) => {
    try {
        const result = await query(
            'INSERT INTO community_members (community_id, user_id) VALUES ($1, $2) RETURNING *',
            [req.params.id, req.user.id]
        );
        res.status(201).json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// DELETE /communities/:id/leave
router.delete('/:id/leave', requireAuth, async (req, res, next) => {
    try {
        await query(
            'DELETE FROM community_members WHERE community_id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ error: null });
    } catch (err) { next(err); }
});

// GET /communities/:id/membership
router.get('/:id/membership', requireAuth, async (req, res, next) => {
    try {
        const result = await query(
            'SELECT id FROM community_members WHERE community_id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ isMember: result.rows.length > 0, error: null });
    } catch (err) { next(err); }
});

module.exports = router;
