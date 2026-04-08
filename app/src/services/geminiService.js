// Gemini AI Service for Personal Trainer
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// System prompt para o Personal Trainer
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

// Histórico de conversas (mantido em memória)
let conversationHistory = [];

/**
 * Envia mensagem para o Gemini e retorna resposta
 */
export const sendMessageToGemini = async (userMessage, context = {}) => {
    try {
        // Construir o contexto do usuário se disponível
        let userContext = '';
        if (context.profile) {
            userContext = `\n\nContexto do usuário:
- Nome: ${context.profile.name || 'Usuário'}
- Objetivo: ${context.profile.goal || 'Não definido'}
- Nível: ${context.profile.level || 'Iniciante'}
- Peso: ${context.profile.weight || 'Não informado'}kg
- Altura: ${context.profile.height || 'Não informado'}cm`;
        }

        // Adicionar mensagem do usuário ao histórico
        conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Manter apenas as últimas 10 mensagens para não exceder limites
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: PERSONAL_TRAINER_SYSTEM + userContext }]
                    },
                    ...conversationHistory
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Extrair texto da resposta
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Desculpe, não consegui processar sua mensagem. Tente novamente.';

        // Adicionar resposta ao histórico
        conversationHistory.push({
            role: 'model',
            parts: [{ text: aiResponse }]
        });

        return {
            success: true,
            message: aiResponse
        };

    } catch (error) {
        console.error('Erro ao comunicar com Gemini:', error);
        return {
            success: false,
            message: 'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns segundos. 🔧'
        };
    }
};

/**
 * Gera dicas para um exercício específico
 */
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.5,
                    maxOutputTokens: 512,
                }
            })
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;

    } catch (error) {
        console.error('Erro ao buscar dicas:', error);
        return null;
    }
};

/**
 * Gera um treino personalizado
 */
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Tentar fazer parse do JSON
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('Erro ao fazer parse do treino:', e);
        }

        return null;

    } catch (error) {
        console.error('Erro ao gerar treino:', error);
        return null;
    }
};

/**
 * Limpa o histórico de conversas
 */
export const clearConversationHistory = () => {
    conversationHistory = [];
};

/**
 * Obtém sugestões rápidas para o chat
 */
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

/**
 * Analisa uma imagem de comida e retorna informações nutricionais
 * @param {string} imageBase64 - String base64 da imagem (sem o prefixo data:image/...)
 */
export const analyzeFoodImage = async (imageBase64) => {
    const prompt = `Analise esta imagem de um prato de comida detalhadamente.
    Identifique cada alimento visível, estime a porção e calcule os macronutrientes aproximados.

    Retorne APENAS um objeto JSON (sem markdown) no seguinte formato:
    {
        "items": [
            {
                "name": "Nome do alimento (ex: Arroz Branco)",
                "portion": "Quantidade estimada (ex: 150g)",
                "calories": 0,
                "protein": 0,
                "carbs": 0,
                "fats": 0
            }
        ],
        "total": {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fats": 0
        },
        "analysis_comment": "Breve comentário sobre o prato (saudável, muito calórico, etc)"
    }`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: imageBase64
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error:', data);
            return null;
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Limpar markdown se houver ```json ... ```
        const cleanJson = text.replace(/```json|```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error('Erro ao analisar imagem de comida:', error);
        return null;
    }
};

/**
 * Analisa uma descrição de comida em texto e retorna informações nutricionais
 * @param {string} foodDescription - Descrição em texto dos alimentos (ex: "1 banana e 2 ovos")
 */
export const analyzeFoodText = async (foodDescription) => {
    const prompt = `Analise a seguinte descrição de uma refeição: "${foodDescription}".
    Identifique cada alimento, a porção (se não especificada, estime uma média) e calcule os macronutrientes.

    Retorne APENAS um objeto JSON (sem markdown) no seguinte formato:
    {
        "items": [
            {
                "name": "Nome do alimento (ex: Arroz Branco)",
                "portion": "Quantidade (ex: 150g)",
                "calories": 0,
                "protein": 0,
                "carbs": 0,
                "fats": 0
            }
        ],
        "total": {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fats": 0
        },
        "analysis_comment": "Breve comentário sobre a refeição."
    }`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.3, // Menor temperatura para mais precisão
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error:', data);
            return null;
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Limpar markdown se houver ```json ... ```
        const cleanJson = text.replace(/```json|```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error('Erro ao analisar texto de comida:', error);
        return null;
    }
};

export default {
    sendMessageToGemini,
    getExerciseTips,
    generateCustomWorkout,
    clearConversationHistory,
    getQuickSuggestions,
    analyzeFoodImage,
    analyzeFoodText
};
