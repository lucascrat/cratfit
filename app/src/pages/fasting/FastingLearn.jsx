
import React from 'react';
import { motion } from 'framer-motion';

// Mock AI Content (In real app, this could come from Supabase or generated dynamically)
const ARTICLES = [
    {
        id: 1,
        title: 'O que é Jejum Intermitente?',
        desc: 'Um guia completo sobre como funciona e por que é tão eficaz para a saúde.',
        image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=600&auto=format&fit=crop', // Placeholder
        tag: 'Iniciante'
    },
    {
        id: 2,
        title: 'Benefícios da Autofagia',
        desc: 'Descubra como seu corpo se renova e elimina células velhas durante o jejum.',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef007a8286a?q=80&w=600&auto=format&fit=crop', // Placeholder
        tag: 'Ciência'
    },
    {
        id: 3,
        title: 'O que beber durante o jejum?',
        desc: 'Água, café, chás... O que quebra e o que não quebra o jejum.',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop', // Placeholder
        tag: 'Dicas'
    },
    {
        id: 4,
        title: 'Como quebrar o jejum corretamente',
        desc: 'Evite picos de insulina com estas sugestões de primeira refeição.',
        image: 'https://images.unsplash.com/photo-1490474504059-bfd84e6a0033?q=80&w=600&auto=format&fit=crop', // Placeholder
        tag: 'Nutrição'
    }
];

const FastingLearn = () => {
    return (
        <div className="pb-24">
            <header className="px-6 mb-6">
                <h2 className="text-2xl font-black text-gray-800 dark:text-white">Aprender</h2>
                <p className="text-gray-500 text-sm">Artigos e dicas para potencializar resultados</p>
            </header>

            <div className="flex flex-col gap-6 px-6">
                {/* Featured Article */}
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="relative h-64 rounded-3xl overflow-hidden shadow-lg group cursor-pointer"
                >
                    <img
                        src={ARTICLES[0].image}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt="Featured"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                        <span className="bg-primary text-background-dark text-[10px] font-bold px-2 py-1 rounded-md mb-2 inline-block">
                            GUIA BÁSICO
                        </span>
                        <h3 className="text-2xl font-black text-white mb-1 leading-tight">{ARTICLES[0].title}</h3>
                        <p className="text-gray-300 text-sm line-clamp-2">{ARTICLES[0].desc}</p>
                    </div>
                </motion.div>

                {/* Article List */}
                <div className="grid grid-cols-2 gap-4">
                    {ARTICLES.slice(1).map((art) => (
                        <motion.div
                            key={art.id}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer"
                        >
                            <div className="h-24 overflow-hidden relative">
                                <img src={art.image} className="w-full h-full object-cover" alt={art.title} />
                                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded">
                                    {art.tag}
                                </span>
                            </div>
                            <div className="p-3">
                                <h4 className="font-bold text-sm text-gray-800 dark:text-white leading-tight mb-1">
                                    {art.title}
                                </h4>
                                <p className="text-[10px] text-gray-400 line-clamp-2">
                                    {art.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Daily Tip Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div className="flex items-start gap-4 relative z-10">
                        <div className="size-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined">lightbulb</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-1">Dica do Dia</h4>
                            <p className="text-indigo-100 text-sm leading-relaxed">
                                Beber água com limão pela manhã ajuda a alcalinizar o corpo sem quebrar o jejum (se for pouco limão!).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FastingLearn;
