-- Adicionar tabela de eventos e políticas RLS para comunidades
-- Execute este SQL no Supabase Dashboard

-- RLS para Communities
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view communities" ON communities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Community creators can update" ON communities
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS para Community Members
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community members" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join communities" ON community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON community_members
  FOR DELETE USING (auth.uid() = user_id);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    cover_image TEXT,
    max_participants INTEGER,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Event creators can update" ON events
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Event creators can delete" ON events
  FOR DELETE USING (auth.uid() = created_by);

-- Tabela de Participantes de Eventos
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'maybe', 'cancelled')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- RLS para Event Participants
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event participants" ON event_participants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join events" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events" ON event_participants
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON event_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Função para contar participantes
CREATE OR REPLACE FUNCTION get_event_participants_count(event_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM event_participants WHERE event_id = event_uuid AND status = 'confirmed');
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar contagem de membros da comunidade
CREATE OR REPLACE FUNCTION update_community_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET members_count = members_count + 1 WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET members_count = members_count - 1 WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_community_member_change
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW EXECUTE PROCEDURE update_community_members_count();

-- Inserir comunidades iniciais de Crateús
INSERT INTO communities (name, description, cover_image, members_count) VALUES
('Corredores de Crateús', 'Comunidade oficial de corredores de Crateús-CE. Treinos, dicas e muito mais!', 'https://images.unsplash.com/photo-1552674605-4694553150b7?w=400', 256),
('Morada dos Ventos Runners', 'Treinos semanais na Morada dos Ventos 2 e 3. Venha correr conosco!', 'https://images.unsplash.com/photo-1533561052604-db53ae34259b?w=400', 148),
('Sertão Running Club', 'Corridas e trilhas no interior do Ceará. Explorando o sertão correndo!', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 320)
ON CONFLICT DO NOTHING;

-- Inserir eventos iniciais
INSERT INTO events (title, description, event_date, location, latitude, longitude, cover_image) VALUES
('Treino Coletivo Morada dos Ventos 3', 'Treino de corrida para todos os níveis na Morada dos Ventos 3. Traga água!', 
  (CURRENT_DATE + INTERVAL '2 days' + TIME '06:00:00')::timestamptz, 
  'Praça da Morada dos Ventos 3, Crateús', -5.1889, -40.6678,
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
  
('Night Run Morada dos Ventos 2', 'Corrida noturna iluminada pela lua! Traga lanterna ou farol.',
  (CURRENT_DATE + INTERVAL '3 days' + TIME '19:00:00')::timestamptz,
  'Entrada da Morada dos Ventos 2, Crateús', -5.1854, -40.6612,
  'https://images.unsplash.com/photo-1547483954-506b3810a2b4?w=400'),

('Corrida de Domingo - Centro', 'Corrida tradicional de domingo pela manhã saindo da Praça da Matriz.',
  (CURRENT_DATE + INTERVAL '4 days' + TIME '05:30:00')::timestamptz,
  'Praça da Matriz, Centro de Crateús', -5.1753, -40.6649,
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'),

('Treino Intervalado - Pista', 'Treino de tiros na pista do estádio. Ideal para melhorar o pace.',
  (CURRENT_DATE + INTERVAL '5 days' + TIME '18:00:00')::timestamptz,
  'Estádio Municipal de Crateús', -5.1801, -40.6701,
  'https://images.unsplash.com/photo-1461896836934-bc06bc3ade47?w=400')
ON CONFLICT DO NOTHING;
