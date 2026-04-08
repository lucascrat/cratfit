-- Professional Training System for Running and Gym
CREATE SCHEMA IF NOT EXISTS app_correcrat;

-- User Fitness Profile (The "Base" for personalization)
CREATE TABLE IF NOT EXISTS app_correcrat.user_fitness_profiles (
    user_id UUID REFERENCES app_correcrat.users(id) ON DELETE CASCADE PRIMARY KEY,
    fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    primary_goal TEXT CHECK (primary_goal IN ('run_5k', 'run_10k', 'run_21k', 'run_42k', 'weight_loss', 'hypertrophy', 'strength')) DEFAULT 'run_5k',
    weight_kg DECIMAL,
    height_cm INTEGER,
    birth_date DATE,
    weekly_training_days INTEGER DEFAULT 3,
    max_heart_rate INTEGER,
    resting_heart_rate INTEGER,
    vo2_max DECIMAL,
    last_5k_time_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Plans (Templates)
CREATE TABLE IF NOT EXISTS app_correcrat.training_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('running', 'gym')),
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_weeks INTEGER NOT NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Plan Workouts (Steps within a plan)
CREATE TABLE IF NOT EXISTS app_correcrat.training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES app_correcrat.training_plans(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    day_number INTEGER NOT NULL, -- 1-7
    title TEXT NOT NULL,
    description TEXT,
    workout_type TEXT, -- 'easy_run', 'intervals', 'long_run', 'strength', 'upper_body', etc.
    target_distance_km DECIMAL,
    target_duration_seconds INTEGER,
    target_pace TEXT,
    target_rpe INTEGER, -- 1-10 (Rate of Perceived Exertion)
    exercises JSONB, -- For gym workouts: [{exercise_id, sets, reps, load_pct}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Assigned Plans
CREATE TABLE IF NOT EXISTS app_correcrat.user_assigned_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_correcrat.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES app_correcrat.training_plans(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('active', 'completed', 'dropped')) DEFAULT 'active',
    current_week INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Log (Specific completion of a planned session)
CREATE TABLE IF NOT EXISTS app_correcrat.training_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_correcrat.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES app_correcrat.training_sessions(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES app_correcrat.activities(id), -- Link to actual recorded activity
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    user_feedback TEXT,
    perceived_effort INTEGER, -- 1-10
    performance_score INTEGER -- 1-10 coach assessment
);

-- Enable RLS
ALTER TABLE app_correcrat.user_fitness_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.user_assigned_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.training_log ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own profile" ON app_correcrat.user_fitness_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read plans" ON app_correcrat.training_plans FOR SELECT USING (true);
CREATE POLICY "Public read sessions" ON app_correcrat.training_sessions FOR SELECT USING (true);
CREATE POLICY "Users can manage own assigned plans" ON app_correcrat.user_assigned_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own training log" ON app_correcrat.training_log FOR ALL USING (auth.uid() = user_id);

-- Permissions
GRANT ALL ON ALL TABLES IN SCHEMA app_correcrat TO anon, authenticated, service_role;
