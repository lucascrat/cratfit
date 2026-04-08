const { Router } = require('express');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// GET /training/profile
router.get('/profile', requireAuth, async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM user_fitness_profiles WHERE user_id = $1', [req.user.id]);
        res.json({ data: result.rows[0] || null, error: null });
    } catch (err) { next(err); }
});

// PUT /training/profile
router.put('/profile', requireAuth, async (req, res, next) => {
    try {
        const { fitness_level, primary_goal, weight_kg, height_cm, birth_date, gender,
            weekly_training_days, accumulated_deficit_kcal } = req.body;

        const result = await query(
            `INSERT INTO user_fitness_profiles (user_id, fitness_level, primary_goal, weight_kg, height_cm,
             birth_date, gender, weekly_training_days, accumulated_deficit_kcal)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
             ON CONFLICT (user_id) DO UPDATE SET
                fitness_level = COALESCE(EXCLUDED.fitness_level, user_fitness_profiles.fitness_level),
                primary_goal = COALESCE(EXCLUDED.primary_goal, user_fitness_profiles.primary_goal),
                weight_kg = COALESCE(EXCLUDED.weight_kg, user_fitness_profiles.weight_kg),
                height_cm = COALESCE(EXCLUDED.height_cm, user_fitness_profiles.height_cm),
                birth_date = COALESCE(EXCLUDED.birth_date, user_fitness_profiles.birth_date),
                gender = COALESCE(EXCLUDED.gender, user_fitness_profiles.gender),
                weekly_training_days = COALESCE(EXCLUDED.weekly_training_days, user_fitness_profiles.weekly_training_days),
                accumulated_deficit_kcal = COALESCE(EXCLUDED.accumulated_deficit_kcal, user_fitness_profiles.accumulated_deficit_kcal)
             RETURNING *`,
            [req.user.id, fitness_level, primary_goal, weight_kg, height_cm, birth_date, gender,
             weekly_training_days, accumulated_deficit_kcal]
        );

        res.json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// GET /training/plans?category=
router.get('/plans', async (req, res, next) => {
    try {
        const { category } = req.query;
        let result;
        if (category) {
            result = await query('SELECT * FROM training_plans WHERE category = $1', [category]);
        } else {
            result = await query('SELECT * FROM training_plans');
        }
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /training/assigned
router.get('/assigned', requireAuth, async (req, res, next) => {
    try {
        const result = await query(
            `SELECT uap.*, tp.title as plan_title, tp.description as plan_description,
                    tp.category as plan_category, tp.difficulty as plan_difficulty,
                    tp.duration_weeks as plan_duration_weeks, tp.tags as plan_tags
             FROM user_assigned_plans uap
             JOIN training_plans tp ON tp.id = uap.plan_id
             WHERE uap.user_id = $1 AND uap.status = 'active'
             LIMIT 1`,
            [req.user.id]
        );

        if (!result.rows[0]) {
            return res.json({ data: null, error: null });
        }

        const row = result.rows[0];
        const data = {
            id: row.id, user_id: row.user_id, plan_id: row.plan_id,
            start_date: row.start_date, status: row.status, current_week: row.current_week,
            created_at: row.created_at,
            training_plans: {
                id: row.plan_id, title: row.plan_title, description: row.plan_description,
                category: row.plan_category, difficulty: row.plan_difficulty,
                duration_weeks: row.plan_duration_weeks, tags: row.plan_tags,
            },
        };

        res.json({ data, error: null });
    } catch (err) { next(err); }
});

// POST /training/assign
router.post('/assign', requireAuth, async (req, res, next) => {
    try {
        const { plan_id } = req.body;
        const result = await query(
            `INSERT INTO user_assigned_plans (user_id, plan_id, start_date, status, current_week)
             VALUES ($1, $2, NOW(), 'active', 1) RETURNING *`,
            [req.user.id, plan_id]
        );
        res.status(201).json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// POST /training/log
router.post('/log', requireAuth, async (req, res, next) => {
    try {
        const { session_id, activity_id, user_feedback, perceived_effort, performance_score } = req.body;
        const result = await query(
            `INSERT INTO training_log (user_id, session_id, activity_id, user_feedback, perceived_effort, performance_score)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [req.user.id, session_id, activity_id, user_feedback, perceived_effort, performance_score]
        );
        res.status(201).json({ data: result.rows[0], error: null });
    } catch (err) { next(err); }
});

// GET /training/log/daily?date=YYYY-MM-DD
router.get('/log/daily', requireAuth, async (req, res, next) => {
    try {
        const dateStr = req.query.date || new Date().toISOString().split('T')[0];
        const nextDate = new Date(dateStr);
        nextDate.setDate(nextDate.getDate() + 1);

        const result = await query(
            `SELECT * FROM training_log WHERE user_id = $1
             AND created_at >= $2 AND created_at < $3
             ORDER BY created_at DESC`,
            [req.user.id, `${dateStr}T00:00:00`, nextDate.toISOString().split('T')[0] + 'T00:00:00']
        );
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /training/log/range?start=&end=
router.get('/log/range', requireAuth, async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const result = await query(
            `SELECT tl.*, tp.title as plan_title
             FROM training_log tl
             LEFT JOIN training_sessions ts ON ts.id = tl.session_id
             LEFT JOIN training_plans tp ON tp.id = ts.plan_id
             WHERE tl.user_id = $1 AND tl.created_at >= $2 AND tl.created_at <= $3
             ORDER BY tl.created_at DESC`,
            [req.user.id, start, end]
        );

        const data = result.rows.map(r => ({
            ...r,
            training_plans: r.plan_title ? { title: r.plan_title } : null,
        }));

        res.json({ data, error: null });
    } catch (err) { next(err); }
});

module.exports = router;
