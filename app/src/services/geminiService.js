// Gemini AI Service for FitCrat
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ────────────────────────────────────────────────────────────
// Personal Trainer Chat
// ────────────────────────────────────────────────────────────

const PERSONAL_TRAINER_SYSTEM = `Você é o FITCRAT AI, um personal trainer virtual especializado e disponível 24 horas.

Suas características:
- Especialista em musculação, corrida, emagrecimento e condicionamento físico
- Conhecimento profundo de anatomia, biomecânica e fisiologia do exercício
- Capacidade de criar treinos personalizados
- Orientação sobre nutrição esportiva básica
- Motivador e encorajador, mas realista
- Respostas em português brasileiro

Diretrizes:
- Sempre pergunte sobre lesões ou limitações antes de recomendar exercícios
- Enfatize a importância do aquecimento e alongamento
- Recomende consultar profissionais de saúde para casos específicos
- Seja direto e objetivo nas respostas
- Use emojis moderadamente para tornar a conversa mais amigável
- Formate as respostas de forma clara (use bullet points quando apropriado)

Áreas de especialidade:
1. Treinos de musculação (hipertrofia, força, resistência)
2. Corrida e preparação para provas
3. Emagrecimento e definição muscular
4. Flexibilidade e mobilidade
5. Recuperação e prevenção de lesões
6. Nutrição esportiva básica
7. Motivação e mentalidade`;

let conversationHistory = [];

export const sendMessageToGemini = async (userMessage, context = {}) => {
    try {
        let userContext = '';
        if (context.profile) {
            userContext = `\n\nContexto do usuário:
- Nome: ${context.profile.name || 'Usuário'}
- Objetivo: ${context.profile.goal || 'Não definido'}
- Nível: ${context.profile.level || 'Iniciante'}
- Peso: ${context.profile.weight || 'Não informado'}kg
- Altura: ${context.profile.height || 'Não informado'}cm`;
        }

        conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: PERSONAL_TRAINER_SYSTEM + userContext }] },
                    ...conversationHistory
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
                ]
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Desculpe, não consegui processar sua mensagem. Tente novamente.';

        conversationHistory.push({
            role: 'model',
            parts: [{ text: aiResponse }]
        });

        return { success: true, message: aiResponse };

    } catch (error) {
        console.error('Erro ao comunicar com Gemini:', error);
        return {
            success: false,
            message: 'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns segundos. 🔧'
        };
    }
};

// ────────────────────────────────────────────────────────────
// Exercise Tips
// ────────────────────────────────────────────────────────────

export const getExerciseTips = async (exerciseName, muscleGroup) => {
    const prompt = `Dê dicas rápidas e objetivas sobre o exercício "${exerciseName}" para o grupo muscular ${muscleGroup}.

    Inclua:
    1. Execução correta (2-3 frases)
    2. Erros comuns a evitar (2 pontos)
    3. Dica de respiração

    Seja conciso e direto.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.5, maxOutputTokens: 512 }
            })
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;

    } catch (error) {
        console.error('Erro ao buscar dicas:', error);
        return null;
    }
};

// ────────────────────────────────────────────────────────────
// Custom Workout Generator
// ────────────────────────────────────────────────────────────

export const generateCustomWorkout = async (params) => {
    const { goal, level, duration, equipment, muscleGroups } = params;

    const prompt = `Crie um treino de ${duration || 45} minutos com as seguintes especificações:

    - Objetivo: ${goal || 'hipertrofia'}
    - Nível: ${level || 'intermediário'}
    - Equipamentos disponíveis: ${equipment || 'academia completa'}
    - Grupos musculares: ${muscleGroups?.join(', ') || 'todos'}

    Formato da resposta (JSON):
    {
        "name": "Nome do treino",
        "duration": "45 min",
        "exercises": [
            {
                "name": "Nome do exercício",
                "sets": 4,
                "reps": "10-12",
                "rest": "60s",
                "tips": "Dica rápida"
            }
        ],
        "warmup": "Descrição do aquecimento",
        "cooldown": "Descrição do alongamento"
    }

    Retorne APENAS o JSON, sem texto adicional.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error('Erro ao fazer parse do treino:', e);
        }

        return null;

    } catch (error) {
        console.error('Erro ao gerar treino:', error);
        return null;
    }
};

