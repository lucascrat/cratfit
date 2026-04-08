-- Script para criar bucket de GIFs de exercícios no Supabase Storage
-- Execute este script no SQL Editor do Supabase

-- 1. Criar bucket público para GIFs de exercícios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exercise-gifs',
    'exercise-gifs',
    true,
    52428800,  -- 50MB limit
    ARRAY['image/gif', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir leitura pública dos GIFs
CREATE POLICY IF NOT EXISTS "Permitir leitura pública de exercise-gifs"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-gifs');

-- 3. Permitir upload para usuários autenticados
CREATE POLICY IF NOT EXISTS "Permitir upload de exercise-gifs para autenticados"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exercise-gifs' AND auth.role() = 'authenticated');

-- 4. Permitir atualização para usuários autenticados
CREATE POLICY IF NOT EXISTS "Permitir atualização de exercise-gifs para autenticados"
ON storage.objects FOR UPDATE
USING (bucket_id = 'exercise-gifs' AND auth.role() = 'authenticated');

-- 5. Permitir exclusão para usuários autenticados  
CREATE POLICY IF NOT EXISTS "Permitir exclusão de exercise-gifs para autenticados"
ON storage.objects FOR DELETE
USING (bucket_id = 'exercise-gifs' AND auth.role() = 'authenticated');
