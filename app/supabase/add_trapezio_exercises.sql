-- Adicionar grupo muscular de trapézio
INSERT INTO app_correcrat.muscle_groups (id, name, icon, color) VALUES
    ('trapezio', 'Trapézio', 'keyboard_double_arrow_up', 'from-emerald-500 to-teal-500')
ON CONFLICT (id) DO NOTHING;

-- Exercícios de Trapézio baseados nos GIFs do Supabase Storage
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('dumbbell_raise', 'Dumbbell Raise', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Dumbbell-Raise.gif', 'Elevação com halteres.'),
    ('elev_delt_y_incl', 'Elevação Deltoide Y Inclinado', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Elevacao de Deltoide em Y com Halteres Inclinado.gif', 'Elevação em Y inclinado.'),
    ('elev_delt_post_incl', 'Elevação Deltoide Posterior Inclinado', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Elevacao de Deltoide Posterior com Halteres Inclinado.gif', 'Elevação posterior inclinado.'),
    ('elev_t_incl', 'Elevação de T Inclinada', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Elevacao de T com Halteres Inclinada.gif', 'Elevação em T inclinada.'),
    ('elev_lat_tronco_incl', 'Elevação Lateral Tronco Inclinado', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Elevacao lateral tronco inclinado.gif', 'Elevação lateral inclinado.'),
    ('elev_ombros_paralela', 'Elevações Ombros na Paralela', 'trapezio', 'corpo', 'avancado', 'trapézio', ARRAY['ombros'], 'trapezio/Elevacoes de ombros na paralela.gif', 'Elevações na paralela.'),
    ('enc_acima_cabeca', 'Encolhimento Acima Cabeça', 'trapezio', 'halteres', 'avancado', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento Acima da Cabeca.gif', 'Encolhimento acima da cabeça.'),
    ('enc_alavanca', 'Encolhimento com Alavanca', 'trapezio', 'maquina', 'iniciante', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento com Alavanca.gif', 'Encolhimento alavanca.'),
    ('enc_cabo', 'Encolhimento com Cabo', 'trapezio', 'cabo', 'intermediario', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento com Cabo.gif', 'Encolhimento cabo.'),
    ('enc_halt_declive', 'Encolhimento Halteres Declive', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento com Halteres em Declive.gif', 'Encolhimento declive.'),
    ('enc_halteres', 'Encolhimento com Halteres', 'trapezio', 'halteres', 'iniciante', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento com Halteres.gif', 'Encolhimento halteres.'),
    ('enc_barra', 'Encolhimento de Barra', 'trapezio', 'barra', 'iniciante', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento de Barra.gif', 'Encolhimento barra.'),
    ('enc_smith', 'Encolhimento Ombros Smith', 'trapezio', 'smith', 'iniciante', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento de Ombros na Maquina Smith.gif', 'Encolhimento smith.'),
    ('enc_tras_barra', 'Encolhimento Trás Barra', 'trapezio', 'barra', 'intermediario', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento de ombros por tras com barra.gif', 'Encolhimento trás barra.'),
    ('enc_incl_pronado', 'Encolhimento Inclinado Pronado', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento Inclinado Pronado.gif', 'Encolhimento inclinado pronado.'),
    ('enc_livre_halt', 'Encolhimento Livre Halteres', 'trapezio', 'halteres', 'iniciante', 'trapézio', ARRAY[]::TEXT[], 'trapezio/encolhimento livre com halteres.gif', 'Encolhimento livre halteres.'),
    ('enc_maquina', 'Encolhimento Máquina', 'trapezio', 'maquina', 'iniciante', 'trapézio', ARRAY[]::TEXT[], 'trapezio/encolhimento maquina.gif', 'Encolhimento máquina.'),
    ('enc_barra_livre', 'Encolhimento Barra Livre', 'trapezio', 'barra', 'iniciante', 'trapézio', ARRAY[]::TEXT[], 'trapezio/encolhimento na barra livre.gif', 'Encolhimento barra livre.'),
    ('enc_maquina2', 'Encolhimento na Máquina', 'trapezio', 'maquina', 'iniciante', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento na maquina.gif', 'Encolhimento máquina.'),
    ('enc_smith2', 'Encolhimento no Smith', 'trapezio', 'smith', 'iniciante', 'trapézio', ARRAY[]::TEXT[], 'trapezio/encolhimento no smith.gif', 'Encolhimento smith.'),
    ('enc_fechada_cross', 'Encolhimento Fechada Barra Cross', 'trapezio', 'cabo', 'intermediario', 'trapézio', ARRAY[]::TEXT[], 'trapezio/encolhimento pegada fechada barra no cross.gif', 'Encolhimento fechada cross.'),
    ('enc_gittleson', 'Encolhimento Sentado Gittleson', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY[]::TEXT[], 'trapezio/Encolhimento Sentado de Gittleson com Halteres.gif', 'Encolhimento Gittleson.'),
    ('enc_sent_banco', 'Encolhimento Sentado Banco Halteres', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY[]::TEXT[], 'trapezio/encolhimento sentado no banco com halteres.gif', 'Encolhimento sentado banco.'),
    ('enc_sent_incl', 'Encolhimento Sentado Inclinado Halteres', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY[]::TEXT[], 'trapezio/encolhimento sentado no banco inlinado com halteres.gif', 'Encolhimento sentado inclinado.'),
    ('face_pull', 'Face Pull', 'trapezio', 'cabo', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Face Pull.gif', 'Face pull.'),
    ('meio_agach_face_pull', 'Meio Agachado Puxada Rosto Cabo', 'trapezio', 'cabo', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Meio Agachado com Puxada para o Rosto no Cabo.gif', 'Meio agachado face pull.'),
    ('puxada_face_cruzado', 'Puxada Face Cabo Cruzado', 'trapezio', 'cabo', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Puxada de face com cabo cruzado.gif', 'Puxada face cruzado.'),
    ('puxada_rosto_joelhos', 'Puxada Rosto de Joelhos', 'trapezio', 'cabo', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Puxada para o Rosto de Joelhos.gif', 'Puxada rosto joelhos.'),
    ('remada_alta_w', 'Remada Alta Barra W', 'trapezio', 'barra', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Remada Alta Com Barra W.gif', 'Remada alta barra W.'),
    ('remada_alta_cabo', 'Remada Alta com Cabo', 'trapezio', 'cabo', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Remada Alta com Cabo.gif', 'Remada alta cabo.'),
    ('remada_alta_halt', 'Remada Alta com Halteres', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/remada alta com halteres.gif', 'Remada alta halteres.'),
    ('remada_alta_halt_uni', 'Remada Alta Halteres Unilateral', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Remada alta com halteres unilateral.gif', 'Remada alta unilateral.'),
    ('remada_alta_halter', 'Remada Alta com Halter', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Remada Alta com Halter.gif', 'Remada alta halter.'),
    ('remada_alta_aberta', 'Remada Alta Pegada Aberta Barra', 'trapezio', 'barra', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/remada alta pegada abeta com barra.gif', 'Remada alta aberta.'),
    ('remada_barra_trap', 'Remada com Barra', 'trapezio', 'barra', 'intermediario', 'trapézio', ARRAY['costas'], 'trapezio/Remada com barra.gif', 'Remada barra.'),
    ('remada_y_cabo', 'Remada em Y com Cabo', 'trapezio', 'cabo', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Remada em Y com cabo.gif', 'Remada em Y cabo.'),
    ('remada_45_trap', 'Remada Inclinada 45 Graus', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY['costas'], 'trapezio/Remada Inclinada a 45 Graus.gif', 'Remada inclinada 45.'),
    ('remada_inv_cable_incl', 'Remada Invertida Cable Inclinado', 'trapezio', 'cabo', 'intermediario', 'trapézio', ARRAY['costas'], 'trapezio/Remada invertida com cable inclinado.gif', 'Remada invertida cable.'),
    ('remada_inv_halt_incl', 'Remada Invertida Halteres Inclinado', 'trapezio', 'halteres', 'intermediario', 'trapézio', ARRAY['costas'], 'trapezio/remada invertida com halteres inclinado.gif', 'Remada invertida halteres.'),
    ('voador_post_cabo_trap', 'Voador Deltoide Posterior Cabo', 'trapezio', 'cabo', 'intermediario', 'trapézio', ARRAY['ombros'], 'trapezio/Voador de Deltoides Posterior com Cabo.gif', 'Voador posterior cabo.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, gif_path = EXCLUDED.gif_path, updated_at = NOW();

SELECT COUNT(*) as total_trapezio FROM app_correcrat.exercises WHERE muscle_group_id = 'trapezio';
