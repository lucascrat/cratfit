-- Adiciona coluna onboarding_completed à tabela users
-- Necessário para persistir o fim do cadastro de perfil e evitar loop de onboarding
SET search_path TO fttcrat;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
