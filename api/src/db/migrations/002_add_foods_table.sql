-- ============================================================
-- Migration 002: Foods database + nutrition daily summary
-- ============================================================

-- ---- Foods table ----
CREATE TABLE IF NOT EXISTS foods (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    name_en     VARCHAR(255),
    category    VARCHAR(80),        -- grains, proteins, vegetables, fruits, dairy, fats, beverages, sweets, prepared, fast_food
    serving_g   NUMERIC(7,1) DEFAULT 100,   -- reference portion in grams
    serving_desc VARCHAR(100)  DEFAULT '100g',
    calories    NUMERIC(7,1)  NOT NULL,
    protein_g   NUMERIC(6,2)  DEFAULT 0,
    carbs_g     NUMERIC(6,2)  DEFAULT 0,
    fats_g      NUMERIC(6,2)  DEFAULT 0,
    fiber_g     NUMERIC(6,2)  DEFAULT 0,
    sugar_g     NUMERIC(6,2)  DEFAULT 0,
    sodium_mg   NUMERIC(7,1)  DEFAULT 0,
    calcium_mg  NUMERIC(7,1)  DEFAULT 0,
    iron_mg     NUMERIC(6,2)  DEFAULT 0,
    potassium_mg NUMERIC(7,1) DEFAULT 0,
    vitamin_c_mg NUMERIC(6,2) DEFAULT 0,
    source      VARCHAR(20)   DEFAULT 'TACO',
    is_active   BOOLEAN       DEFAULT TRUE,
    created_at  TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_foods_name_trgm ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category  ON foods(category);

-- ---- Add fiber_g + source columns to meal_items (if not exist) ----
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS fiber_g     NUMERIC(6,1);
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS food_id     UUID REFERENCES foods(id) ON DELETE SET NULL;

-- ---- Nutrition daily history view (aggregates meals per user/day) ----
CREATE OR REPLACE VIEW nutrition_daily_totals AS
SELECT
    m.user_id,
    m.date,
    COALESCE(SUM(mi.calories), 0)::INTEGER    AS calories,
    COALESCE(SUM(mi.protein_g), 0)::NUMERIC   AS protein_g,
    COALESCE(SUM(mi.carbs_g), 0)::NUMERIC     AS carbs_g,
    COALESCE(SUM(mi.fats_g), 0)::NUMERIC      AS fats_g,
    COALESCE(SUM(mi.fiber_g), 0)::NUMERIC     AS fiber_g,
    COALESCE(dwi.amount_ml, 0)                AS water_ml,
    COUNT(DISTINCT m.id)::INTEGER             AS meal_count
FROM meals m
LEFT JOIN meal_items mi ON mi.meal_id = m.id
LEFT JOIN daily_water_intake dwi ON dwi.user_id = m.user_id AND dwi.date = m.date
GROUP BY m.user_id, m.date, dwi.amount_ml;