// ────────────────────────────────────────────────────────────
// Conversation management
// ────────────────────────────────────────────────────────────

export const clearConversationHistory = () => {
    conversationHistory = [];
};

export const getQuickSuggestions = () => [
    "Me monte um treino de peito",
    "Como melhorar meu pace na corrida?",
    "Dicas para perder gordura abdominal",
    "Qual melhor treino para iniciantes?",
    "Como ganhar massa muscular?",
    "Exercícios para fazer em casa",
    "Quantas vezes treinar por semana?",
    "Dicas de alimentação pré-treino"
];

// ────────────────────────────────────────────────────────────
// NUTRITION — Expert Food Analysis
// ────────────────────────────────────────────────────────────

const NUTRITION_SYSTEM = `Você é um nutricionista clínico esportivo com 20 anos de experiência, especialista em composição de alimentos brasileiros e internacionais.

REGRAS OBRIGATÓRIAS:
1. Use a Tabela TACO (Tabela Brasileira de Composição de Alimentos) e USDA como referências.
2. Sempre estime porções realistas baseadas em medidas caseiras brasileiras.
3. Considere o modo de preparo (frito adiciona gordura, grelhado não, etc).
4. Para alimentos sem quantidade especificada, use porções médias padrão:
   - Banana média: 100g (parte comestível ~75g)
   - Arroz cozido: 1 colher de servir = 120g
   - Feijão cozido: 1 concha média = 86g
   - Frango peito grelhado: 1 filé médio = 120g
   - Ovo inteiro cozido: 1 unidade = 50g
   - Pão francês: 1 unidade = 50g
   - Leite integral: 1 copo = 200ml
5. Arredonde calorias para inteiros e macros para 1 casa decimal.
6. A soma de (protein*4 + carbs*4 + fats*9) deve ser coerente com as calorias totais.
7. Inclua fibras e açúcares quando relevante.

RESPONDA EXCLUSIVAMENTE com JSON válido, sem markdown, sem comentários, sem texto antes ou depois.`;

const FOOD_JSON_SCHEMA = `{
  "items": [
    {
      "name": "Nome do alimento em português",
      "portion": "quantidade com unidade (ex: 100g, 1 unidade, 200ml)",
      "calories": 0,
      "protein": 0.0,
      "carbs": 0.0,
      "fats": 0.0,
      "fiber": 0.0
    }
  ],
  "total": {
    "calories": 0,
    "protein": 0.0,
    "carbs": 0.0,
    "fats": 0.0,
    "fiber": 0.0
  },
  "analysis_comment": "Análise nutricional breve: pontos positivos, negativos e sugestões de melhoria"
}`;

/**
 * Parse JSON from Gemini response, handling markdown wrappers and edge cases
 */
function parseGeminiJson(text) {
    if (!text) return null;

    // Remove markdown code fences
    let clean = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

    // Try direct parse first
    try {
        return JSON.parse(clean);
    } catch (_) { /* continue */ }

    // Try to extract JSON object
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
        try {
            return JSON.parse(match[0]);
        } catch (_) { /* continue */ }
    }

    // Try fixing common issues: trailing commas, single quotes
    try {
        const fixed = clean
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/'/g, '"');
        const m2 = fixed.match(/\{[\s\S]*\}/);
        if (m2) return JSON.parse(m2[0]);
    } catch (_) { /* give up */ }

    return null;
}

/**
 * Call Gemini with retry logic
 */
async function callGemini(contents, config = {}) {
    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: config.temperature ?? 0.2,
                        maxOutputTokens: config.maxOutputTokens ?? 2048,
                        topP: 0.8,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                    ]
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const msg = errData.error?.message || `HTTP ${response.status}`;
                console.error(`Gemini API Error (attempt ${attempt + 1}):`, msg);

                // Don't retry on auth errors
                if (response.status === 403 || response.status === 401) {
                    lastError = new Error(msg);
                    break;
                }

                lastError = new Error(msg);
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                    continue;
                }
                break;
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                console.error('Gemini returned empty response:', JSON.stringify(data).slice(0, 500));
                lastError = new Error('Empty response from Gemini');
                continue;
            }

            return text;

        } catch (err) {
            console.error(`Gemini call failed (attempt ${attempt + 1}):`, err);
            lastError = err;
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            }
        }
    }

    throw lastError || new Error('Gemini call failed');
}

