-- Exercícios adicionais de Peitoral baseados nos GIFs do Supabase Storage
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('anilha_press', 'Anilha Press', 'peitoral', 'anilha', 'iniciante', 'peitoral', ARRAY['tríceps'], 'peitoral/Anilha Press.gif', 'Pressão com anilha para peitoral.'),
    ('apoio_frente_maos', 'Apoio de Frente com Mãos', 'peitoral', 'corpo', 'iniciante', 'peitoral', ARRAY['tríceps'], 'peitoral/Apoio de frente com m....gif', 'Flexão tradicional.'),
    ('apoio_frente_step', 'Apoio de Frente com Step', 'peitoral', 'corpo', 'intermediario', 'peitoral', ARRAY['tríceps'], 'peitoral/Apoio de frente com st....gif', 'Flexão com pés elevados.'),
    ('apoio_frente_joelhos', 'Apoio de Frente de Joelhos', 'peitoral', 'corpo', 'iniciante', 'peitoral', ARRAY['tríceps'], 'peitoral/Apoio de frente de joel....gif', 'Flexão facilitada nos joelhos.'),
    ('crossover_peitoral_sup', 'Crossover de Peitoral Superior', 'peitoral', 'cabo', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Crossover de peitoral s....gif', 'Cross over focando peitoral superior.'),
    ('crossover_alavanca', 'Crossover na Alavanca', 'peitoral', 'maquina', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Crossover na Alavanca.gif', 'Crossover na máquina alavanca.'),
    ('cross_polia_alta2', 'Cross Over Polia Alta 2', 'peitoral', 'cabo', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Cross over polia Alta.gif', 'Cross over polia alta variação.'),
    ('cross_polia_baixa2', 'Cross Over Polia Baixa 2', 'peitoral', 'cabo', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Cross over polia baixa.gif', 'Cross over polia baixa variação.'),
    ('cross_polia_media', 'Cross Over Polia Média', 'peitoral', 'cabo', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Cross over polia media.gif', 'Cross over com polia na altura média.'),
    ('crossover_unilateral', 'Crossover Unilateral', 'peitoral', 'cabo', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Crossover Unilateral co....gif', 'Crossover um braço de cada vez.'),
    ('crucifixo_baixo_cross', 'Crucifixo Baixo no Cross', 'peitoral', 'cabo', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/crucifixo beixo no cros....gif', 'Crucifixo com cabos baixos.'),
    ('crucifixo_cabo_deitado', 'Crucifixo com Cabo Deitado', 'peitoral', 'cabo', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Crucifixo com Cabo De....gif', 'Crucifixo deitado usando cabos.'),
    ('crucifixo_halteres2', 'Crucifixo com Halteres Reto', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Crucifixo com Halteres ....gif', 'Crucifixo banco reto com halteres.'),
    ('crucifixo_halteres_plano', 'Crucifixo Halteres Plano', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Crucifixo com halteres.gif', 'Crucifixo plano com halteres.'),
    ('crucifixo_deitado_gym', 'Crucifixo Deitado com Gym', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Crucifixo Deitado com ....gif', 'Crucifixo deitado variação.'),
    ('crucifixo_inclinado_banco', 'Crucifixo Inclinado no Banco', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/crucifixo inclinado banc....gif', 'Crucifixo no banco inclinado.'),
    ('crucifixo_inclinado_cross', 'Crucifixo Inclinado Cross', 'peitoral', 'cabo', 'intermediario', 'peitoral', ARRAY['ombros'], 'peitoral/Crucifixo Inclinado Cro....gif', 'Crucifixo inclinado no cross over.'),
    ('crucifixo_maquina2', 'Crucifixo na Máquina Peck', 'peitoral', 'maquina', 'iniciante', 'peitoral', ARRAY['ombros'], 'peitoral/Crucifixo Maquina.gif', 'Peck deck para isolamento.'),
    ('supino_banco_reto', 'Supino Banco Reto', 'peitoral', 'barra', 'intermediario', 'peitoral', ARRAY['tríceps'], 'peitoral/Supino banco reto.gif', 'Supino clássico no banco reto.'),
    ('supino_declinado_halter', 'Supino Declinado com Halter', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['tríceps'], 'peitoral/Supino declinado halter.gif', 'Supino declinado com halteres.'),
    ('supino_inclinado_halter2', 'Supino Inclinado Halter', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['tríceps'], 'peitoral/supino inclinado com halteres.gif', 'Supino inclinado com halteres.'),
    ('supino_inclinado_smith', 'Supino Inclinado no Smith', 'peitoral', 'smith', 'iniciante', 'peitoral', ARRAY['tríceps'], 'peitoral/Supino inclinado Smith.gif', 'Supino inclinado guiado.'),
    ('supino_reto_halter', 'Supino Reto com Halter', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['tríceps'], 'peitoral/Supino com Halteres.gif', 'Supino reto com halteres.'),
    ('voador_peck_deck', 'Voador Peck Deck', 'peitoral', 'maquina', 'iniciante', 'peitoral', ARRAY['ombros'], 'peitoral/Voador na Máquina.gif', 'Voador máquina peck deck.'),
    ('pullover_haltere2', 'Pullover Haltere', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['costas'], 'peitoral/Pullover com haltere.gif', 'Pullover para expansão torácica.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    gif_path = EXCLUDED.gif_path,
    updated_at = NOW();

-- Verificar total de exercícios
SELECT muscle_group_id, COUNT(*) as total FROM app_correcrat.exercises GROUP BY muscle_group_id ORDER BY muscle_group_id;
