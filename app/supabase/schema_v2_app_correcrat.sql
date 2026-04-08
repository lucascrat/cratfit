-- SCHEMA DEFINITIVO: app_correcrat
-- Use este script para resetar/configurar o banco no schema correto.

-- 1. Criar Schema Personalizado
CREATE SCHEMA IF NOT EXISTS app_correcrat;

-- 2. Habilitar extensões (no schema public/extensions geralmente)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Configurar Storage (Bucket 'images')
-- Nota: Buckets ficam no schema 'storage' do sistema, não mudamos isso.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Tabelas do App (Schema: app_correcrat)

-- Users & Profiles
CREATE TABLE IF NOT EXISTS app_correcrat.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    level INTEGER DEFAULT 1,
    total_distance_km DECIMAL DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    total_activities INTEGER DEFAULT 0,
    average_pace TEXT,
    is_vip BOOLEAN DEFAULT FALSE,
    vip_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities
CREATE TABLE IF NOT EXISTS app_correcrat.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_correcrat.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('running', 'walking', 'cycling', 'gym')),
    distance_km DECIMAL,
    duration_seconds INTEGER,
    pace TEXT,
    calories INTEGER,
    elevation_gain_m DECIMAL,
    route_data JSONB,
    map_image_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communities
CREATE TABLE IF NOT EXISTS app_correcrat.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    members_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES app_correcrat.users(id),
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Members
CREATE TABLE IF NOT EXISTS app_correcrat.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES app_correcrat.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES app_correcrat.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Friendships (Adicionando pois é referenciada no frontend)
CREATE TABLE IF NOT EXISTS app_correcrat.friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_correcrat.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES app_correcrat.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS app_correcrat.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT
);

CREATE TABLE IF NOT EXISTS app_correcrat.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_correcrat.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES app_correcrat.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS)

-- Habilitar RLS em todas as tabelas
ALTER TABLE app_correcrat.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies para Users
DROP POLICY IF EXISTS "Users can view self" ON app_correcrat.users;
CREATE POLICY "Users can view self" ON app_correcrat.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update self" ON app_correcrat.users;
CREATE POLICY "Users can update self" ON app_correcrat.users
    FOR UPDATE USING (auth.uid() = id);

-- Policies para Activities
DROP POLICY IF EXISTS "Public activities" ON app_correcrat.activities;
CREATE POLICY "Public activities" ON app_correcrat.activities
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Insert own activities" ON app_correcrat.activities;
CREATE POLICY "Insert own activities" ON app_correcrat.activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Trigger de Criação de Usuário (Apontando para app_correcrat.users)

CREATE OR REPLACE FUNCTION app_correcrat.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO app_correcrat.users (id, email, name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    -- Nome do metadata ou primeira parte do email
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    -- Avatar do metadata (Google/Upload) ou vazio
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Se o trigger já existir no schema public, remova-o para evitar duplicidade
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE app_correcrat.handle_new_user();

-- 7. Policies de Storage (Bucket 'images')
-- Recriamos as policies para funcionar com qualquer usuário autenticado (simplificado)

DROP POLICY IF EXISTS "Public Acces Images" ON storage.objects;
CREATE POLICY "Public Acces Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

DROP POLICY IF EXISTS "Auth Upload Images" ON storage.objects;
CREATE POLICY "Auth Upload Images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- 8. Dados Iniciais (Opcional)
INSERT INTO app_correcrat.achievements (name, description, icon, category) VALUES
('Primeiros Passos', 'Complete sua primeira atividade', 'directions_run', 'beginner'),
('Maratonista', 'Complete uma maratona (42km)', 'military_tech', 'expert')
ON CONFLICT DO NOTHING;

-- Grant permissions (importante para o acesso via API)
GRANT USAGE ON SCHEMA app_correcrat TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA app_correcrat TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app_correcrat TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA app_correcrat TO anon, authenticated, service_role;
