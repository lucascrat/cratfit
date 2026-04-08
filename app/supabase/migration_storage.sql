-- MIGRAÇÃO SEGURA: STORAGE & AUTH
-- Execute este script no SQL Editor do Supabase para habilitar uploads e profile picture

-- 1. Garantir que o bucket 'images' existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Atualizar Políticas de Segurança do Storage (Bucket 'images')
-- Removemos as antigas para evitar duplicidade e recriamos as corretas
DROP POLICY IF EXISTS "Public Access to Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Leitura Pública
CREATE POLICY "Public Access to Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Upload para usuários logados
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- Update/Delete apenas para o dono (owner)
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'images' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'images' AND auth.uid() = owner );

-- 3. Atualizar Função de Criação de Usuário (Para capturar Nome e Foto do Registro)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    -- Tenta pegar 'full_name' dos metadados, senão usa parte do email
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    -- Tenta pegar 'avatar_url' dos metadados (Google/Upload), senão vazio
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (O Trigger "on_auth_user_created" já usa essa função, então o REPLACE acima a atualiza automaticamente)