/**
 * Analisa uma imagem de comida e retorna informações nutricionais
 * @param {string} imageBase64 - String base64 da imagem (sem prefixo data:image/...)
 * @returns {object|null} Objeto com items, total e analysis_comment
 */
export const analyzeFoodImage = async (imageBase64) => {
    const prompt = `${NUTRITION_SYSTEM}

Analise esta foto de refeição. Identifique TODOS os alimentos visíveis, estime a porção com base no tamanho aparente no prato, e calcule os macronutrientes usando a tabela TACO/USDA.

Se um alimento não for claramente identificável, faça sua melhor estimativa e indique no comentário.

Responda SOMENTE com JSON neste formato:
${FOOD_JSON_SCHEMA}`;

    try {
        const text = await callGemini([
            {
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: 'image/jpeg',
                            data: imageBase64
                        }
                    }
                ]
            }
        ], { temperature: 0.2, maxOutputTokens: 2048 });

        const result = parseGeminiJson(text);

        if (!result || !result.items || !Array.isArray(result.items) || result.items.length === 0) {
            console.error('Invalid nutrition response structure:', text?.slice(0, 300));
            return null;
        }

        // Ensure all numeric fields are numbers
        return sanitizeNutritionResult(result);

    } catch (error) {
        console.error('Erro ao analisar imagem de comida:', error);
        return null;
    }
};

/**
 * Analisa descrição de alimentos em texto e retorna informações nutricionais
 * @param {string} foodDescription - Descrição dos alimentos
 * @returns {object|null} Objeto com items, total e analysis_comment
 */
export const analyzeFoodText = async (foodDescription) => {
    const prompt = `${NUTRITION_SYSTEM}

Analise esta refeição descrita pelo usuário:
"${foodDescription}"

Instruções:
- Se o usuário mencionar apenas o alimento sem quantidade, use a porção média padrão brasileira.
- Se for uma receita ou prato composto (ex: "feijoada"), decomponha nos ingredientes principais.
- Identifique cada alimento separadamente.
- Calcule os macronutrientes usando a tabela TACO/USDA.

Responda SOMENTE com JSON neste formato:
${FOOD_JSON_SCHEMA}`;

    try {
        const text = await callGemini([
            { parts: [{ text: prompt }] }
        ], { temperature: 0.1, maxOutputTokens: 2048 });

        const result = parseGeminiJson(text);

        if (!result || !result.items || !Array.isArray(result.items) || result.items.length === 0) {
            console.error('Invalid nutrition response structure:', text?.slice(0, 300));
            return null;
        }

        return sanitizeNutritionResult(result);

    } catch (error) {
        console.error('Erro ao analisar texto de comida:', error);
        return null;
    }
};

/**
 * Ensure all numeric fields are actual numbers and recalculate totals
 */
function sanitizeNutritionResult(result) {
    const num = (v) => {
        const n = parseFloat(v);
        return isNaN(n) ? 0 : Math.round(n * 10) / 10;
    };

    const items = result.items.map(item => ({
        name: item.name || 'Alimento',
        portion: item.portion || '1 porção',
        calories: Math.round(num(item.calories)),
        protein: num(item.protein),
        carbs: num(item.carbs),
        fats: num(item.fats),
        fiber: num(item.fiber),
    }));

    // Recalculate totals from items to ensure consistency
    const total = items.reduce((acc, item) => ({
        calories: acc.calories + item.calories,
        protein: Math.round((acc.protein + item.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + item.carbs) * 10) / 10,
        fats: Math.round((acc.fats + item.fats) * 10) / 10,
        fiber: Math.round((acc.fiber + item.fiber) * 10) / 10,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

    return {
        items,
        total,
        analysis_comment: result.analysis_comment || 'Análise concluída.',
    };
}

export default {
    sendMessageToGemini,
    getExerciseTips,
    generateCustomWorkout,
    clearConversationHistory,
    getQuickSuggestions,
    analyzeFoodImage,
    analyzeFoodText
};
