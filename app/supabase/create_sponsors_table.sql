-- Tabela de Patrocinadores (Carousel da Home)
CREATE TABLE IF NOT EXISTS app_correcrat.sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE app_correcrat.sponsors ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "Permitir leitura pública de patrocinadores" ON app_correcrat.sponsors
    FOR SELECT USING (is_active = true);

-- Gerenciamento por Admin (usando auth.uid IS NOT NULL por enquanto ou nível vip/admin se houver)
CREATE POLICY "Admin pode gerenciar patrocinadores" ON app_correcrat.sponsors
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Inserir alguns dados iniciais para exemplo (opcional)
-- INSERT INTO app_correcrat.sponsors (name, image_url) VALUES 
-- ('Patrocinador 1', 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800'),
-- ('Patrocinador 2', 'https://images.unsplash.com/photo-1461896836934-bc06bc3ade47?w=800');
