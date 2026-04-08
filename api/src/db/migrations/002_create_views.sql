-- Views and Functions

SET search_path TO fttcrat;

-- Feed view: activities with user info + counts
CREATE OR REPLACE VIEW feed_activities AS
SELECT
    a.*,
    u.name AS user_name,
    u.avatar_url AS user_avatar_url,
    u.level AS user_level,
    (SELECT COUNT(*) FROM activity_likes al WHERE al.activity_id = a.id) AS likes_count,
    (SELECT COUNT(*) FROM activity_comments ac WHERE ac.activity_id = a.id) AS comments_count
FROM activities a
JOIN users u ON u.id = a.user_id
WHERE a.is_public = TRUE;

-- Increment video view count atomically
CREATE OR REPLACE FUNCTION increment_video_view(video_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE feed_videos SET views_count = views_count + 1 WHERE id = video_uuid;
END;
$$ LANGUAGE plpgsql;

-- Auto-update community members_count
CREATE OR REPLACE FUNCTION update_community_members_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE communities SET members_count = members_count + 1 WHERE id = NEW.community_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE communities SET members_count = GREATEST(members_count - 1, 0) WHERE id = OLD.community_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_community_members_count
AFTER INSERT OR DELETE ON community_members
FOR EACH ROW EXECUTE FUNCTION update_community_members_count();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_sponsors_updated BEFORE UPDATE ON sponsors FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_exercises_updated BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fitness_profile_updated BEFORE UPDATE ON user_fitness_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_nutrition_goals_updated BEFORE UPDATE ON user_nutrition_goals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
