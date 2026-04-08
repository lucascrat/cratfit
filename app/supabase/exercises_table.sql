-- Tabela de Exercícios para a Biblioteca de Exercícios
-- Schema: app_correcrat

-- Criar tabela de grupos musculares
CREATE TABLE IF NOT EXISTS app_correcrat.muscle_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    color VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de exercícios
CREATE TABLE IF NOT EXISTS app_correcrat.exercises (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    muscle_group_id VARCHAR(50) REFERENCES app_correcrat.muscle_groups(id),
    equipment VARCHAR(100),
    difficulty VARCHAR(50) CHECK (difficulty IN ('iniciante', 'intermediario', 'avancado')),
    primary_muscle VARCHAR(100),
    secondary_muscles TEXT[], -- Array de músculos secundários
    gif_path TEXT,
    description TEXT,
    tips TEXT,
    video_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON app_correcrat.exercises(muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_exercises_name ON app_correcrat.exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON app_correcrat.exercises(difficulty);

-- Habilitar RLS
ALTER TABLE app_correcrat.muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.exercises ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública para muscle_groups
DROP POLICY IF EXISTS "Permitir leitura pública muscle_groups" ON app_correcrat.muscle_groups;
CREATE POLICY "Permitir leitura pública muscle_groups" ON app_correcrat.muscle_groups
    FOR SELECT USING (true);

-- Política de leitura pública para exercises
DROP POLICY IF EXISTS "Permitir leitura pública exercises" ON app_correcrat.exercises;
CREATE POLICY "Permitir leitura pública exercises" ON app_correcrat.exercises
    FOR SELECT USING (is_active = true);

-- Política para admin gerenciar exercises
DROP POLICY IF EXISTS "Admin pode gerenciar exercises" ON app_correcrat.exercises;
CREATE POLICY "Admin pode gerenciar exercises" ON app_correcrat.exercises
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Inserir grupos musculares
INSERT INTO app_correcrat.muscle_groups (id, name, icon, color) VALUES
    ('peitoral', 'Peitoral', 'keyboard_double_arrow_left', 'from-red-500 to-orange-500'),
    ('costas', 'Costas', 'keyboard_double_arrow_right', 'from-blue-500 to-cyan-500'),
    ('ombros', 'Ombros', 'expand_less', 'from-purple-500 to-pink-500'),
    ('biceps', 'Bíceps', 'fitness_center', 'from-orange-500 to-yellow-500'),
    ('triceps', 'Tríceps', 'fitness_center', 'from-green-500 to-emerald-500'),
    ('pernas', 'Pernas', 'directions_walk', 'from-indigo-500 to-purple-500'),
    ('gluteos', 'Glúteos', 'accessibility_new', 'from-pink-500 to-rose-500'),
    ('abdomen', 'Abdômen', 'local_fire_department', 'from-amber-500 to-red-500'),
    ('cardio', 'Cardio', 'favorite', 'from-rose-500 to-red-500'),
    ('trapezio', 'Trapézio', 'swap_vert', 'from-teal-500 to-cyan-500'),
    ('antebraco', 'Antebraço', 'pan_tool', 'from-slate-500 to-gray-500')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color;

-- Inserir exercícios de Peitoral
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('supino_reto_barra', 'Supino Reto com Barra', 'peitoral', 'barra', 'intermediario', 'peitoral', ARRAY['tríceps', 'ombros'], 'Peitoral/supindo reto barra.gif', 'Deite no banco reto, segure a barra na largura dos ombros e empurre para cima.'),
    ('supino_inclinado_barra', 'Supino Inclinado com Barra', 'peitoral', 'barra', 'intermediario', 'peitoral', ARRAY['tríceps', 'ombros'], 'Peitoral/Supino inclinado com barra.gif', 'No banco inclinado, empurre a barra focando na parte superior do peitoral.'),
    ('supino_declinado_barra', 'Supino Declinado com Barra', 'peitoral', 'barra', 'intermediario', 'peitoral', ARRAY['tríceps'], 'Peitoral/supino declinado barra.gif', 'No banco declinado, trabalhe a parte inferior do peitoral.'),
    ('supino_halteres', 'Supino com Halteres', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['tríceps', 'ombros'], 'Peitoral/Supino com Halteres.gif', 'Maior amplitude de movimento que a barra, ótimo para ativar mais fibras.'),
    ('supino_inclinado_halteres', 'Supino Inclinado com Halteres', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['tríceps', 'ombros'], 'Peitoral/supino inclinado com halteres.gif', 'Foco na parte superior do peitoral com halteres.'),
    ('supino_maquina', 'Supino na Máquina', 'peitoral', 'maquina', 'iniciante', 'peitoral', ARRAY['tríceps'], 'Peitoral/Supino na máquina.gif', 'Excelente para iniciantes, movimento guiado e seguro.'),
    ('supino_smith', 'Supino no Smith', 'peitoral', 'smith', 'iniciante', 'peitoral', ARRAY['tríceps', 'ombros'], 'Peitoral/Supino na máquina Smith.gif', 'Movimento guiado pela barra smith, ideal para treinar sozinho.'),
    ('crucifixo_halteres', 'Crucifixo com Halteres', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['ombros'], 'Peitoral/Crucifixo com halteres.gif', 'Isola o peitoral com movimento de abertura dos braços.'),
    ('crucifixo_inclinado', 'Crucifixo Inclinado', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['ombros'], 'Peitoral/Crucifixo com Halteres Inclinado.gif', 'Crucifixo no banco inclinado para peitoral superior.'),
    ('cross_polia_alta', 'Cross Over Polia Alta', 'peitoral', 'cabo', 'intermediario', 'peitoral', ARRAY['ombros'], 'Peitoral/Cross over polia Alta.gif', 'De pé no cross over, cruze os cabos para baixo contraindo o peitoral.'),
    ('cross_polia_baixa', 'Cross Over Polia Baixa', 'peitoral', 'cabo', 'intermediario', 'peitoral', ARRAY['ombros'], 'Peitoral/Cross over polia baixa.gif', 'Polia baixa para trabalhar parte superior do peitoral.'),
    ('voador_maquina', 'Voador na Máquina', 'peitoral', 'maquina', 'iniciante', 'peitoral', ARRAY['ombros'], 'Peitoral/Voador na Máquina.gif', 'Máquina pec deck, movimento controlado para isolar peitoral.'),
    ('crucifixo_maquina', 'Crucifixo Máquina', 'peitoral', 'maquina', 'iniciante', 'peitoral', ARRAY['ombros'], 'Peitoral/Crucifixo Maquina.gif', 'Voador na máquina para isolamento do peitoral.'),
    ('paralelas', 'Paralelas (Peito)', 'peitoral', 'corpo', 'avancado', 'peitoral', ARRAY['tríceps', 'ombros'], 'Peitoral/Paralelas.gif', 'Incline o tronco para frente para focar mais no peitoral.'),
    ('pullover_halter', 'Pullover com Haltere', 'peitoral', 'halteres', 'intermediario', 'peitoral', ARRAY['costas', 'tríceps'], 'Peitoral/Pullover com haltere.gif', 'Deitado atravessado no banco, leve o halter atrás da cabeça e volte.'),
    ('flexao_frente', 'Flexão de Frente', 'peitoral', 'corpo', 'iniciante', 'peitoral', ARRAY['tríceps', 'ombros'], 'Peitoral/Apoio de frente de joelhos.gif', 'Exercício clássico de peso corporal.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    gif_path = EXCLUDED.gif_path,
    updated_at = NOW();

-- Inserir exercícios de Costas
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('puxada_frente', 'Puxada Frontal', 'costas', 'maquina', 'iniciante', 'costas', ARRAY['bíceps'], 'Costas_/Puxada Alta.gif', 'Puxe a barra até o peito mantendo as costas contraídas.'),
    ('puxada_triangulo', 'Puxada com Triângulo', 'costas', 'maquina', 'intermediario', 'costas', ARRAY['bíceps'], 'Costas_/Puxada Alta com Triângulo.gif', 'Puxada com pegada neutra, foco no meio das costas.'),
    ('puxada_nuca', 'Puxada Alta Nuca', 'costas', 'maquina', 'intermediario', 'costas', ARRAY['bíceps'], 'Costas_/Puxada alta na polia nuca.gif', 'Puxada por trás da cabeça - cuidado com a execução.'),
    ('remada_baixa', 'Remada Sentada com Cabo', 'costas', 'cabo', 'iniciante', 'costas', ARRAY['bíceps'], 'Costas_/Remada Sentada com Cabo.gif', 'Sentado, puxe o cabo até o abdômen contraindo as escápulas.'),
    ('remada_curvada', 'Remada Curvada com Barra', 'costas', 'barra', 'intermediario', 'costas', ARRAY['bíceps', 'lombar'], 'Costas_/Remada Curvada com Barra.gif', 'Incline o tronco e puxe a barra até o abdômen.'),
    ('remada_unilateral', 'Remada Serrote', 'costas', 'halteres', 'intermediario', 'costas', ARRAY['bíceps'], 'Costas_/Serrote.gif', 'Apoie um joelho no banco e puxe o halter com uma mão.'),
    ('remada_maquina', 'Remada na Máquina', 'costas', 'maquina', 'iniciante', 'costas', ARRAY['bíceps'], 'Costas_/Remada Sentada na Máquina.gif', 'Remada guiada na máquina, excelente para iniciantes.'),
    ('remada_cavalinho', 'Remada Cavalinho', 'costas', 'barra', 'intermediario', 'costas', ARRAY['bíceps'], 'Costas_/Remada T com alavanca.gif', 'Remada T, apoio no peito, puxe com as costas.'),
    ('pulldown_corda', 'Pulldown com Corda', 'costas', 'cabo', 'intermediario', 'costas', ARRAY['bíceps'], 'Costas_/Pulldown com corda.gif', 'Puxada alta com corda para maior contração.'),
    ('barra_fixa', 'Barra Fixa', 'costas', 'corpo', 'avancado', 'costas', ARRAY['bíceps'], 'Costas_/Barra fixa.gif', 'Exercício clássico para largura das costas.'),
    ('barra_fixa_assistida', 'Barra Fixa Assistida', 'costas', 'maquina', 'iniciante', 'costas', ARRAY['bíceps'], 'Costas_/Barra Fixa Assistida.gif', 'Gravitron para ajudar na execução da barra fixa.'),
    ('levantamento_terra', 'Levantamento Terra', 'costas', 'barra', 'avancado', 'costas', ARRAY['glúteos', 'pernas'], 'Costas_/Levantamento Terra.gif', 'Exercício composto para toda a cadeia posterior.'),
    ('pullover_polia', 'Pullover na Polia', 'costas', 'cabo', 'intermediario', 'costas', ARRAY['tríceps'], 'Costas_/Pullover com Cabo.gif', 'Pullover no cross over para costas.'),
    ('remada_inclinada', 'Remada Inclinada com Halteres', 'costas', 'halteres', 'intermediario', 'costas', ARRAY['bíceps'], 'Costas_/remada com banco inclinado com haltres.gif', 'Deitado de bruços no banco inclinado, puxe os halteres.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    gif_path = EXCLUDED.gif_path,
    updated_at = NOW();

-- Inserir exercícios de Ombros
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('desenvolvimento_halteres', 'Desenvolvimento com Halteres', 'ombros', 'halteres', 'intermediario', 'ombros', ARRAY['tríceps'], 'Ombros/Desenvolvimento com Halteres.gif', 'Sentado ou em pé, empurre os halteres para cima.'),
    ('desenvolvimento_maquina', 'Desenvolvimento na Máquina', 'ombros', 'maquina', 'iniciante', 'ombros', ARRAY['tríceps'], 'Ombros/Desenvolvimento de ombro na máquina.gif', 'Movimento guiado para desenvolvimento de ombros.'),
    ('desenvolvimento_arnold', 'Desenvolvimento Arnold', 'ombros', 'halteres', 'avancado', 'ombros', ARRAY['tríceps'], 'Ombros/Desenvolvimento Arnold.gif', 'Rotação durante o movimento, criado por Arnold.'),
    ('desenvolvimento_barra', 'Desenvolvimento com Barra', 'ombros', 'barra', 'intermediario', 'ombros', ARRAY['tríceps'], 'Ombros/Desenvolvimento com Barra.gif', 'Desenvolvimento militar com barra à frente.'),
    ('elevacao_lateral', 'Elevação Lateral', 'ombros', 'halteres', 'iniciante', 'ombros', ARRAY[]::TEXT[], 'Ombros/elevação letaral com haltrers.gif', 'Eleve os halteres lateralmente até a altura dos ombros.'),
    ('elevacao_lateral_maquina', 'Elevação Lateral Máquina', 'ombros', 'maquina', 'iniciante', 'ombros', ARRAY[]::TEXT[], 'Ombros/Elevação lateral na máquina.gif', 'Elevação lateral na máquina para deltoides.'),
    ('elevacao_frontal', 'Elevação Frontal', 'ombros', 'halteres', 'iniciante', 'ombros', ARRAY[]::TEXT[], 'Ombros/elevação frontal com halteres.gif', 'Eleve o halter à frente até altura do ombro.'),
    ('elevacao_frontal_barra', 'Elevação Frontal com Barra', 'ombros', 'barra', 'iniciante', 'ombros', ARRAY[]::TEXT[], 'Ombros/Elevação Frontal com Barra.gif', 'Eleve a barra à frente trabalhando deltoides anterior.'),
    ('remada_alta', 'Remada Alta', 'ombros', 'barra', 'intermediario', 'ombros', ARRAY['trapézio'], 'Ombros/Remada Alta (1).gif', 'Puxe a barra até o queixo, cotovelos para fora.'),
    ('crucifixo_inverso', 'Crucifixo Inverso', 'ombros', 'halteres', 'intermediario', 'ombros', ARRAY['costas'], 'Ombros/Crucifixo Invertido com Halteres.gif', 'Inclinado para frente, abra os braços para posterior.'),
    ('voador_inverso', 'Voador Invertido', 'ombros', 'maquina', 'iniciante', 'ombros', ARRAY['costas'], 'Ombros/Voador invertido.gif', 'Máquina para deltoides posterior.'),
    ('elevacao_lateral_cabo', 'Elevação Lateral com Cabo', 'ombros', 'cabo', 'intermediario', 'ombros', ARRAY[]::TEXT[], 'Ombros/elevação unilateral no cross.gif', 'Elevação lateral unilateral no cross over.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    gif_path = EXCLUDED.gif_path,
    updated_at = NOW();

-- Inserir exercícios de Bíceps
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('rosca_direta', 'Rosca Direta com Barra', 'biceps', 'barra', 'iniciante', 'bíceps', ARRAY['antebraço'], 'Bíceps_/Rosca Direta com Barra.gif', 'Exercício básico para bíceps, mantenha cotovelos fixos.'),
    ('rosca_barra_w', 'Rosca com Barra W', 'biceps', 'barra', 'iniciante', 'bíceps', ARRAY['antebraço'], 'Bíceps_/rosca direta barra W.gif', 'Pegada confortável que reduz tensão nos punhos.'),
    ('rosca_halteres', 'Rosca com Halteres', 'biceps', 'halteres', 'iniciante', 'bíceps', ARRAY['antebraço'], 'Bíceps_/Rosca com halteres.gif', 'Rosca alternada ou simultânea com halteres.'),
    ('rosca_martelo', 'Rosca Martelo', 'biceps', 'halteres', 'iniciante', 'bíceps', ARRAY['antebraço'], 'Bíceps_/Rosca martelo.gif', 'Pegada neutra para braquial e braquiorradial.'),
    ('rosca_concentrada', 'Rosca Concentrada', 'biceps', 'halteres', 'intermediario', 'bíceps', ARRAY[]::TEXT[], 'Bíceps_/Rosca Concentrada.gif', 'Cotovelo apoiado na coxa, máximo isolamento.'),
    ('rosca_scott', 'Rosca Scott', 'biceps', 'barra', 'intermediario', 'bíceps', ARRAY[]::TEXT[], 'Bíceps_/rosca no scort.gif', 'No banco Scott para isolar o bíceps.'),
    ('rosca_scott_haltere', 'Rosca Scott com Haltere', 'biceps', 'halteres', 'intermediario', 'bíceps', ARRAY[]::TEXT[], 'Bíceps_/Rosca scott com halteres.gif', 'Rosca unilateral no banco Scott.'),
    ('rosca_banco_inclinado', 'Rosca Banco Inclinado', 'biceps', 'halteres', 'intermediario', 'bíceps', ARRAY[]::TEXT[], 'Bíceps_/Rosca Banco Inclinado.gif', 'Deitado no banco inclinado para alongar o bíceps.'),
    ('rosca_polia', 'Rosca no Cabo', 'biceps', 'cabo', 'iniciante', 'bíceps', ARRAY[]::TEXT[], 'Bíceps_/Rosca no Cabo.gif', 'Rosca na polia baixa, tensão constante.'),
    ('rosca_polia_alta', 'Rosca Polia Alta', 'biceps', 'cabo', 'intermediario', 'bíceps', ARRAY[]::TEXT[], 'Bíceps_/biceps polia alta dupla.gif', 'Posição crucifixo, puxe os cabos até a cabeça.'),
    ('rosca_maquina', 'Rosca na Máquina', 'biceps', 'maquina', 'iniciante', 'bíceps', ARRAY[]::TEXT[], 'Bíceps_/Máquina de rosca direta.gif', 'Movimento guiado na máquina de bíceps.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    gif_path = EXCLUDED.gif_path,
    updated_at = NOW();

-- Inserir exercícios de Tríceps
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('triceps_corda', 'Tríceps Pulley Corda', 'triceps', 'cabo', 'iniciante', 'tríceps', ARRAY[]::TEXT[], 'Tríceps/Tríceps pulley corda.gif', 'Puxe a corda para baixo e separe no final.'),
    ('triceps_barra', 'Tríceps Pulley Barra', 'triceps', 'cabo', 'iniciante', 'tríceps', ARRAY[]::TEXT[], 'Tríceps/Tríceps pulley barra.gif', 'Extensão de tríceps com barra reta no pulley.'),
    ('triceps_barra_v', 'Tríceps Pulley Barra V', 'triceps', 'cabo', 'iniciante', 'tríceps', ARRAY[]::TEXT[], 'Tríceps/Tríceps Pulley barra V.gif', 'Pegada mais confortável com barra V.'),
    ('triceps_frances', 'Tríceps Francês com Halter', 'triceps', 'halteres', 'intermediario', 'tríceps', ARRAY[]::TEXT[], 'Tríceps/Tríceps Francês com Halteres.gif', 'Halter atrás da cabeça, extensão dos braços.'),
    ('triceps_frances_barra', 'Tríceps Francês com Barra', 'triceps', 'barra', 'intermediario', 'tríceps', ARRAY[]::TEXT[], 'Tríceps/Triceps frances barra W.gif', 'Extensão sobre a cabeça com barra W.'),
    ('triceps_testa', 'Tríceps Testa com Barra', 'triceps', 'barra', 'intermediario', 'tríceps', ARRAY[]::TEXT[], 'Tríceps/Tríceps testa com barra.gif', 'Deitado, leve a barra até a testa e estenda.'),
    ('triceps_testa_haltere', 'Tríceps Testa com Halteres', 'triceps', 'halteres', 'intermediario', 'tríceps', ARRAY[]::TEXT[], 'Tríceps/Triceps testa com halteres.gif', 'Versão com halteres do tríceps testa.'),
    ('triceps_coice', 'Tríceps Coice', 'triceps', 'halteres', 'intermediario', 'tríceps', ARRAY[]::TEXT[], 'Tríceps/Tríceps Coice com Halteres.gif', 'Inclinado, estenda o braço para trás.'),
    ('triceps_banco', 'Tríceps no Banco', 'triceps', 'corpo', 'iniciante', 'tríceps', ARRAY['ombros'], 'Tríceps/Tríceps no Banco.gif', 'Apoio reverso no banco, desça e suba.'),
    ('supino_fechado', 'Supino Pegada Fechada', 'triceps', 'barra', 'intermediario', 'tríceps', ARRAY['peitoral'], 'Tríceps/Supino Fechado.gif', 'Supino com pegada fechada para tríceps.'),
    ('mergulho_triceps', 'Mergulho de Tríceps', 'triceps', 'corpo', 'avancado', 'tríceps', ARRAY['peitoral'], 'Tríceps/Mergulho de tríceps.gif', 'Paralelas com corpo ereto para tríceps.'),
    ('triceps_maquina', 'Tríceps na Máquina', 'triceps', 'maquina', 'iniciante', 'tríceps', ARRAY[]::TEXT[], 'Tríceps/Extensão de tríceps na máquina.gif', 'Extensão guiada na máquina.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    gif_path = EXCLUDED.gif_path,
    updated_at = NOW();

-- Inserir exercícios de Pernas
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('agachamento_livre', 'Agachamento Livre', 'pernas', 'barra', 'intermediario', 'pernas', ARRAY['glúteos', 'lombar'], 'Pernas/Agachamento.gif', 'Rei dos exercícios. Joelhos alinhados com os pés.'),
    ('agachamento_smith', 'Agachamento no Smith', 'pernas', 'smith', 'iniciante', 'pernas', ARRAY['glúteos'], 'Pernas/Agachamento no Smith.gif', 'Versão guiada do agachamento para iniciantes.'),
    ('agachamento_hack', 'Agachamento Hack', 'pernas', 'maquina', 'intermediario', 'pernas', ARRAY['glúteos'], 'Pernas/Agachamento na Máquina Hack.gif', 'Máquina que isola o quadríceps.'),
    ('agachamento_frontal', 'Agachamento Frontal', 'pernas', 'barra', 'avancado', 'pernas', ARRAY['core'], 'Pernas/Agachamento Frontal.gif', 'Barra à frente, foco no quadríceps.'),
    ('agachamento_bulgaro', 'Agachamento Búlgaro', 'pernas', 'halteres', 'intermediario', 'pernas', ARRAY['glúteos'], 'Pernas/Agachamento Búlgaro com Halteres.gif', 'Pé traseiro elevado no banco.'),
    ('agachamento_sumo', 'Agachamento Sumô', 'pernas', 'barra', 'intermediario', 'pernas', ARRAY['glúteos', 'adutores'], 'Pernas/Agachamento Sumô com Barra.gif', 'Pernas afastadas, pontas dos pés para fora.'),
    ('leg_press', 'Leg Press', 'pernas', 'maquina', 'iniciante', 'pernas', ARRAY['glúteos'], 'Pernas/Leg Press.gif', 'Empurre a plataforma sem travar os joelhos.'),
    ('leg_press_45', 'Leg Press 45°', 'pernas', 'maquina', 'iniciante', 'pernas', ARRAY['glúteos'], 'Pernas/Leg Press Horizontal.gif', 'Versão inclinada do leg press.'),
    ('cadeira_extensora', 'Cadeira Extensora', 'pernas', 'maquina', 'iniciante', 'pernas', ARRAY[]::TEXT[], 'Pernas/Cadeira extensora.gif', 'Isola o quadríceps, extensão de joelhos.'),
    ('mesa_flexora', 'Mesa Flexora', 'pernas', 'maquina', 'iniciante', 'pernas', ARRAY[]::TEXT[], 'Pernas/Mesa flexora.gif', 'Isola posterior da coxa.'),
    ('cadeira_flexora', 'Cadeira Flexora', 'pernas', 'maquina', 'iniciante', 'pernas', ARRAY[]::TEXT[], 'Pernas/Cadeira flexora.gif', 'Flexão de joelhos sentado.'),
    ('stiff', 'Stiff', 'pernas', 'barra', 'intermediario', 'pernas', ARRAY['glúteos', 'lombar'], 'Pernas/Stiff com barra.gif', 'Levantamento terra com pernas semi-estendidas.'),
    ('levantamento_terra_pernas', 'Levantamento Terra', 'pernas', 'barra', 'avancado', 'pernas', ARRAY['costas', 'glúteos'], 'Pernas/Levantamento Terra.gif', 'Exercício composto completo.'),
    ('afundo', 'Afundo com Halteres', 'pernas', 'halteres', 'intermediario', 'pernas', ARRAY['glúteos'], 'Pernas/Afundo com Halteres.gif', 'Avance um passo e desça até 90 graus.'),
    ('adutora', 'Máquina Adutora', 'pernas', 'maquina', 'iniciante', 'pernas', ARRAY[]::TEXT[], 'Pernas/Máquina de Adução de Quadril.gif', 'Trabalha a parte interna das coxas.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    gif_path = EXCLUDED.gif_path,
    updated_at = NOW();

-- Inserir exercícios de Glúteos
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('elevacao_pelvica', 'Elevação Pélvica com Barra', 'gluteos', 'barra', 'intermediario', 'glúteos', ARRAY['pernas'], 'Glúteos/Elevação Pélvica Com Barra.gif', 'Hip thrust, melhor exercício para glúteos.'),
    ('elevacao_pelvica_maquina', 'Elevação Pélvica na Máquina', 'gluteos', 'maquina', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'Glúteos/Elevação Pélvica Na Máquina.gif', 'Hip thrust guiado na máquina.'),
    ('gluteo_maquina', 'Glúteo na Máquina', 'gluteos', 'maquina', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'Glúteos/Glúteo Coice Na Máquina.gif', 'Coice de glúteo na máquina.'),
    ('gluteo_polia', 'Glúteo na Polia', 'gluteos', 'cabo', 'intermediario', 'glúteos', ARRAY[]::TEXT[], 'Glúteos/Glúteos na Polia Baixa.gif', 'Extensão de quadril no cross over.'),
    ('abdutora', 'Máquina Abdutora', 'gluteos', 'maquina', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'Glúteos/Máquina de Abdução de Quadril.gif', 'Abre as pernas trabalhando glúteo médio.'),
    ('quatro_apoios', 'Quatro Apoios', 'gluteos', 'corpo', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'Glúteos/Quatro Apoios.gif', 'Exercício de solo para glúteos.'),
    ('ponte_haltere', 'Ponte com Haltere', 'gluteos', 'halteres', 'iniciante', 'glúteos', ARRAY[]::TEXT[], 'Glúteos/Ponte com Halteres.gif', 'Elevação pélvica no solo com peso.'),
    ('extensao_quadril_cabo', 'Extensão de Quadril com Cabo', 'gluteos', 'cabo', 'intermediario', 'glúteos', ARRAY[]::TEXT[], 'Glúteos/Extensão de Quadril com Cabo.gif', 'Extensão de quadril unilateral.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    gif_path = EXCLUDED.gif_path,
    updated_at = NOW();

-- Inserir exercícios de Abdômen
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('abdominal_supra', 'Abdominal Supra', 'abdomen', 'corpo', 'iniciante', 'abdômen', ARRAY[]::TEXT[], 'Abdominal/ABDOMINAL-SUPRA.gif', 'Eleve os ombros do chão contraindo o abdômen.'),
    ('abdominal_maquina', 'Abdominal na Máquina', 'abdomen', 'maquina', 'iniciante', 'abdômen', ARRAY[]::TEXT[], 'Abdominal/ABDOMINAL MAQUINA.gif', 'Abdominal guiado na máquina com carga.'),
    ('abdominal_polia', 'Abdominal na Polia', 'abdomen', 'cabo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'Abdominal/Abdominal Crunch na Polia Alta (em pé). Executado no cross over puxando a corda para baixo, focando na contração do abdômen.gif', 'Ajoelhado, puxe a corda para baixo.'),
    ('abdominal_infra', 'Abdominal Infra', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'Abdominal/Abdominal Infra no Solo-Elevação de Pernas.gif', 'Elevação de pernas focando parte inferior.'),
    ('abdominal_paralela', 'Abdominal na Paralela', 'abdomen', 'corpo', 'avancado', 'abdômen', ARRAY[]::TEXT[], 'Abdominal/Abdominal Infra na Paralela.gif', 'Suspenso nas paralelas, eleve as pernas.'),
    ('prancha', 'Prancha', 'abdomen', 'corpo', 'iniciante', 'abdômen', ARRAY[]::TEXT[], 'Abdominal/Prancha Alta (Isométrica)..gif', 'Posição estática fortalecendo o core.'),
    ('bicicleta', 'Abdominal Bicicleta', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY['oblíquos'], 'Abdominal/Abdominal Bicicleta.gif', 'Alterne cotovelo-joelho em movimento de pedalar.'),
    ('obliquo', 'Abdominal Oblíquo', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'Abdominal/Abdominal Oblíquo Cruzado (unilateral).gif', 'Rotação do tronco para trabalhar os oblíquos.'),
    ('abdominal_declinado', 'Abdominal Declinado', 'abdomen', 'corpo', 'intermediario', 'abdômen', ARRAY[]::TEXT[], 'Abdominal/Abdominal Declinado.gif', 'No banco declinado para maior intensidade.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    gif_path = EXCLUDED.gif_path,
    updated_at = NOW();

-- Inserir exercícios de Cardio
INSERT INTO app_correcrat.exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description) VALUES
    ('esteira', 'Esteira Ergométrica', 'cardio', 'maquina', 'iniciante', 'cardio', ARRAY['pernas'], 'Cardio/Esteira Ergométrica.gif', 'Caminhada ou corrida na esteira.'),
    ('esteira_inclinada', 'Esteira Inclinada', 'cardio', 'maquina', 'intermediario', 'cardio', ARRAY['pernas', 'glúteos'], 'Cardio/Esteira com Inclinação.gif', 'Caminhada em inclinação para maior intensidade.'),
    ('bicicleta_cardio', 'Bicicleta Ergométrica', 'cardio', 'maquina', 'iniciante', 'cardio', ARRAY['pernas'], 'Cardio/Bike.gif', 'Pedalada de baixo impacto.'),
    ('eliptico', 'Elíptico', 'cardio', 'maquina', 'iniciante', 'cardio', ARRAY['pernas', 'braços'], 'Cardio/Máquina Elíptica.gif', 'Movimento completo de baixo impacto.'),
    ('simulador_escada', 'Simulador de Escada', 'cardio', 'maquina', 'intermediario', 'cardio', ARRAY['pernas', 'glúteos'], 'Cardio/Máquina Simulador Escada.gif', 'Suba escadas sem parar.'),
    ('airbike', 'Air Bike', 'cardio', 'maquina', 'avancado', 'cardio', ARRAY['corpo todo'], 'Cardio/Airbike.gif', 'Bicicleta de resistência ao ar.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    gif_path = EXCLUDED.gif_path,
    updated_at = NOW();

-- Função para buscar exercícios por grupo muscular
CREATE OR REPLACE FUNCTION app_correcrat.get_exercises_by_muscle_group(p_muscle_group_id VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id VARCHAR,
    name VARCHAR,
    muscle_group_id VARCHAR,
    equipment VARCHAR,
    difficulty VARCHAR,
    primary_muscle VARCHAR,
    secondary_muscles TEXT[],
    gif_path TEXT,
    description TEXT,
    tips TEXT,
    video_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        e.muscle_group_id,
        e.equipment,
        e.difficulty,
        e.primary_muscle,
        e.secondary_muscles,
        e.gif_path,
        e.description,
        e.tips,
        e.video_url
    FROM app_correcrat.exercises e
    WHERE e.is_active = true
        AND (p_muscle_group_id IS NULL OR e.muscle_group_id = p_muscle_group_id)
    ORDER BY e.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION app_correcrat.get_exercises_by_muscle_group TO anon, authenticated, service_role;
