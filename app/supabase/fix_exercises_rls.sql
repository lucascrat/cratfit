-- Habilitar leitura pública para tabelas de exercícios

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'app_correcrat';

-- Criar políticas de leitura pública para exercises
DROP POLICY IF EXISTS "allow_public_read_exercises" ON app_correcrat.exercises;
CREATE POLICY "allow_public_read_exercises" ON app_correcrat.exercises
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Criar políticas de leitura pública para muscle_groups
DROP POLICY IF EXISTS "allow_public_read_muscle_groups" ON app_correcrat.muscle_groups;
CREATE POLICY "allow_public_read_muscle_groups" ON app_correcrat.muscle_groups
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Habilitar RLS nas tabelas (se não estiver)
ALTER TABLE app_correcrat.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.muscle_groups ENABLE ROW LEVEL SECURITY;

-- Verificar contagem de exercícios
SELECT COUNT(*) as total_exercises FROM app_correcrat.exercises WHERE is_active = true;
SELECT COUNT(*) as total_muscle_groups FROM app_correcrat.muscle_groups;
