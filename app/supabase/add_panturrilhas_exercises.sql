-- Adicionar grupo muscular de panturrilhas
INSERT INTO app_correcrat.muscle_groups (id, name, icon, color) VALUES
    ('panturrilhas', 'Panturrilhas', 'airline_seat_legroom_normal', 'from-rose-500 to-pink-500')
ON CONFLICT (id) DO NOTHING;

-- Exercícios de Panturrilhas baseados nos GIFs do Supabase Storage
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('agach_sust_pant', 'Agachamento Sustentação Elevação Panturrilha', 'panturrilhas', 'corpo', 'intermediario', 'panturrilhas', ARRAY['pernas'], 'panturrilhas/Agachamento com Sustentacao e Elevacao de Panturrilhas.gif', 'Agachamento com elevação de panturrilhas.'),
    ('elev_pant_barra_pe', 'Elevação Panturrilha Barra em Pé', 'panturrilhas', 'barra', 'intermediario', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilha com Barra em Pe.gif', 'Elevação panturrilha barra.'),
    ('elev_pant_uni_hack', 'Elevação Panturrilha Unilateral Hack', 'panturrilhas', 'maquina', 'intermediario', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilha com Uma Perna na Maquina Hack.gif', 'Elevação panturrilha unilateral hack.'),
    ('elev_pant_maq_pe', 'Elevação Panturrilha Máquina Pé', 'panturrilhas', 'maquina', 'iniciante', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilha em Maquina em pe.gif', 'Elevação panturrilha máquina em pé.'),
    ('elev_pant_maquina', 'Elevação Panturrilha na Máquina', 'panturrilhas', 'maquina', 'iniciante', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilha na Maquina.gif', 'Elevação panturrilha máquina.'),
    ('elev_pant_leg', 'Elevação Panturrilha Leg Press', 'panturrilhas', 'maquina', 'intermediario', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilha no Leg Press.gif', 'Elevação panturrilha leg press.'),
    ('elev_pant_leg_horiz', 'Elevação Panturrilha Leg Press Horizontal', 'panturrilhas', 'maquina', 'intermediario', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilha no Leg Press horizontal.gif', 'Elevação panturrilha leg press horizontal.'),
    ('elev_pant_sent_alav', 'Elevação Panturrilha Sentado Alavanca', 'panturrilhas', 'maquina', 'iniciante', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilha Sentado com Alavanca.gif', 'Elevação panturrilha sentado alavanca.'),
    ('elev_pant_sent_barra', 'Elevação Panturrilha Sentado Barra', 'panturrilhas', 'barra', 'intermediario', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilha Sentado com Barra.gif', 'Elevação panturrilha sentado barra.'),
    ('elev_pant_sent_peso', 'Elevação Panturrilha Sentado Peso', 'panturrilhas', 'anilha', 'iniciante', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilha Sentado com Peso.gif', 'Elevação panturrilha sentado peso.'),
    ('elev_panturrilhas', 'Elevação de Panturrilhas', 'panturrilhas', 'corpo', 'iniciante', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilhas.gif', 'Elevação panturrilhas.'),
    ('elev_pant_hack', 'Elevação Panturrilhas no Hack', 'panturrilhas', 'maquina', 'intermediario', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao de Panturrilhas no Hack.gif', 'Elevação panturrilhas hack.'),
    ('elev_pant_uni_leg', 'Elevação Unilateral Panturrilha Leg Press', 'panturrilhas', 'maquina', 'intermediario', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Elevacao Unilateral de Panturrilha no Leg Press.gif', 'Elevação unilateral leg press.'),
    ('lev_pant_alavanca', 'Levantamento Panturrilha Alavanca', 'panturrilhas', 'maquina', 'iniciante', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Levantamento de panturrilha com alavanca.gif', 'Levantamento panturrilha alavanca.'),
    ('lev_pant_banco', 'Levantamento Panturrilha Apoio Banco', 'panturrilhas', 'corpo', 'iniciante', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Levantamento de panturrilha com apoio de banco.gif', 'Levantamento panturrilha banco.'),
    ('lev_pant_uma_perna', 'Levantamento Panturrilha Uma Perna', 'panturrilhas', 'corpo', 'intermediario', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Levantamento de panturrilha com apoio de uma perna.gif', 'Levantamento panturrilha uma perna.'),
    ('lev_pant_sobrecarga', 'Levantamento Panturrilha Sobrecarga', 'panturrilhas', 'halteres', 'intermediario', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Levantamento de panturrilha com apoio e sobrecarga.gif', 'Levantamento panturrilha sobrecarga.'),
    ('pant_pe_smith', 'Panturrilha em Pé Smith', 'panturrilhas', 'smith', 'intermediario', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Panturrilha em Pe no Smith.gif', 'Panturrilha em pé smith.'),
    ('pant_pe', 'Panturrilhas em Pé', 'panturrilhas', 'corpo', 'iniciante', 'panturrilhas', ARRAY[]::TEXT[], 'panturrilhas/Panturrilhas em Pe.gif', 'Panturrilhas em pé.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, gif_path = EXCLUDED.gif_path, updated_at = NOW();

SELECT COUNT(*) as total_panturrilhas FROM app_correcrat.exercises WHERE muscle_group_id = 'panturrilhas';
