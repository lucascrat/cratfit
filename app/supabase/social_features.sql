-- Social Features: Likes and Comments for Activities
CREATE TABLE IF NOT EXISTS app_correcrat.activity_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES app_correcrat.activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES app_correcrat.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

CREATE TABLE IF NOT EXISTS app_correcrat.activity_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES app_correcrat.activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES app_correcrat.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE app_correcrat.activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.activity_comments ENABLE ROW LEVEL SECURITY;

-- Policies: Likes
CREATE POLICY "Public Read Activity Likes" ON app_correcrat.activity_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can toggle own likes" ON app_correcrat.activity_likes
    FOR ALL USING (auth.uid() = user_id);

-- Policies: Comments
CREATE POLICY "Public Read Activity Comments" ON app_correcrat.activity_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own comments" ON app_correcrat.activity_comments
    FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON TABLE app_correcrat.activity_likes TO anon, authenticated, service_role;
GRANT ALL ON TABLE app_correcrat.activity_comments TO anon, authenticated, service_role;
