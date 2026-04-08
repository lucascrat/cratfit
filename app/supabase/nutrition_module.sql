-- Módulo de Nutrição: Tabelas e Estrutura (SCHEMA PUBLIC)

-- 1. Metas Nutricionais do Usuário
CREATE TABLE IF NOT EXISTS public.user_nutrition_goals (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    daily_calories_target INTEGER DEFAULT 2000,
    daily_protein_g INTEGER DEFAULT 150,
    daily_carbs_g INTEGER DEFAULT 200,
    daily_fats_g INTEGER DEFAULT 60,
    water_target_ml INTEGER DEFAULT 2500,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Refeições (Diário Alimentar)
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'Café da Manhã', 'Almoço', 'Jantar', 'Lanche'
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Itens da Refeição (Alimentos)
CREATE TABLE IF NOT EXISTS public.meal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER DEFAULT 0,
    protein_g DECIMAL DEFAULT 0,
    carbs_g DECIMAL DEFAULT 0,
    fats_g DECIMAL DEFAULT 0,
    portion_desc TEXT, -- '1 unidade', '100g'
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Registro de Água
CREATE TABLE IF NOT EXISTS public.water_intake (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    amount_ml INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Receitas (Para o Guia)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    prep_time_minutes INTEGER,
    calories_per_serving INTEGER,
    ingredients JSONB, -- Lista de ingredientes
    instructions JSONB, -- Passos de preparo
    tags TEXT[],
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Guia Nutricional (Artigos)
CREATE TABLE IF NOT EXISTS public.nutrition_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown ou HTML
    category TEXT,
    cover_image TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_guides ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    -- Nutrition Goals
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_nutrition_goals' AND policyname = 'Users manage own nutrition goals') THEN
        CREATE POLICY "Users manage own nutrition goals" ON public.user_nutrition_goals FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Meals
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meals' AND policyname = 'Users manage own meals') THEN
        CREATE POLICY "Users manage own meals" ON public.meals FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Meal Items
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meal_items' AND policyname = 'Users manage own meal items') THEN
        CREATE POLICY "Users manage own meal items" ON public.meal_items FOR ALL USING (
            meal_id IN (SELECT id FROM public.meals WHERE user_id = auth.uid())
        );
    END IF;

    -- Water
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'water_intake' AND policyname = 'Users manage own water') THEN
        CREATE POLICY "Users manage own water" ON public.water_intake FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Recipes & Guides (Public Read)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Public read recipes') THEN
        CREATE POLICY "Public read recipes" ON public.recipes FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nutrition_guides' AND policyname = 'Public read guides') THEN
        CREATE POLICY "Public read guides" ON public.nutrition_guides FOR SELECT USING (true);
    END IF;
END $$;

-- Permissions
GRANT ALL ON public.user_nutrition_goals TO anon, authenticated, service_role;
GRANT ALL ON public.meals TO anon, authenticated, service_role;
GRANT ALL ON public.meal_items TO anon, authenticated, service_role;
GRANT ALL ON public.water_intake TO anon, authenticated, service_role;
GRANT ALL ON public.recipes TO anon, authenticated, service_role;
GRANT ALL ON public.nutrition_guides TO anon, authenticated, service_role;

-- Dados Iniciais (Exemplo de Guia)
INSERT INTO public.nutrition_guides (title, content, category, cover_image) VALUES
('Fundamentos da Nutrição Esportiva', 'A nutrição é a base do desempenho atlético...', 'Básico', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'),
('Hidratação e Performance', 'Como a água afeta seu treino e recuperação...', 'Performance', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800');
