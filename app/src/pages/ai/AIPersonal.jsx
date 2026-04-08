import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessageToGemini, clearConversationHistory, getQuickSuggestions, generateCustomWorkout } from '../../services/geminiService';
import { useGymStore } from '../../store/gymStore';
import { useTrainingStore } from '../../store/trainingStore';

const AIPersonal = () => {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const { gymProfile } = useGymStore();
    const { profile: runProfile } = useTrainingStore();

    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: `Olá! 👋 Sou o **FITCRAT AI**, seu personal trainer virtual disponível 24 horas!

Posso te ajudar com:
• 🏋️ Treinos de musculação personalizados
• 🏃 Preparação para corridas
• 🔥 Dicas de emagrecimento
• 💪 Técnicas de exercícios
• 🥗 Orientações nutricionais básicas

Como posso te ajudar hoje?`,
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [generatedWorkout, setGeneratedWorkout] = useState(null);

    const suggestions = getQuickSuggestions();

    // Scroll para o final quando novas mensagens chegam
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (text = inputMessage) => {
        if (!text.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setShowSuggestions(false);
        setIsLoading(true);

        // Contexto do usuário para a IA
        const context = {
            profile: {
                ...gymProfile,
                ...runProfile
            }
        };

        const response = await sendMessageToGemini(text, context);

        const assistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: response.message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
    };

    const handleGenerateWorkout = async () => {
        setIsLoading(true);
        setShowWorkoutModal(false);

        const params = {
            goal: gymProfile?.goal || 'hipertrofia',
            level: gymProfile?.level || 'intermediario',
            duration: 45,
            equipment: gymProfile?.equipment || 'academia',
            muscleGroups: ['peito', 'triceps']
        };

        const workout = await generateCustomWorkout(params);

        if (workout) {
            setGeneratedWorkout(workout);
            setShowWorkoutModal(true);
        } else {
            const errorMessage = {
                id: Date.now(),
                role: 'assistant',
                content: 'Desculpe, não consegui gerar o treino. Tente me pedir diretamente no chat! 💪',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
    };

    const handleClearChat = () => {
        clearConversationHistory();
        setMessages([{
            id: Date.now(),
            role: 'assistant',
            content: 'Chat limpo! 🧹 Como posso te ajudar?',
            timestamp: new Date()
        }]);
        setShowSuggestions(true);
    };

    const formatMessage = (content) => {
        // Converter markdown básico para HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/•/g, '•')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="min-h-screen bg-background-dark flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-md border-b border-white/10 px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2"
                        >
                            <span className="material-symbols-outlined text-white">arrow_back</span>
                        </motion.button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white">smart_toy</span>
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background-dark" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold">Personal IA</h1>
                                <p className="text-green-400 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    Online 24h
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleClearChat}
                            className="p-2"
                        >
                            <span className="material-symbols-outlined text-white/50">delete_sweep</span>
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                            {message.role === 'assistant' && (
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-xs">smart_toy</span>
                                    </div>
                                    <span className="text-white/50 text-xs">FITCRAT AI</span>
                                </div>
                            )}
                            <div
                                className={`px-4 py-3 rounded-2xl ${message.role === 'user'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-md'
                                    : 'bg-surface-dark border border-white/10 text-white/90 rounded-tl-md'
                                    }`}
                            >
                                <div
                                    className="text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                                />
                            </div>
                            <p className={`text-white/30 text-xs mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                                {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-surface-dark border border-white/10 px-4 py-3 rounded-2xl rounded-tl-md">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-white/50 text-sm">Pensando...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <AnimatePresence>
                {showSuggestions && messages.length <= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-4 pb-2"
                    >
                        <p className="text-white/50 text-xs mb-2">Sugestões rápidas:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.slice(0, 4).map((suggestion, index) => (
                                <motion.button
                                    key={index}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSendMessage(suggestion)}
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm hover:bg-white/10 transition-colors"
                                >
                                    {suggestion}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Actions */}
            <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGenerateWorkout}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-sm">fitness_center</span>
                        Gerar Treino
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSendMessage("Me dê dicas de alimentação pré-treino")}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-sm">restaurant</span>
                        Nutrição
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSendMessage("Como melhorar minha corrida?")}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-sm">directions_run</span>
                        Corrida
                    </motion.button>
                </div>
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-background-dark border-t border-white/10 px-4 py-3 pb-safe-bottom">
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Pergunte ao seu personal..."
                            rows={1}
                            className="w-full bg-surface-dark border border-white/10 rounded-2xl px-4 py-3 pr-12 text-white resize-none focus:outline-none focus:border-purple-500 max-h-32"
                            style={{ minHeight: '48px' }}
                        />
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || isLoading}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${inputMessage.trim() && !isLoading
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white/10 text-white/30'
                            }`}
                    >
                        <span className="material-symbols-outlined">send</span>
                    </motion.button>
                </div>
            </div>

            {/* Generated Workout Modal */}
            <AnimatePresence>
                {showWorkoutModal && generatedWorkout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-end"
                        onClick={() => setShowWorkoutModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-surface-dark rounded-t-3xl max-h-[85vh] overflow-hidden"
                        >
                            <div className="flex justify-center py-3">
                                <div className="w-12 h-1 bg-white/30 rounded-full" />
                            </div>

                            <div className="px-4 pb-8 overflow-auto max-h-[calc(85vh-50px)]">
                                <h2 className="text-white text-xl font-bold mb-2">{generatedWorkout.name}</h2>
                                <p className="text-purple-400 text-sm mb-4">{generatedWorkout.duration}</p>

                                {/* Warmup */}
                                {generatedWorkout.warmup && (
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-4">
                                        <p className="text-orange-400 text-sm font-medium mb-1">🔥 Aquecimento</p>
                                        <p className="text-white/70 text-sm">{generatedWorkout.warmup}</p>
                                    </div>
                                )}

                                {/* Exercises */}
                                <div className="space-y-3 mb-4">
                                    {generatedWorkout.exercises?.map((ex, i) => (
                                        <div key={i} className="bg-white/5 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                                    <span className="text-purple-400 font-bold text-sm">{i + 1}</span>
                                                </div>
                                                <h3 className="text-white font-medium">{ex.name}</h3>
                                            </div>
                                            <div className="flex gap-4 text-sm">
                                                <span className="text-white/50">{ex.sets} séries</span>
                                                <span className="text-white/50">{ex.reps} reps</span>
                                                <span className="text-white/50">{ex.rest} descanso</span>
                                            </div>
                                            {ex.tips && (
                                                <p className="text-purple-400/70 text-xs mt-2">💡 {ex.tips}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Cooldown */}
                                {generatedWorkout.cooldown && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-6">
                                        <p className="text-blue-400 text-sm font-medium mb-1">❄️ Alongamento</p>
                                        <p className="text-white/70 text-sm">{generatedWorkout.cooldown}</p>
                                    </div>
                                )}

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowWorkoutModal(false)}
                                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
                                >
                                    Fechar
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIPersonal;
