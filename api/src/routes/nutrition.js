const { Router } = require('express');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// ─── Gemini AI helper ────────────────────────────────────────────────────────

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const NUTRITION_SYSTEM = `Você é um nutricionista clínico esportivo especialista em composição de alimentos brasileiros e internacionais.

REGRAS OBRIGATÓRIAS:
1. Use a Tabela TACO (Tabela Brasileira de Composição de Alimentos) e USDA como referências.
2. Sempre estime porções realistas baseadas em medidas caseiras brasileiras.
3. Considere o modo de preparo (frito adiciona gordura, grelhado não, etc).
4. Para alimentos sem quantidade especificada, use porções médias padrão:
   - Banana média: 100g | Arroz cozido: 1 colher servir = 120g | Feijão cozido: 1 concha = 86g
   - Frango peito grelhado: 1 filé médio = 120g | Ovo inteiro cozido: 50g | Pão francês: 50g
5. Arredonde calorias para inteiros e macros para 1 casa decimal.
6. A soma de (proteina*4 + carbs*4 + gordura*9) deve ser coerente com as calorias.
7. RESPONDA EXCLUSIVAMENTE com JSON válido, sem markdown, sem texto antes ou depois.`;

const JSON_SCHEMA = `{"items":[{"name":"Nome em português","portion":"quantidade com unidade","calories":0,"protein":0.0,"carbs":0.0,"fats":0.0,"fiber":0.0}],"total":{"calories":0,"protein":0.0,"carbs":0.0,"fats":0.0,"fiber":0.0},"analysis_comment":"análise breve"}`;

function parseGeminiJson(text) {
    if (!text) return null;
    let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    try { return JSON.parse(clean); } catch (_) {}
    const m = clean.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
    try {
        const fixed = clean.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        const m2 = fixed.match(/\{[\s\S]*\}/);
        if (m2) return JSON.parse(m2[0]);
    } catch (_) {}
    return null;
}

function sanitize(result) {
    const n = v => { const x = parseFloat(v); return isNaN(x) ? 0 : Math.round(x * 10) / 10; };
    const items = (result.items || []).map(item => ({
        name: item.name || 'Alimento',
        portion: item.portion || '1 porção',
        calories: Math.round(n(item.calories)),
        protein: n(item.protein),
        carbs: n(item.carbs),
        fats: n(item.fats),
        fiber: n(item.fiber),
    }));
    const total = items.reduce(
        (a, i) => ({ calories: a.calories + i.calories, protein: Math.round((a.protein + i.protein)*10)/10, carbs: Math.round((a.carbs + i.carbs)*10)/10, fats: Math.round((a.fats + i.fats)*10)/10, fiber: Math.round((a.fiber + i.fiber)*10)/10 }),
        { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );
    return { items, total, analysis_comment: result.analysis_comment || 'Análise concluída.' };
}

async function callGemini(contents) {
    if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not configured');
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.1, maxOutputTokens: 8192, topP: 0.8 },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ],
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini HTTP ${res.status}`);
    }
    const data = await res.json();
    // gemini-2.5-flash may return thinking blocks (thought: true) before the actual content.
    // Find the first part that is NOT a thought block.
    const parts = data.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find(p => !p.thought && p.text != null);
    return textPart?.text || parts[0]?.text || null;
}

// POST /nutrition/analyze/text  { description: "banana e frango" }
router.post('/analyze/text', requireAuth, async (req, res, next) => {
    try {
        const { description } = req.body;
        if (!description?.trim()) return res.status(400).json({ error: 'description is required' });

        const prompt = `${NUTRITION_SYSTEM}\n\nAnalise esta refeição: "${description}"\nRetorne SOMENTE JSON neste formato:\n${JSON_SCHEMA}`;
        const text = await callGemini([{ parts: [{ text: prompt }] }]);
        const result = parseGeminiJson(text);

        if (!result?.items?.length) {
            return res.status(422).json({ error: 'Não foi possível identificar os alimentos.' });
        }
        res.json({ data: sanitize(result), error: null });
    } catch (err) {
        next(err);
    }
});

// POST /nutrition/analyze/image  { imageBase64: "...", mimeType: "image/jpeg" }
router.post('/analyze/image', requireAuth, async (req, res, next) => {
    try {
        const { imageBase64, mimeType = 'image/jpeg' } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

        const prompt = `${NUTRITION_SYSTEM}\n\nAnalise esta foto de refeição. Identifique TODOS os alimentos visíveis, estime porções e calcule macronutrientes.\nRetorne SOMENTE JSON neste formato:\n${JSON_SCHEMA}`;
        const text = await callGemini([{
            parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
        }]);
        const result = parseGeminiJson(text);

        if (!result?.items?.length) {
            return res.status(422).json({ error: 'Não foi possível identificar os alimentos na imagem.' });
        }
        res.json({ data: sanitize(result), error: null });
    } catch (err) {
        next(err);
    }
});

// ─────────────────────────────────────────────────────────────────────────────

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
                placeholders.push(`($${idx},$${idx+1},$${idx+2},$${idx+3},$${idx+4},$${idx+5},$${idx+6},$${idx+7},$${idx+8})`);
                values.push(
                    mealId, item.name,
                    item.calories, item.protein || item.protein_g || 0,
                    item.carbs || item.carbs_g || 0, item.fats || item.fats_g || 0,
                    item.portion || item.portion_desc || null,
                    item.fiber || item.fiber_g || null,
                    item.food_id || null
                );
                idx += 9;
            }

            const itemsResult = await query(
                `INSERT INTO meal_items (meal_id, name, calories, protein_g, carbs_g, fats_g, portion_desc, fiber_g, food_id)
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

