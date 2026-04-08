-- Garantir que todos os exercícios estão ativos
UPDATE app_correcrat.exercises SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- Verificar contagem de exercícios ativos por grupo muscular
SELECT muscle_group_id, COUNT(*) as total FROM app_correcrat.exercises WHERE is_active = true GROUP BY muscle_group_id ORDER BY muscle_group_id;
