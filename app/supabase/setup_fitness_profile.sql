-- Tabela de Perfil Fitness e Metas (SCHEMA PUBLIC)

CREATE TABLE IF NOT EXISTS public.user_fitness_profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    primary_goal TEXT CHECK (primary_goal IN ('run_5k', 'run_10k', 'run_21k', 'run_42k', 'weight_loss', 'hypertrophy', 'strength')) DEFAULT 'run_5k',
    weight_kg DECIMAL,
    height_cm INTEGER,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female')),
    weekly_training_days INTEGER DEFAULT 3,
    accumulated_deficit_kcal INTEGER DEFAULT 0, -- Para a barra de 1kg
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_fitness_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_fitness_profiles' AND policyname = 'Users can manage own profile') THEN
        CREATE POLICY "Users can manage own profile" ON public.user_fitness_profiles FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Permissions
GRANT ALL ON public.user_fitness_profiles TO anon, authenticated, service_role;
