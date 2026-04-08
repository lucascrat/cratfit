import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = {
    morning: [
        { name: 'Omelete com Espinafre', calories: 250, protein: 18, carbs: 2, fats: 15, emoji: '🍳' },
        { name: 'Aveia com Frutas', calories: 300, protein: 8, carbs: 45, fats: 6, emoji: '🥣' },
        { name: 'Iogurte com Granola', calories: 200, protein: 12, carbs: 25, fats: 4, emoji: '🥛' },
    ],
    afternoon: [
        { name: 'Frango Grelhado com Salada', calories: 350, protein: 40, carbs: 5, fats: 10, emoji: '🥗' },
        { name: 'Arroz Integral e Carne', calories: 450, protein: 35, carbs: 50, fats: 12, emoji: '🍛' },
        { name: 'Sanduíche Natural', calories: 300, protein: 15, carbs: 35, fats: 8, emoji: '🥪' },
    ],
    evening: [
        { name: 'Peixe Assado com Legumes', calories: 300, protein: 30, carbs: 10, fats: 8, emoji: '🐟' },
        { name: 'Sopa de Legumes', calories: 150, protein: 5, carbs: 25, fats: 2, emoji: '🍲' },
        { name: 'Wrap de Frango', calories: 280, protein: 25, carbs: 20, fats: 10, emoji: '🌯' },
    ],
    snack: [
        { name: 'Mix de Castanhas', calories: 180, protein: 5, carbs: 8, fats: 15, emoji: '🥜' },
        { name: 'Fruta (Maçã/Banana)', calories: 80, protein: 0, carbs: 20, fats: 0, emoji: '🍎' },
        { name: 'Barra de Proteína', calories: 200, protein: 20, carbs: 15, fats: 6, emoji: '🍫' },
    ]
};

const FoodSuggestionModal = ({ isOpen, onClose, onSelect }) => {
    const hour = new Date().getHours();
    let timeOfDay = 'snack';
    let greeting = 'Lanche';

    if (hour >= 5 && hour < 11) {
        timeOfDay = 'morning';
        greeting = 'Café da Manhã';
    } else if (hour >= 11 && hour < 15) {
        timeOfDay = 'afternoon';
        greeting = 'Almoço';
    } else if (hour >= 18 && hour < 22) {
        timeOfDay = 'evening';
        greeting = 'Jantar';
    }

    const suggestions = SUGGESTIONS[timeOfDay];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-[#1c2e22] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border-t border-white/10"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Sugestões para agora</p>
                            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                                {greeting} <span className="text-2xl">💡</span>
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {suggestions.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => onSelect(item)}
                                className="w-full bg-gray-50 dark:bg-black/20 hover:bg-green-50 dark:hover:bg-green-900/20 border border-transparent hover:border-green-500/30 rounded-2xl p-4 flex items-center gap-4 transition-all group text-left"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-2xl shadow-sm">
                                    {item.emoji}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-green-500 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                        <span className="font-bold text-orange-400">{item.calories} kcal</span>
                                        <span>•</span>
                                        <span>P: {item.protein}g</span>
                                        <span>C: {item.carbs}g</span>
                                        <span>G: {item.fats}g</span>
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-gray-300 group-hover:text-green-500">add_circle</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-100 dark:bg-white/5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                            Ver mais opções
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FoodSuggestionModal;
