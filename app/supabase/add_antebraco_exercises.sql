-- Adicionar grupo muscular de antebraço
INSERT INTO app_correcrat.muscle_groups (id, name, icon, color) VALUES
    ('antebraco', 'Antebraço', 'pan_tool', 'from-slate-500 to-gray-500')
ON CONFLICT (id) DO NOTHING;

-- Exercícios de Antebraço baseados nos GIFs do Supabase Storage
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('anteb_apoiado_banco', 'Antebraço Apoiado no Banco', 'antebraco', 'barra', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Antebraco apoiado no banco.gif', 'Rosca de punho apoiado no banco.'),
    ('anteb_barra_costas', 'Antebraço Barra Costas', 'antebraco', 'barra', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Antebraco barra costas.gif', 'Rosca de punho barra atrás.'),
    ('anteb_barra_frente', 'Antebraço Barra Frente', 'antebraco', 'barra', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Antebraco barra frente.gif', 'Rosca de punho barra frente.'),
    ('anteb_anilhas', 'Antebraço com Anilhas', 'antebraco', 'anilha', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Antebraco com anilhas.gif', 'Rosca de punho com anilhas.'),
    ('anteb_enrrolar', 'Antebraço Movimento Enrolar', 'antebraco', 'corpo', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Antebraco movimento enrrolar.gif', 'Movimento de enrolar para antebraço.'),
    ('desvio_radial', 'Desvio Radial', 'antebraco', 'halteres', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/desvio radial.gif', 'Desvio radial do punho.'),
    ('flex_pulso_neutra', 'Flexão Pulso Neutra Halteres', 'antebraco', 'halteres', 'iniciante', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Flexao de Pulso Neutra Sentado com Halteres.gif', 'Flexão de pulso neutra sentado.'),
    ('flex_punho_barra', 'Flexão de Punho com Barra', 'antebraco', 'barra', 'iniciante', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Flexao de punho com barra.gif', 'Flexão de punho com barra.'),
    ('flex_punho_cabo', 'Flexão de Punho Cabo Chão', 'antebraco', 'cabo', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Flexao de Punho com Cabo em um Braco no Chao.gif', 'Flexão de punho com cabo.'),
    ('flex_punho_halt', 'Flexão de Punho Halteres', 'antebraco', 'halteres', 'iniciante', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Flexao de Punho com Halteres.gif', 'Flexão de punho com halteres.'),
    ('flex_punho_rev_anilha', 'Flexão Punho Reversa Anilha', 'antebraco', 'anilha', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Flexao de Punho Reversa com Anilha.gif', 'Flexão de punho reversa com anilha.'),
    ('flex_punho_rev_banco', 'Flexão Punho Reversa Banco', 'antebraco', 'barra', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Flexao de Punho Reversa com Barra Sobre um Banco.gif', 'Flexão de punho reversa no banco.'),
    ('hand_grip', 'Hand Grip', 'antebraco', 'handgrip', 'iniciante', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Hand Grip.gif', 'Hand grip para força de pegada.'),
    ('hiperext_punho_barra', 'Hiperextensão Punho Barra', 'antebraco', 'barra', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Hiperextensao de punho com barra.gif', 'Hiperextensão de punho com barra.'),
    ('hiperext_punho_halt', 'Hiperextensão Punho Halteres', 'antebraco', 'halteres', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Hiperextensao de punho com halteres.gif', 'Hiperextensão de punho com halteres.'),
    ('rolinho_anteb', 'Rolinho de Antebraço', 'antebraco', 'corpo', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Rolinho de antebraco.gif', 'Rolinho para antebraço.'),
    ('rosca_dedo_barra', 'Rosca de Dedo com Barra', 'antebraco', 'barra', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Rosca de dedo com barra.gif', 'Rosca de dedo com barra.'),
    ('rosca_dedo_halt', 'Rosca de Dedos com Halteres', 'antebraco', 'halteres', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Rosca de Dedos com Halteres.gif', 'Rosca de dedos com halteres.'),
    ('rosca_punho_costas', 'Rosca Punho Atrás Costas', 'antebraco', 'barra', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Rosca de Punho com Barra Atras das Costas.gif', 'Rosca de punho atrás das costas.'),
    ('rosca_punho_barra', 'Rosca de Punho com Barra', 'antebraco', 'barra', 'iniciante', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Rosca de punho com barra.gif', 'Rosca de punho com barra.'),
    ('rosca_punho_anilha', 'Rosca de Punho Neutra Anilhas', 'antebraco', 'anilha', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Rosca de Punho Pegada Neutra com Anilhas.gif', 'Rosca de punho com anilhas.'),
    ('rosca_punho_rev', 'Rosca de Punho Reversa Barra', 'antebraco', 'barra', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Rosca de Punho Reversa com Barra.gif', 'Rosca de punho reversa.'),
    ('rosca_inv_barra_ant', 'Rosca Inversa com Barra', 'antebraco', 'barra', 'intermediario', 'antebraço', ARRAY[]::TEXT[], 'Antebraco/Rosca Inversa com Barra.gif', 'Rosca inversa para antebraço.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, gif_path = EXCLUDED.gif_path, updated_at = NOW();

SELECT COUNT(*) as total_antebraco FROM app_correcrat.exercises WHERE muscle_group_id = 'antebraco';
