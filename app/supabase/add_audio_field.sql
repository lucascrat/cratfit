-- Adicionar campo audio_path na tabela de exercícios
ALTER TABLE app_correcrat.exercises 
ADD COLUMN IF NOT EXISTS audio_path TEXT;

-- Comentário explicativo
COMMENT ON COLUMN app_correcrat.exercises.audio_path IS 'Caminho do arquivo de áudio do exercício no Storage';

-- Verificar estrutura da tabela
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'app_correcrat' AND table_name = 'exercises';
