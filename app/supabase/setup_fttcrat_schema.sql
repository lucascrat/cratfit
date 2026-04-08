-- SCRIPT DE INSTALAÇÃO COMPLETA: Schema fttcrat
-- ATENÇÃO: Isso apaga e recria o schema fttcrat e todas as suas tabelas.

-- 1. Limpeza Inicial (Fresh Start)
DROP SCHEMA IF EXISTS fttcrat CASCADE;

-- 2. Criar Schema
CREATE SCHEMA fttcrat;

-- 3. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 4. Criar Tabelas

-- Tabela: users (Perfil público do usuário)
CREATE TABLE fttcrat.users (
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

-- Tabela: activities (Atividades GPS)
CREATE TABLE fttcrat.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES fttcrat.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('running', 'walking', 'cycling', 'gym')),
    distance_km DECIMAL DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    pace TEXT,
    calories INTEGER DEFAULT 0,
    elevation_gain_m DECIMAL DEFAULT 0,
    route_data JSONB, -- Coordenadas do GPS
    map_image_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    description TEXT,
    effort_level INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: communities
CREATE TABLE fttcrat.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    members_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES fttcrat.users(id),
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: community_members
CREATE TABLE fttcrat.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES fttcrat.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES fttcrat.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Tabela: friendships
CREATE TABLE fttcrat.friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES fttcrat.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES fttcrat.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Tabela: achievements
CREATE TABLE fttcrat.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT
);

-- Tabela: user_achievements
CREATE TABLE fttcrat.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES fttcrat.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES fttcrat.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Configurar Row Level Security (RLS)

ALTER TABLE fttcrat.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fttcrat.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE fttcrat.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE fttcrat.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fttcrat.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE fttcrat.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fttcrat.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies: Users
CREATE POLICY "Public Read Users" ON fttcrat.users
    FOR SELECT USING (true);

CREATE POLICY "Users Updated Own Profile" ON fttcrat.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users Insert Own Profile" ON fttcrat.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies: Activities
CREATE POLICY "Read Public Activities" ON fttcrat.activities
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users Manage Own Activities" ON fttcrat.activities
    FOR ALL USING (auth.uid() = user_id);

-- Policies: Generics (Simplificadas para funcionar rápido)
CREATE POLICY "Public Read Communities" ON fttcrat.communities FOR SELECT USING (true);
CREATE POLICY "Authenticated Create Communities" ON fttcrat.communities FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public Read Achievements" ON fttcrat.achievements FOR SELECT USING (true);

-- 6. Configurar Trigger de Criação de Usuário (Auth -> fttcrat.users)

CREATE OR REPLACE FUNCTION fttcrat.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO fttcrat.users (id, email, name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    -- Tenta pegar nome do metadata, senão usa prefixo do email
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger no Auth (Remove anterior se existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE fttcrat.handle_new_user();

-- 7. Configurar Storage (Bucket de Imagens)

INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Remove antigas para evitar erros
DROP POLICY IF EXISTS "Public Acces Images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Owner Manage Images" ON storage.objects;

-- Criar novas policies
CREATE POLICY "Public Acces Images" ON storage.objects
FOR SELECT USING ( bucket_id = 'images' );

CREATE POLICY "Auth Upload Images" ON storage.objects
FOR INSERT WITH CHECK ( bucket_id = 'images' AND auth.role() = 'authenticated' );

CREATE POLICY "Owner Manage Images" ON storage.objects
FOR ALL USING ( bucket_id = 'images' AND auth.uid() = owner );

-- 8. Conceder Permissões de Acesso ao Schema para a API
GRANT USAGE ON SCHEMA fttcrat TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA fttcrat TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA fttcrat TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA fttcrat TO anon, authenticated, service_role;

-- 9. Inserir Dados Iniciais (Conquistas)
INSERT INTO fttcrat.achievements (name, description, icon, category) VALUES
('Primeiros Passos', 'Complete sua primeira atividade', 'directions_run', 'beginner'),
('Maratonista', 'Complete uma maratona (42km)', 'military_tech', 'expert'),
('Madrugador', 'Complete uma atividade antes das 6am', 'wb_twilight', 'special');
