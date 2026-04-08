-- Create a view for the feed with likes and comments counts
CREATE OR REPLACE VIEW app_correcrat.feed_activities AS
SELECT 
    a.*,
    u.name as user_name,
    u.avatar_url as user_avatar,
    (SELECT COUNT(*)::int FROM app_correcrat.activity_likes l WHERE l.activity_id = a.id) as likes_count,
    (SELECT COUNT(*)::int FROM app_correcrat.activity_comments c WHERE c.activity_id = a.id) as comments_count,
    EXISTS (SELECT 1 FROM app_correcrat.activity_likes l WHERE l.activity_id = a.id AND l.user_id = auth.uid()) as is_liked_by_user
FROM 
    app_correcrat.activities a
JOIN 
    app_correcrat.users u ON a.user_id = u.id
WHERE 
    a.is_public = true;

-- Grant permissions for the view
GRANT SELECT ON app_correcrat.feed_activities TO anon, authenticated, service_role;
