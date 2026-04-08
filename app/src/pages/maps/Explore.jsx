import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TopAppBar from '../../components/common/TopAppBar';
import Card from '../../components/common/Card';

const Explore = ({ hideHeader = false }) => {
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'Todos', icon: null },
        { id: 'run', label: 'Corrida', icon: 'directions_run' },
        { id: 'trail', label: 'Trilha', icon: 'hiking' },
        { id: 'segments', label: 'Segmentos', icon: 'flag' }
    ];

    const popularRoutes = [
        {
            id: 1,
            name: 'Volta da Morada dos Ventos 3',
            distance: '3.2 km',
            elevation: '8m',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
            type: 'run',
            location: 'Morada dos Ventos 3'
        },
        {
            id: 2,
            name: 'Circuito Morada dos Ventos 2',
            distance: '2.8 km',
            elevation: '5m',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1552674605-4694553150b7?w=600',
            type: 'run',
            location: 'Morada dos Ventos 2'
        },
        {
            id: 3,
            name: 'Praça da Matriz - Centro',
            distance: '4.5 km',
            elevation: '15m',
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1596727147705-54a9d6ed27e6?w=600',
            type: 'run',
            location: 'Centro de Crateús'
        },
        {
            id: 4,
            name: 'Trilha Serra das Almas',
            distance: '8.5 km',
            elevation: '280m',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600',
            type: 'trail',
            location: 'Reserva Serra das Almas'
        },
        {
            id: 5,
            name: 'Pista do Estádio Municipal',
            distance: '0.4 km',
            elevation: '0m',
            rating: 4.6,
            image: 'https://images.unsplash.com/photo-1461896836934-bc06bc3ade47?w=600',
            type: 'run',
            location: 'Estádio de Crateús'
        }
    ];

    const segments = [
        {
            id: 1,
            name: 'Sprint Av. Principal MV3',
            distance: '500m',
            record: '1:32',
            attempts: 85,
            type: 'sprint'
        },
        {
            id: 2,
            name: 'Volta Completa MV2',
            distance: '1.2 km',
            record: '4:15',
            attempts: 124,
            type: 'circuit'
        },
        {
            id: 3,
            name: 'Subida para o Alto',
            distance: '800m',
            record: '3:45',
            attempts: 45,
            type: 'climb'
        }
    ];

    const filteredRoutes = activeFilter === 'all'
        ? popularRoutes
        : popularRoutes.filter(r => r.type === activeFilter);

    return (
        <div className={`min-h-screen bg-background-light dark:bg-background-dark ${hideHeader ? '' : 'pb-24'}`}>
            {!hideHeader && <TopAppBar title="Explorar Mapas" showNotifications />}

            <main className={`flex flex-col gap-6 ${hideHeader ? 'pt-2' : 'pt-2'}`}>
                {/* Location Badge */}
                <div className="mx-4 flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span className="font-medium">Crateús, Ceará</span>
                    <span className="text-xs text-primary/70 ml-auto">-5.1754, -40.6649</span>
                </div>

                {/* Map Preview Area */}
                <div className="px-4">
                    <Card padding="none" className="h-48 relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-surface-dark">
                            <img
                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800"
                                alt="Map Heatmap"
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="map-gradient-overlay absolute inset-0" />
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <div>
                                <h3 className="text-white text-lg font-bold">Mapa de Calor - Crateús</h3>
                                <p className="text-gray-300 text-xs">Visualizar 48 segmentos na região</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="bg-primary hover:bg-primary-dark text-background-dark rounded-full p-2 shadow-glow-primary"
                            >
                                <span className="material-symbols-outlined text-xl font-bold">open_in_full</span>
                            </motion.button>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="px-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeFilter === filter.id
                                    ? 'bg-primary text-background-dark'
                                    : 'bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border border-transparent dark:border-white/10'
                                    }`}
                            >
                                {filter.icon && <span className="material-symbols-outlined text-[18px]">{filter.icon}</span>}
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Segments Section */}
                {activeFilter === 'segments' && (
                    <section className="px-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Segmentos Populares
                            </h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {segments.map(segment => (
                                <Card key={segment.id} padding="md" variant="default" hoverable className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-primary text-2xl">flag</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{segment.name}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-0.5">
                                                <span className="material-symbols-outlined text-[16px]">straighten</span>
                                                {segment.distance}
                                            </span>
                                            <span className="flex items-center gap-0.5">
                                                <span className="material-symbols-outlined text-[16px]">timer</span>
                                                {segment.record}
                                            </span>
                                            <span className="text-xs text-primary">{segment.attempts} tentativas</span>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-primary">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Popular Nearby */}
                {activeFilter !== 'segments' && (
                    <section className="px-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Rotas em Crateús
                            </h3>
                            <button className="text-primary text-xs font-bold">Ver tudo</button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {filteredRoutes.map(route => (
                                <Card key={route.id} padding="md" variant="default" hoverable className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-surface-dark overflow-hidden shrink-0">
                                        <img src={route.image} alt={route.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{route.name}</h4>
                                        <p className="text-xs text-gray-400 mb-1">{route.location}</p>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-0.5">
                                                <span className="material-symbols-outlined text-[16px]">straighten</span>
                                                {route.distance}
                                            </span>
                                            <span className="flex items-center gap-0.5">
                                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                                {route.elevation}
                                            </span>
                                            <span className="flex items-center gap-0.5 text-yellow-500">
                                                <span className="material-symbols-outlined text-[16px]">star</span>
                                                {route.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-primary">
                                        <span className="material-symbols-outlined">bookmark</span>
                                    </button>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Explore;
