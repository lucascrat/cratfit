-- Tabela para armazenar imagens do módulo de academia
CREATE TABLE IF NOT EXISTS gym_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'background', 'exercises', 'equipment', 'motivation'
    url TEXT NOT NULL,
    filename VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configurações do app
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para imagens customizadas de exercícios
CREATE TABLE IF NOT EXISTS exercise_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exercise_id VARCHAR(100) UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO app_settings (key, value, description) VALUES
    ('app_name', 'CORRECRAT', 'Nome do aplicativo'),
    ('primary_color', '#D4FF00', 'Cor primária do app'),
    ('enable_gym', 'true', 'Habilitar módulo de academia'),
    ('enable_personal', 'true', 'Habilitar personal trainer'),
    ('enable_social', 'true', 'Habilitar funcionalidades sociais'),
    ('app_version', '1.0.0', 'Versão do aplicativo')
ON CONFLICT (key) DO NOTHING;

-- Criar bucket para imagens do app (execute no Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('app-images', 'app-images', true);

-- RLS para gym_images - permitir leitura pública
ALTER TABLE gym_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de gym_images" ON gym_images
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção autenticada em gym_images" ON gym_images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir update para usuários autenticados" ON gym_images
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir delete para usuários autenticados" ON gym_images
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS para app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de app_settings" ON app_settings
    FOR SELECT USING (true);

CREATE POLICY "Permitir update para admins" ON app_settings
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS para exercise_images
ALTER TABLE exercise_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de exercise_images" ON exercise_images
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção em exercise_images" ON exercise_images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização em exercise_images" ON exercise_images
    FOR UPDATE USING (true);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_exercise_images_exercise_id ON exercise_images(exercise_id);
