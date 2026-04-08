import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getNutritionGuides, getRecipes } from '../../services/nutritionApi';

const NutritionGuide = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Tudo');

    const { data: guides } = useQuery({
        queryKey: ['nutrition_guides'],
        queryFn: async () => {
            const { data } = await getNutritionGuides();
            return data || [];
        }
    });

    const { data: recipes } = useQuery({
        queryKey: ['recipes'],
        queryFn: async () => {
            const { data } = await getRecipes();
            return data || [];
        }
    });

    // Mock data for UI if DB is empty
    const quickReads = guides && guides.length > 0 ? guides : [
        {
            id: 1,
            title: "Água e Performance Física",
            category: "Hidratação",
            duration: "2 min",
            image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400",
            color: "text-primary"
        },
        {
            id: 2,
            title: "Carboidratos à noite engordam?",
            category: "Mitos",
            duration: "3 min",
            image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400",
            color: "text-orange-500"
        },
        {
            id: 3,
            title: "Sono e Metabolismo",
            category: "Bem-estar",
            duration: "4 min",
            image: "https://images.unsplash.com/photo-1517056330178-d24f72348964?w=400",
            color: "text-purple-500"
        }
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold">Guia Nutricional</h2>
                <div className="size-10"></div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">

                {/* Search */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-3 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar artigos, receitas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-[#1c2e22] h-12 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary/50 outline-none shadow-sm dark:border-none"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {['Tudo', 'Receitas', 'Artigos', 'Dicas'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${category === cat
                                    ? 'bg-primary text-black border-primary font-bold'
                                    : 'bg-white dark:bg-[#1c2e22] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            {cat === 'Tudo' && <span className="material-symbols-outlined text-lg mr-2 align-middle">grid_view</span>}
                            {cat === 'Receitas' && <span className="material-symbols-outlined text-lg mr-2 align-middle">restaurant</span>}
                            {cat === 'Artigos' && <span className="material-symbols-outlined text-lg mr-2 align-middle">article</span>}
                            {cat === 'Dicas' && <span className="material-symbols-outlined text-lg mr-2 align-middle">lightbulb</span>}
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Tip of the Day */}
                <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-md group">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block px-2 py-1 mb-2 text-xs font-bold text-black bg-primary rounded-md uppercase tracking-wider">Dica do Dia</span>
                        <h3 className="text-white text-xl font-bold mb-2">Foco em Proteínas</h3>
                        <p className="text-white/80 text-sm mb-3">Distribua a ingestão de proteínas igualmente entre as refeições para otimizar o ganho de massa.</p>
                        <button className="flex items-center text-primary font-bold text-sm hover:underline">
                            Ler mais <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Quick Reads */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">Leitura Rápida</h3>
                        <button className="text-primary text-sm font-bold">Ver tudo</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {quickReads.map((item, idx) => (
                            <div key={idx} className="flex flex-col w-36 shrink-0 gap-2">
                                <div className="w-36 h-36 rounded-xl relative overflow-hidden group bg-gray-200">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                        style={{ backgroundImage: `url("${item.image || item.cover_image}")` }}
                                    ></div>
                                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                                        {item.duration || '3 min'}
                                    </div>
                                </div>
                                <div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${item.color || 'text-primary'}`}>
                                        {item.category}
                                    </span>
                                    <p className="font-bold text-sm leading-tight mt-0.5 line-clamp-2">{item.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Healthy Recipes */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">Receitas Saudáveis</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-[#1c2e22] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4 h-32">
                            <div className="w-32 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400")' }}></div>
                            <div className="flex flex-col justify-center flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Vegano</span>
                                </div>
                                <h4 className="font-bold text-base leading-tight mb-auto">Salada de Quinoa Fresca</h4>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                    <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 15 min</div>
                                    <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">local_fire_department</span> 320 kcal</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1c2e22] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4 h-32">
                            <div className="w-32 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1540914124281-342587941389?w=400")' }}></div>
                            <div className="flex flex-col justify-center flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Detox</span>
                                </div>
                                <h4 className="font-bold text-base leading-tight mb-auto">Smoothie Verde Energético</h4>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                    <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 5 min</div>
                                    <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">local_fire_department</span> 150 kcal</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NutritionGuide;
