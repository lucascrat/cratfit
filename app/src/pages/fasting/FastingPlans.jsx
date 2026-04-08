
import React from 'react';
import { motion } from 'framer-motion';

// Icons (In a real app, these would be the generated images)
import icon168 from '../../assets/fasting_16_8_icon.png';
import iconOmad from '../../assets/fasting_omad_icon.png';

const PLANS = [
    {
        id: '12:12',
        title: 'Iniciante (12:12)',
        desc: 'Ideal para começar. Janela de alimentação normal.',
        fasting: 12,
        eating: 12,
        color: 'bg-green-100 text-green-700',
        icon: '🌱'
    },
    {
        id: '14:10',
        title: 'Leve (14:10)',
        desc: 'Um pouco mais desafiador, ótimo para perder peso gradual.',
        fasting: 14,
        eating: 10,
        color: 'bg-teal-100 text-teal-700',
        icon: '🌿'
    },
    {
        id: '16:8',
        title: 'Clássico (16:8)',
        desc: 'O método mais popular. Pule o café da manhã ou jantar.',
        fasting: 16,
        eating: 8,
        color: 'bg-blue-100 text-blue-700',
        popular: true,
        icon: '⚡' // Or use the generated image
    },
    {
        id: '18:6',
        title: 'Intermediário (18:6)',
        desc: 'Para quem já está acostumado. Potencializa a queima de gordura.',
        fasting: 18,
        eating: 6,
        color: 'bg-indigo-100 text-indigo-700',
        icon: '🔥'
    },
    {
        id: '20:4',
        title: 'Guerreiro (20:4)',
        desc: 'Jejum prolongado. Janela curta para refeições densas.',
        fasting: 20,
        eating: 4,
        color: 'bg-orange-100 text-orange-700',
        icon: '🛡️'
    },
    {
        id: '23:1',
        title: 'OMAD (23:1)',
        desc: 'Uma refeição ao dia. Extremo, para usuários avançados.',
        fasting: 23,
        eating: 1,
        color: 'bg-red-100 text-red-700',
        icon: '🍽️' // Or use generated image
    }
];

const FastingPlans = ({ currentPlan, onSelectPlan }) => {
    return (
        <div className="pb-24">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 px-6">Escolha seu Plano</h2>

            <div className="grid grid-cols-1 gap-4 px-6">
                {PLANS.map((plan) => (
                    <motion.button
                        key={plan.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectPlan(plan.id)}
                        className={`relative p-5 rounded-3xl text-left border-2 transition-all ${currentPlan === plan.id
                                ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10'
                                : 'border-transparent bg-white dark:bg-white/5 shadow-sm'
                            }`}
                    >
                        {plan.popular && (
                            <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full">
                                POPULAR
                            </span>
                        )}

                        <div className="flex items-start gap-4">
                            <div className={`size-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${plan.color}`}>
                                {plan.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                    {plan.title}
                                </h3>
                                <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed max-w-[200px]">
                                    {plan.desc}
                                </p>

                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                                        <span className="material-symbols-outlined text-sm">no_meals</span>
                                        {plan.fasting}h Jejum
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                                        <span className="material-symbols-outlined text-sm">restaurant</span>
                                        {plan.eating}h Comendo
                                    </div>
                                </div>
                            </div>
                        </div>

                        {currentPlan === plan.id && (
                            <div className="absolute top-1/2 -translate-y-1/2 right-4">
                                <div className="size-6 bg-primary rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-background-dark text-sm font-bold">check</span>
                                </div>
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default FastingPlans;
