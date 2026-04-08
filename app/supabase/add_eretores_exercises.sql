-- Adicionar grupo muscular de eretores da espinha
INSERT INTO app_correcrat.muscle_groups (id, name, icon, color) VALUES
    ('eretores', 'Eretores da Espinha', 'straighten', 'from-amber-500 to-orange-500')
ON CONFLICT (id) DO NOTHING;

-- Exercícios de Eretores da Espinha baseados nos GIFs do Supabase Storage
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('ext_lombar_peso', 'Extensão Lombar com Peso', 'eretores', 'anilha', 'intermediario', 'lombar', ARRAY[]::TEXT[], 'Eretoresdaespinha/Extensao Lombar com Peso.gif', 'Extensão lombar com peso.'),
    ('ext_lombar_sent', 'Extensão Lombar Sentada', 'eretores', 'maquina', 'iniciante', 'lombar', ARRAY[]::TEXT[], 'Eretoresdaespinha/Extensao lombar sentada.gif', 'Extensão lombar sentada na máquina.'),
    ('hiperext_torcao', 'Hiperextensão com Torção', 'eretores', 'maquina', 'intermediario', 'lombar', ARRAY['oblíquos'], 'Eretoresdaespinha/Hiperextensao com Torcao.gif', 'Hiperextensão com torção.'),
    ('hiperext_banco_plano', 'Hiperextensão Lombar Banco Plano', 'eretores', 'corpo', 'intermediario', 'lombar', ARRAY[]::TEXT[], 'Eretoresdaespinha/Hiperextensao de Lombar no Banco Plano.gif', 'Hiperextensão no banco plano.'),
    ('hiperext', 'Hiperextensão', 'eretores', 'maquina', 'iniciante', 'lombar', ARRAY['glúteos'], 'Eretoresdaespinha/Hiperextensao.gif', 'Hiperextensão clássica.'),
    ('hiperext_sapo', 'Hiperextensão Invertida Sapo', 'eretores', 'corpo', 'avancado', 'lombar', ARRAY['glúteos'], 'Eretoresdaespinha/Hiperextensao Invertida de Sapo.gif', 'Hiperextensão invertida posição sapo.'),
    ('hiperext_chao', 'Hiperextensão no Chão', 'eretores', 'corpo', 'iniciante', 'lombar', ARRAY[]::TEXT[], 'Eretoresdaespinha/Hiperextensao no Chao.gif', 'Hiperextensão no chão.'),
    ('superman_eretores', 'Superman', 'eretores', 'corpo', 'iniciante', 'lombar', ARRAY[]::TEXT[], 'Eretoresdaespinha/Superman.gif', 'Superman para eretores.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, gif_path = EXCLUDED.gif_path, updated_at = NOW();

SELECT COUNT(*) as total_eretores FROM app_correcrat.exercises WHERE muscle_group_id = 'eretores';
