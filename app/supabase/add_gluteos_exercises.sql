-- Exercícios de Glúteos baseados nos GIFs do Supabase Storage
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('abduc_quad_cabo', 'Abdução Quadril com Cabo', 'gluteos', 'cabo', 'intermediario', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Abducao de quadril com cabo.gif', 'Abdução quadril no cabo.'),
    ('abduc_quad_ponte', 'Abdução Quadril com Ponte', 'gluteos', 'corpo', 'intermediario', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Abducao de Quadril com Ponte.gif', 'Abdução quadril ponte.'),
    ('abduc_lat_alavanca', 'Abdução Lateral Quadril Alavanca', 'gluteos', 'maquina', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Abducao Lateral do Quadril com Alavanca.gif', 'Abdução lateral alavanca.'),
    ('agach_maq_abdutora', 'Agachamento Máquina Abdutora', 'gluteos', 'maquina', 'intermediario', 'glúteos', ARRAY['pernas'], 'gluteos/Agachamento na Maquina Abdutora.gif', 'Agachamento na abdutora.'),
    ('elev_pelv_barra', 'Elevação Pélvica Barra', 'gluteos', 'barra', 'intermediario', 'glúteos', ARRAY['pernas'], 'gluteos/Elevacao Pelvica Com Barra.gif', 'Hip thrust com barra.'),
    ('elev_pelv_maq', 'Elevação Pélvica Máquina', 'gluteos', 'maquina', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Elevacao Pelvica Na Maquina.gif', 'Hip thrust máquina.'),
    ('elev_pelv_smith', 'Elevação Pélvica Smith', 'gluteos', 'smith', 'intermediario', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Elevacao Pelvica na Maquina Smith.gif', 'Hip thrust smith.'),
    ('elev_pelv_uni', 'Elevação Pélvica Unilateral Barra', 'gluteos', 'barra', 'avancado', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Elevacao Pelvica Unilateral Com Barra.gif', 'Hip thrust unilateral.'),
    ('ext_quad_cabo2', 'Extensão Quadril com Cabo', 'gluteos', 'cabo', 'intermediario', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Extensao de Quadril com Cabo.gif', 'Extensão quadril cabo.'),
    ('ext_quad_pe_alav', 'Extensão Quadril Pé Alavanca', 'gluteos', 'maquina', 'intermediario', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Extensao de Quadril em Pe com Alavanca.gif', 'Extensão quadril em pé.'),
    ('glut_coice_alav', 'Glúteo Coice Alavanca', 'gluteos', 'maquina', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Gluteo Coice Na Alavanca.gif', 'Coice na alavanca.'),
    ('glut_coice_uni_polia', 'Glúteo Coice Unilateral Polia', 'gluteos', 'cabo', 'intermediario', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Gluteos Coice nilateral Polia Baixa.gif', 'Coice unilateral polia.'),
    ('glut_polia_baixa', 'Glúteos Polia Baixa', 'gluteos', 'cabo', 'intermediario', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Gluteos na Polia Baixa.gif', 'Glúteos polia baixa.'),
    ('maq_abduc_quad', 'Máquina Abdução Quadril', 'gluteos', 'maquina', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Maquina de Abducao de Quadril.gif', 'Máquina abdutora.'),
    ('ponte_halt', 'Ponte com Halteres', 'gluteos', 'halteres', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Ponte com Halteres.gif', 'Ponte com halteres.'),
    ('puxada_cabo_ajoel', 'Puxada Cabo Ajoelhada', 'gluteos', 'cabo', 'intermediario', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Puxada De Cabo Ajoelhada.gif', 'Puxada cabo ajoelhada.'),
    ('quatro_apoios2', 'Quatro Apoios', 'gluteos', 'corpo', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'gluteos/Quatro Apoios.gif', 'Quatro apoios.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, gif_path = EXCLUDED.gif_path, updated_at = NOW();

SELECT COUNT(*) as total_gluteos FROM app_correcrat.exercises WHERE muscle_group_id = 'gluteos';
