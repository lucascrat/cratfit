const { Router } = require('express');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// GET /nutrition/goals
router.get('/goals', requireAuth, async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM user_nutrition_goals WHERE user_id = $1', [req.user.id]);
        res.json({ data: result.rows[0] || null, error: null });
    } catch (err) { next(err); }
});

// PUT /nutrition/goals
router.put('/goals', requireAuth, async (req, res, next) => {
    try {
        const { daily_calories_target, daily_protein_g, daily_carbs_g, daily_fats_g, water_target_ml } = req.body;
        const result = await query(
            `INSERT INTO user_nutrition_goals (user_id, daily_calories_target, daily_protein_g, daily_carbs_g, daily_fats_g, water_target_ml)
             VALUES ($1,$2,$3,$4,$5,$6)
             ON CONFLICT (user_id) DO UPDATE SET
                daily_calories_target = COALESCE(EXCLUDED.daily_calories_target, user_nutrition_goals.daily_calories_target),
                daily_protein_g = COALESCE(EXCLUDED.daily_protein_g, user_nutrition_goals.daily_protein_g),
                daily_carbs_g = COALESCE(EXCLUDED.daily_carbs_g, user_nutrition_goals.daily_carbs_g),
                daily_fats_g = COALESCE(EXCLUDED.daily_fats_g, user_nutrition_goals.daily_fats_g),
                water_target_ml = COALESCE(EXCLUDED.water_target_ml, user_nutrition_goals.water_target_ml)
             RETURNING *`,
            [req.user.id, daily_calories_target, daily_protein_g, daily_carbs_g, daily_fats_g, water_target_ml]
        );
        res.json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// POST /nutrition/meals
router.post('/meals', requireAuth, async (req, res, next) => {
    try {
        const { name, items, date } = req.body;
        const dateStr = date || new Date().toISOString().split('T')[0];

        // Find or create meal
        let mealResult = await query(
            'SELECT id FROM meals WHERE user_id = $1 AND name = $2 AND date = $3',
            [req.user.id, name, dateStr]
        );

        let mealId;
        if (mealResult.rows.length > 0) {
            mealId = mealResult.rows[0].id;
        } else {
            mealResult = await query(
                'INSERT INTO meals (user_id, name, date) VALUES ($1, $2, $3) RETURNING id',
                [req.user.id, name, dateStr]
            );
            mealId = mealResult.rows[0].id;
        }

        // Insert items
        if (items && items.length > 0) {
            const values = [];
            const placeholders = [];
            let idx = 1;

            for (const item of items) {
                placeholders.push(`($${idx},$${idx+1},$${idx+2},$${idx+3},$${idx+4},$${idx+5},$${idx+6})`);
                values.push(mealId, item.name, item.calories, item.protein, item.carbs, item.fats, item.portion);
                idx += 7;
            }

            const itemsResult = await query(
                `INSERT INTO meal_items (meal_id, name, calories, protein_g, carbs_g, fats_g, portion_desc)
                 VALUES ${placeholders.join(',')} RETURNING *`,
                values
            );

            res.status(201).json({
                data: { meal: { id: mealId, name, date: dateStr }, items: itemsResult.rows },
                error: null,
            });
        } else {
            res.status(201).json({
                data: { meal: { id: mealId, name, date: dateStr }, items: [] },
                error: null,
            });
        }
    } catch (err) { next(err); }
});

// GET /nutrition/meals/daily?date=YYYY-MM-DD
router.get('/meals/daily', requireAuth, async (req, res, next) => {
    try {
        const dateStr = req.query.date || new Date().toISOString().split('T')[0];

        const mealsResult = await query(
            `SELECT m.*, json_agg(mi.*) FILTER (WHERE mi.id IS NOT NULL) AS meal_items
             FROM meals m
             LEFT JOIN meal_items mi ON mi.meal_id = m.id
             WHERE m.user_id = $1 AND m.date = $2
             GROUP BY m.id
             ORDER BY m.created_at ASC`,
            [req.user.id, dateStr]
        );

        const waterResult = await query(
            'SELECT amount_ml FROM daily_water_intake WHERE user_id = $1 AND date = $2',
            [req.user.id, dateStr]
        );

        res.json({
            data: mealsResult.rows,
            water: waterResult.rows[0]?.amount_ml || 0,
            error: null,
        });
    } catch (err) { next(err); }
});

// GET /nutrition/meals/range?start=&end=
router.get('/meals/range', requireAuth, async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const result = await query(
            `SELECT m.*, json_agg(mi.*) FILTER (WHERE mi.id IS NOT NULL) AS meal_items
             FROM meals m
             LEFT JOIN meal_items mi ON mi.meal_id = m.id
             WHERE m.user_id = $1 AND m.date >= $2 AND m.date <= $3
             GROUP BY m.id
             ORDER BY m.date DESC`,
            [req.user.id, start, end]
        );
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// PUT /nutrition/water
router.put('/water', requireAuth, async (req, res, next) => {
    try {
        const { amount_ml, date } = req.body;
        const dateStr = date || new Date().toISOString().split('T')[0];

        const result = await query(
            `INSERT INTO daily_water_intake (user_id, date, amount_ml)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, date) DO UPDATE SET amount_ml = EXCLUDED.amount_ml
             RETURNING *`,
            [req.user.id, dateStr, amount_ml]
        );
        res.json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// GET /nutrition/guides
router.get('/guides', async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM nutrition_guides ORDER BY order_index');
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /nutrition/recipes
router.get('/recipes', async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM recipes ORDER BY created_at DESC');
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

module.exports = router;
