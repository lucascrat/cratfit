-- CORRIGIR PERMISSÕES DE LEITURA PARA TABELAS DE EXERCÍCIOS

-- Opção 1: Desabilitar RLS completamente (mais simples)
ALTER TABLE app_correcrat.exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_correcrat.muscle_groups DISABLE ROW LEVEL SECURITY;

-- OU Opção 2: Criar políticas corretas (se quiser manter RLS)
-- Remover políticas existentes
-- DROP POLICY IF EXISTS "allow_public_read_exercises" ON app_correcrat.exercises;
-- DROP POLICY IF EXISTS "allow_public_read_muscle_groups" ON app_correcrat.muscle_groups;

-- Criar políticas que permitem leitura para todos
-- CREATE POLICY "public_read_exercises" ON app_correcrat.exercises
--     FOR SELECT USING (true);
-- CREATE POLICY "public_read_muscle_groups" ON app_correcrat.muscle_groups
--     FOR SELECT USING (true);

-- Dar permissões de SELECT para anon e authenticated
GRANT USAGE ON SCHEMA app_correcrat TO anon, authenticated;
GRANT SELECT ON app_correcrat.exercises TO anon, authenticated;
GRANT SELECT ON app_correcrat.muscle_groups TO anon, authenticated;

-- Verificar se funcionou
SELECT COUNT(*) as total FROM app_correcrat.exercises;