// ─── Foods database ──────────────────────────────────────────────────────────

// GET /nutrition/foods/search?q=banana&limit=10
// Returns foods from local DB matching the query (case-insensitive partial match)
router.get('/foods/search', async (req, res, next) => {
    try {
        const q     = (req.query.q || '').trim();
        const limit = Math.min(parseInt(req.query.limit) || 10, 30);

        if (!q || q.length < 2) {
            return res.json({ data: [], error: null });
        }

        const result = await query(
            `SELECT id, name, name_en, category, serving_g, serving_desc,
                    calories, protein_g, carbs_g, fats_g, fiber_g, sugar_g,
                    sodium_mg, calcium_mg, iron_mg, potassium_mg, vitamin_c_mg, source
             FROM foods
             WHERE is_active = TRUE
               AND (
                 name    ILIKE $1
                 OR name_en ILIKE $1
               )
             ORDER BY
               CASE WHEN name ILIKE $2 THEN 0 ELSE 1 END,
               name
             LIMIT $3`,
            [`%${q}%`, `${q}%`, limit]
        );

        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /nutrition/foods/categories
router.get('/foods/categories', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT category, COUNT(*)::int AS count
             FROM foods WHERE is_active = TRUE
             GROUP BY category ORDER BY count DESC`
        );
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// GET /nutrition/foods/popular — most frequently logged foods by this user
router.get('/foods/popular', requireAuth, async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 12, 30);
        const result = await query(
            `SELECT f.id, f.name, f.category, f.serving_g, f.serving_desc,
                    f.calories, f.protein_g, f.carbs_g, f.fats_g, f.fiber_g,
                    COUNT(mi.id)::int AS log_count
             FROM foods f
             JOIN meal_items mi ON mi.food_id = f.id
             JOIN meals m       ON m.id = mi.meal_id AND m.user_id = $1
             GROUP BY f.id
             ORDER BY log_count DESC
             LIMIT $2`,
            [req.user.id, limit]
        );
        res.json({ data: result.rows, error: null });
    } catch (err) { next(err); }
});

// ─── Nutrition Calendar / History ─────────────────────────────────────────────

// GET /nutrition/calendar?month=2026-04
// Returns daily totals for every day in the given month
router.get('/calendar', requireAuth, async (req, res, next) => {
    try {
        const month = req.query.month || new Date().toISOString().slice(0, 7);
        const [year, mon] = month.split('-').map(Number);
        if (!year || !mon) return res.status(400).json({ error: 'Invalid month format (YYYY-MM)' });

        const start = `${year}-${String(mon).padStart(2, '0')}-01`;
        const end   = new Date(year, mon, 0).toISOString().split('T')[0]; // last day of month

        const result = await query(
            `SELECT
                m.date::text,
                COALESCE(SUM(mi.calories), 0)::int          AS calories,
                COALESCE(SUM(mi.protein_g), 0)::numeric(6,1) AS protein_g,
                COALESCE(SUM(mi.carbs_g),   0)::numeric(6,1) AS carbs_g,
                COALESCE(SUM(mi.fats_g),    0)::numeric(6,1) AS fats_g,
                COALESCE(SUM(mi.fiber_g),   0)::numeric(6,1) AS fiber_g,
                COALESCE(MAX(dwi.amount_ml), 0)::int          AS water_ml,
                COUNT(DISTINCT m.id)::int                     AS meal_count
             FROM meals m
             LEFT JOIN meal_items         mi  ON mi.meal_id = m.id
             LEFT JOIN daily_water_intake dwi ON dwi.user_id = m.user_id AND dwi.date = m.date
             WHERE m.user_id = $1
               AND m.date >= $2::date
               AND m.date <= $3::date
             GROUP BY m.date
             ORDER BY m.date`,
            [req.user.id, start, end]
        );

        // Convert to { 'YYYY-MM-DD': { calories, protein_g, ... } } for easy frontend lookup
        const days = {};
        for (const row of result.rows) {
            days[row.date] = {
                calories:  row.calories,
                protein_g: parseFloat(row.protein_g),
                carbs_g:   parseFloat(row.carbs_g),
                fats_g:    parseFloat(row.fats_g),
                fiber_g:   parseFloat(row.fiber_g),
                water_ml:  row.water_ml,
                meal_count: row.meal_count,
            };
        }

        res.json({ data: days, error: null, month, start, end });
    } catch (err) { next(err); }
});

// GET /nutrition/history/streak — consecutive days with meals logged
router.get('/history/streak', requireAuth, async (req, res, next) => {
    try {
        const result = await query(
            `SELECT DISTINCT date::text FROM meals
             WHERE user_id = $1 AND date <= CURRENT_DATE
             ORDER BY date DESC
             LIMIT 90`,
            [req.user.id]
        );

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dates = result.rows.map(r => r.date);
        for (let i = 0; i < dates.length; i++) {
            const d = new Date(dates[i] + 'T12:00:00');
            const expected = new Date(today);
            expected.setDate(today.getDate() - i);
            expected.setHours(0, 0, 0, 0);
            if (d.toDateString() === expected.toDateString()) streak++;
            else break;
        }

        res.json({ data: { streak, total_days: dates.length }, error: null });
    } catch (err) { next(err); }
});

module.exports = router;
