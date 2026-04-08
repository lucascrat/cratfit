-- Tabela para o Feed de Vídeos (Dicas, Exercícios, etc.)
CREATE TABLE IF NOT EXISTS fttcrat.feed_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT DEFAULT 'Geral',
    duration_seconds INTEGER,
    author_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE fttcrat.feed_videos ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública
CREATE POLICY "Public Feed Read" ON fttcrat.feed_videos
    FOR SELECT USING (true);

-- Permitir escrita apenas para usuários autenticados (Admin)
-- Idealmente restringir a role 'admin', mas vamos permitir auth por enquanto
CREATE POLICY "Admin Feed Write" ON fttcrat.feed_videos
    FOR ALL USING (auth.role() = 'authenticated');

-- Tabela para Exercícios (Atualizando se necessário para suportar GIFs do R2)
-- A tabela fttcrat.exercises já deve existir. Vamos garantir que tenha colunas para mídia externa.
-- Caso fttcrat.exercises não tenha 'gif_url' ou 'video_url', podemos adicionar.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'fttcrat' AND table_name = 'exercises' AND column_name = 'media_url') THEN
        ALTER TABLE fttcrat.exercises ADD COLUMN media_url TEXT;
    END IF;
END $$;
