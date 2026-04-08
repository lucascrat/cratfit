const { Router } = require('express');
const { query } = require('../config/database');

const router = Router();

// GET /sponsors
router.get('/', async (req, res, next) => {
    try {
        const result = await query(
            'SELECT * FROM sponsors WHERE is_active = true ORDER BY order_index ASC'
        );
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

module.exports = router;
