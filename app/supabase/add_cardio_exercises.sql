-- Exercícios de Cardio baseados nos GIFs do Supabase Storage
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('cardio_1', 'Cardio Exercício 1', 'cardio', 'corpo', 'iniciante', 'cardio', ARRAY[]::TEXT[], 'Cardio/1.gif', 'Exercício cardio.'),
    ('cardio_2', 'Cardio Exercício 2', 'cardio', 'corpo', 'iniciante', 'cardio', ARRAY[]::TEXT[], 'Cardio/2.gif', 'Exercício cardio.'),
    ('cardio_3', 'Cardio Exercício 3', 'cardio', 'corpo', 'iniciante', 'cardio', ARRAY[]::TEXT[], 'Cardio/3.gif', 'Exercício cardio.'),
    ('cardio_4', 'Cardio Exercício 4', 'cardio', 'corpo', 'iniciante', 'cardio', ARRAY[]::TEXT[], 'Cardio/4.gif', 'Exercício cardio.'),
    ('cardio_5', 'Cardio Exercício 5', 'cardio', 'corpo', 'iniciante', 'cardio', ARRAY[]::TEXT[], 'Cardio/5.gif', 'Exercício cardio.'),
    ('cardio_6', 'Cardio Exercício 6', 'cardio', 'corpo', 'intermediario', 'cardio', ARRAY[]::TEXT[], 'Cardio/6.gif', 'Exercício cardio.'),
    ('cardio_7', 'Cardio Exercício 7', 'cardio', 'corpo', 'intermediario', 'cardio', ARRAY[]::TEXT[], 'Cardio/7.gif', 'Exercício cardio.'),
    ('cardio_8', 'Cardio Exercício 8', 'cardio', 'corpo', 'intermediario', 'cardio', ARRAY[]::TEXT[], 'Cardio/8.gif', 'Exercício cardio.'),
    ('cardio_9', 'Cardio Exercício 9', 'cardio', 'corpo', 'intermediario', 'cardio', ARRAY[]::TEXT[], 'Cardio/9.gif', 'Exercício cardio.'),
    ('cardio_10', 'Cardio Exercício 10', 'cardio', 'corpo', 'avancado', 'cardio', ARRAY[]::TEXT[], 'Cardio/10.gif', 'Exercício cardio.'),
    ('cardio_11', 'Cardio Exercício 11', 'cardio', 'corpo', 'avancado', 'cardio', ARRAY[]::TEXT[], 'Cardio/11.gif', 'Exercício cardio.'),
    ('cardio_12', 'Cardio Exercício 12', 'cardio', 'corpo', 'avancado', 'cardio', ARRAY[]::TEXT[], 'Cardio/12.gif', 'Exercício cardio.'),
    ('cardio_13', 'Cardio Exercício 13', 'cardio', 'corpo', 'avancado', 'cardio', ARRAY[]::TEXT[], 'Cardio/13.gif', 'Exercício cardio.'),
    ('airbike2', 'Air Bike', 'cardio', 'maquina', 'avancado', 'cardio', ARRAY['corpo todo'], 'Cardio/Airbike.gif', 'Bicicleta resistência ar.'),
    ('bike_reclinada', 'Bicicleta Ergométrica Reclinada', 'cardio', 'maquina', 'iniciante', 'cardio', ARRAY['pernas'], 'Cardio/Bicicleta Ergometrica Reclinada.gif', 'Bike reclinada.'),
    ('bike2', 'Bicicleta Ergométrica', 'cardio', 'maquina', 'iniciante', 'cardio', ARRAY['pernas'], 'Cardio/Bike.gif', 'Bicicleta ergométrica.'),
    ('corrida_bike', 'Corrida Bicicleta Ergométrica', 'cardio', 'maquina', 'intermediario', 'cardio', ARRAY['pernas'], 'Cardio/Corrida na Bicicleta Ergometrica.gif', 'Corrida na bike.'),
    ('esteira_incl', 'Esteira com Inclinação', 'cardio', 'maquina', 'intermediario', 'cardio', ARRAY['pernas', 'glúteos'], 'Cardio/Esteira com Inclinacao.gif', 'Esteira inclinada.'),
    ('esteira2', 'Esteira Ergométrica', 'cardio', 'maquina', 'iniciante', 'cardio', ARRAY['pernas'], 'Cardio/Esteira Ergometrica.gif', 'Esteira ergométrica.'),
    ('hands_bike', 'Hands Bike', 'cardio', 'maquina', 'intermediario', 'cardio', ARRAY['braços'], 'Cardio/Hands Bike.gif', 'Bicicleta de mãos.'),
    ('caminhada_ondulatorio', 'Máquina Caminhada Ondulatório', 'cardio', 'maquina', 'intermediario', 'cardio', ARRAY['pernas'], 'Cardio/Maquina de Caminhada Ondulatorio.gif', 'Caminhada ondulatória.'),
    ('simulador_escada2', 'Simulador de Escada', 'cardio', 'maquina', 'intermediario', 'cardio', ARRAY['pernas', 'glúteos'], 'Cardio/Maquina Simulador Escada.gif', 'Simulador escada.'),
    ('plataforma_vibratoria', 'Plataforma Vibratória', 'cardio', 'maquina', 'iniciante', 'cardio', ARRAY[]::TEXT[], 'Cardio/Plataforma Vibratoria.gif', 'Plataforma vibratória.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, gif_path = EXCLUDED.gif_path, updated_at = NOW();

SELECT COUNT(*) as total_cardio FROM app_correcrat.exercises WHERE muscle_group_id = 'cardio';
