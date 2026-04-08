-- FitCrat Database Schema
-- PostgreSQL 18

-- gen_random_uuid() is built-in since PostgreSQL 13, no extension needed

CREATE SCHEMA IF NOT EXISTS fttcrat;
SET search_path TO fttcrat;

-- ==================== USERS ====================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    level VARCHAR(50) DEFAULT 'beginner',
    total_distance_km NUMERIC(10,2) DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    total_activities INTEGER DEFAULT 0,
    average_pace VARCHAR(10),
    is_vip BOOLEAN DEFAULT FALSE,
    vip_expires_at TIMESTAMPTZ,
    google_id VARCHAR(255),
    apple_id VARCHAR(255),
    country VARCHAR(10) DEFAULT 'BR',
    refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_apple_id ON users(apple_id) WHERE apple_id IS NOT NULL;

-- ==================== ACTIVITIES ====================
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    type VARCHAR(20) CHECK (type IN ('running','walking','cycling','gym')),
    distance_km NUMERIC(10,2) DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    pace VARCHAR(10),
    calories INTEGER DEFAULT 0,
    elevation_gain_m NUMERIC(10,2),
    route_data JSONB,
    map_image_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    description TEXT,
    effort_level INTEGER CHECK (effort_level BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);
CREATE INDEX idx_activities_public ON activities(is_public) WHERE is_public = TRUE;

-- ==================== SOCIAL ====================
CREATE TABLE activity_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);
CREATE INDEX idx_likes_activity ON activity_likes(activity_id);

CREATE TABLE activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_comments_activity ON activity_comments(activity_id);

-- ==================== COMMUNITIES ====================
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image TEXT,
    members_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- ==================== EVENTS ====================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ,
    location VARCHAR(255),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    cover_image TEXT,
    max_participants INTEGER,
    community_id UUID REFERENCES communities(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed','maybe','cancelled')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ==================== MESSAGING ====================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ==================== ACHIEVEMENTS ====================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(100)
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== FRIENDSHIPS ====================
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- ==================== SPONSORS ====================
CREATE TABLE sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TRAINING ====================
CREATE TABLE user_fitness_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    fitness_level VARCHAR(50),
    primary_goal VARCHAR(50),
    weight_kg NUMERIC(5,1),
    height_cm NUMERIC(5,1),
    birth_date DATE,
    gender VARCHAR(10),
    weekly_training_days INTEGER,
    accumulated_deficit_kcal NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(50),
    duration_weeks INTEGER,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE,
    week_number INTEGER,
    day_number INTEGER,
    title VARCHAR(255),
    description TEXT,
    workout_type VARCHAR(100),
    target_distance_km NUMERIC(10,2),
    target_duration_seconds INTEGER,
    target_pace VARCHAR(10),
    target_rpe INTEGER,
    exercises JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_assigned_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES training_plans(id),
    start_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    current_week INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES training_sessions(id),
    activity_id UUID REFERENCES activities(id),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    user_feedback TEXT,
    perceived_effort INTEGER,
    performance_score NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_training_log_user ON training_log(user_id);
CREATE INDEX idx_training_log_created ON training_log(created_at DESC);

-- ==================== NUTRITION ====================
CREATE TABLE user_nutrition_goals (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    daily_calories_target INTEGER,
    daily_protein_g NUMERIC(6,1),
    daily_carbs_g NUMERIC(6,1),
    daily_fats_g NUMERIC(6,1),
    water_target_ml INTEGER DEFAULT 2000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_meals_user_date ON meals(user_id, date);

CREATE TABLE meal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    name VARCHAR(255),
    calories INTEGER,
    protein_g NUMERIC(6,1),
    carbs_g NUMERIC(6,1),
    fats_g NUMERIC(6,1),
    portion_desc VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_water_intake (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount_ml INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE TABLE nutrition_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(100),
    cover_image TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    description TEXT,
    image_url TEXT,
    prep_time_minutes INTEGER,
    calories_per_serving INTEGER,
    ingredients JSONB,
    instructions JSONB,
    tags TEXT[],
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== EXERCISES / GYM ====================
CREATE TABLE muscle_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    color VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exercises (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    muscle_group_id VARCHAR(50) REFERENCES muscle_groups(id),
    equipment VARCHAR(100),
    difficulty VARCHAR(50),
    primary_muscle VARCHAR(100),
    secondary_muscles TEXT[],
    gif_path TEXT,
    description TEXT,
    tips TEXT,
    video_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_exercises_muscle ON exercises(muscle_group_id);
CREATE INDEX idx_exercises_active ON exercises(is_active) WHERE is_active = TRUE;

CREATE TABLE exercise_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id VARCHAR(100) UNIQUE REFERENCES exercises(id),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== CONTENT ====================
CREATE TABLE feed_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    category VARCHAR(100),
    duration_seconds INTEGER,
    author_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gym_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100),
    url TEXT,
    filename VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
