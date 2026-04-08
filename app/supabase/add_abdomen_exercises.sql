-- Exercícios de Abdômen baseados nos GIFs do Supabase Storage
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('abd_conc_bracos', 'Abdominal Concentrado Braços Estendidos', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abd Concentrado Bracos estendidos.gif', 'Abdominal concentrado braços estendidos.'),
    ('abd_banco', 'Abdominal Banco', 'abdomen', 'maquina', 'iniciante', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal banco.gif', 'Abdominal no banco.'),
    ('abd_bicicleta', 'Abdominal Bicicleta', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY['oblíquos'], 'abdominal/Abdominal Bicicleta.gif', 'Abdominal bicicleta.'),
    ('abd_carga', 'Abdominal com Carga', 'abdomen', 'anilha', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal com Carga.gif', 'Abdominal com peso.'),
    ('abd_concentrado', 'Abdominal Concentrado', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Concentrado.gif', 'Abdominal concentrado.'),
    ('abd_crunch_polia', 'Abdominal Crunch Polia Alta', 'abdomen', 'cabo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Crunch na Polia Alta em pe Executado no cross over.gif', 'Crunch na polia alta.'),
    ('abd_decl_incl', 'Abdominal Declinado Banco Inclinado', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Declinado (feito no banco inclinado)..gif', 'Abdominal banco inclinado.'),
    ('abd_declinado', 'Abdominal Declinado', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Declinado.gif', 'Abdominal declinado.'),
    ('abd_decl_outra', 'Abdominal Declinado Variação', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Declinado (outra visualizacao no banco)..gif', 'Abdominal declinado variação.'),
    ('abd_infra_paralela', 'Abdominal Infra Paralela', 'abdomen', 'corpo', 'avancado', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Infra na Paralela.gif', 'Infra na paralela.'),
    ('abd_infra_banco', 'Abdominal Infra Banco Plano', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Infra no Banco Plano (Elevacao de Pernas). Deitado no banco, elevando as pernas retas ou semiflexionadas, focado na parte inferior..gif', 'Infra banco plano.'),
    ('abd_infra_solo', 'Abdominal Infra Solo', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Infra no Solo-Elevacao de Pernas.gif', 'Infra no solo.'),
    ('abd_heel_touch', 'Abdominal Lateral Heel Touch', 'abdomen', 'corpo', 'iniciante', 'abdômen', ARRAY['oblíquos'], 'abdominal/Abdominal Lateral Tocando os Calcanhares (Heel Touch).gif', 'Heel touch oblíquos.'),
    ('abd_maquina2', 'Abdominal Máquina', 'abdomen', 'maquina', 'iniciante', 'abdômen', ARRAY[]::TEXT[], 'abdominal/ABDOMINAL MAQUINA.gif', 'Abdominal máquina.'),
    ('abd_obliquo_cruz', 'Abdominal Oblíquo Cruzado', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY['oblíquos'], 'abdominal/Abdominal Obliquo Cruzado (unilateral).gif', 'Oblíquo cruzado.'),
    ('abd_remador', 'Abdominal Remador Sentado', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Remador Sentado no Banco (ou Encolhimento de Pernas). Sentado na ponta do banco, trazendo os joelhos ao peito..gif', 'Remador sentado.'),
    ('abd_supra_alcance', 'Abdominal Supra com Alcance', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Supra com Alcance (entre as pernas). Variacao onde se eleva o tronco passando os bracos esticados no meio dos joelhos..gif', 'Supra com alcance.'),
    ('abd_supra_pernas', 'Abdominal Supra Pernas Elevadas', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Supra com Pernas Elevadas (90 graus). Variacao do abdominal curto mantendo as pernas suspensas para maior ativacao do core..gif', 'Supra pernas elevadas.'),
    ('abd_supra_peso', 'Abdominal Supra com Peso', 'abdomen', 'anilha', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'abdominal/Abdominal Supra com Peso.gif', 'Supra com peso.'),
    ('abd_supra2', 'Abdominal Supra', 'abdomen', 'corpo', 'iniciante', 'abdômen', ARRAY[]::TEXT[], 'abdominal/ABDOMINAL-SUPRA.gif', 'Abdominal supra clássico.'),
    ('escalador', 'Escalador Mountain Climber', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY['cardio'], 'abdominal/Escalador Mountain Climber.gif', 'Mountain climber.'),
    ('flexao_lateral_halter', 'Flexão Lateral Tronco Halter', 'abdomen', 'halteres', 'iniciante', 'abdômen', ARRAY['oblíquos'], 'abdominal/Flexao Lateral de Tronco com Halter, focada nos obliquos (cintura).gif', 'Flexão lateral halter.'),
    ('prancha_alta', 'Prancha Alta Isométrica', 'abdomen', 'corpo', 'iniciante', 'abdômen', ARRAY['core'], 'abdominal/Prancha Alta (Isometrica)..gif', 'Prancha alta.'),
    ('prancha2', 'Prancha', 'abdomen', 'corpo', 'iniciante', 'abdômen', ARRAY['core'], 'abdominal/PRANCHA.gif', 'Prancha clássica.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, gif_path = EXCLUDED.gif_path, updated_at = NOW();

SELECT COUNT(*) as total_abdomen FROM app_correcrat.exercises WHERE muscle_group_id = 'abdomen';
