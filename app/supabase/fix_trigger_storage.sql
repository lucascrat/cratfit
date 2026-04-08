-- AJUSTE FINO: Trigger e Storage para o schema 'app_correcrat'
-- Execute este script para conectar o Auth e Storage às tabelas existentes.

-- 1. Atualizar Função do Trigger (Apontar para app_correcrat.users)
CREATE OR REPLACE FUNCTION app_correcrat.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO app_correcrat.users (id, email, name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    -- Pega Nome do metadata (Google ou Form) ou parte do email
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    -- Pega Avatar do metadata ou vazio
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recriar o Trigger no Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE app_correcrat.handle_new_user();

-- 3. Configurar Permissões de Storage (Bucket 'images')
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true) 
ON CONFLICT (id) DO NOTHING;

-- Policies (Permitir Upload e Leitura)
DROP POLICY IF EXISTS "Public Access Images" ON storage.objects;
CREATE POLICY "Public Access Images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'images' );

DROP POLICY IF EXISTS "Auth Upload Images" ON storage.objects;
CREATE POLICY "Auth Upload Images" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- 4. Garantir permissões de uso no schema para a API
GRANT USAGE ON SCHEMA app_correcrat TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA app_correcrat TO anon, authenticated, service_role;
