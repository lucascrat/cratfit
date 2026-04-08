import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopAppBar from '../../components/common/TopAppBar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { useCommunityStore } from '../../store/communityStore';
import {
    getCommunities,
    joinCommunity as joinCommunityApi,
    leaveCommunity as leaveCommunityApi,
    getMyCommunities
} from '../../services/communityApi';
import {
    getEvents,
    joinEvent as joinEventApi,
    leaveEvent as leaveEventApi
} from '../../services/eventApi';

const Communities = ({ hideHeader = false }) => {
    const { user } = useAuthStore();
    const {
        userCommunities,
        userEvents,
        joinCommunity: joinCommunityLocal,
        leaveCommunity: leaveCommunityLocal,
        joinEvent: joinEventLocal,
        leaveEvent: leaveEventLocal,
        getJoinedCommunitiesCount
    } = useCommunityStore();

    const [activeTab, setActiveTab] = useState('discover');
    const [communities, setCommunities] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joiningCommunity, setJoiningCommunity] = useState(null);
    const [joiningEvent, setJoiningEvent] = useState(null);

    // Default data when database is empty
    const defaultCommunities = [
        {
            id: 'local-1',
            name: 'Corredores de Crateús',
            members_count: 256,
            cover_image: 'https://images.unsplash.com/photo-1552674605-4694553150b7?w=400',
            description: 'Comunidade oficial de corredores de Crateús-CE.'
        },
        {
            id: 'local-2',
            name: 'Morada dos Ventos Runners',
            members_count: 148,
            cover_image: 'https://images.unsplash.com/photo-1533561052604-db53ae34259b?w=400',
            description: 'Treinos semanais na Morada dos Ventos.'
        },
        {
            id: 'local-3',
            name: 'Sertão Running Club',
            members_count: 320,
            cover_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
            description: 'Corridas e trilhas no interior do Ceará.'
        }
    ];

    const defaultEvents = [
        {
            id: 'local-event-1',
            title: 'Treino Coletivo Morada dos Ventos 3',
            event_date: getNextDayDate(6, '06:00'),
            location: 'Praça da Morada dos Ventos 3, Crateús',
            participants_count: 28,
            cover_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
        },
        {
            id: 'local-event-2',
            title: 'Night Run Morada dos Ventos 2',
            event_date: getNextDayDate(3, '19:00'),
            location: 'Entrada da Morada dos Ventos 2, Crateús',
            participants_count: 45,
            cover_image: 'https://images.unsplash.com/photo-1547483954-506b3810a2b4?w=400'
        },
        {
            id: 'local-event-3',
            title: 'Corrida de Domingo - Centro',
            event_date: getNextDayDate(0, '05:30'),
            location: 'Praça da Matriz, Centro de Crateús',
            participants_count: 62,
            cover_image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'
        },
        {
            id: 'local-event-4',
            title: 'Treino Intervalado - Pista',
            event_date: getNextDayDate(2, '18:00'),
            location: 'Estádio Municipal de Crateús',
            participants_count: 18,
            cover_image: 'https://images.unsplash.com/photo-1461896836934-bc06bc3ade47?w=400'
        }
    ];

    function getNextDayDate(dayOfWeek, time) {
        const now = new Date();
        const result = new Date(now);
        result.setDate(now.getDate() + ((dayOfWeek + 7 - now.getDay()) % 7 || 7));
        const [hours, minutes] = time.split(':');
        result.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return result.toISOString();
    }

    // Load data
    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load communities
            const { data: communitiesData } = await getCommunities();
            if (communitiesData && communitiesData.length > 0) {
                setCommunities(communitiesData);
            } else {
                setCommunities(defaultCommunities);
            }

            // Load events
            const { data: eventsData } = await getEvents();
            if (eventsData && eventsData.length > 0) {
                const eventsWithCount = eventsData.map(e => ({
                    ...e,
                    participants_count: e.event_participants?.[0]?.count || 0
                }));
                setEvents(eventsWithCount);
            } else {
                setEvents(defaultEvents);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setCommunities(defaultCommunities);
            setEvents(defaultEvents);
        }
        setLoading(false);
    };

    const handleJoinCommunity = async (communityId) => {
        if (!user) {
            alert('Faça login para participar');
            return;
        }

        setJoiningCommunity(communityId);

        const isJoined = userCommunities[communityId] === true;

        try {
            if (isJoined) {
                // Try API call but don't fail if it errors (for local-only IDs)
                try {
                    await leaveCommunityApi(communityId, user.id);
                } catch (e) { }
                leaveCommunityLocal(communityId);
                setCommunities(prev => prev.map(c =>
                    c.id === communityId ? { ...c, members_count: Math.max(0, c.members_count - 1) } : c
                ));
            } else {
                try {
                    await joinCommunityApi(communityId, user.id);
                } catch (e) { }
                joinCommunityLocal(communityId);
                setCommunities(prev => prev.map(c =>
                    c.id === communityId ? { ...c, members_count: c.members_count + 1 } : c
                ));
            }
        } catch (error) {
            console.error('Error joining community:', error);
        }

        setJoiningCommunity(null);
    };

    const handleJoinEvent = async (eventId) => {
        if (!user) {
            alert('Faça login para participar');
            return;
        }

        setJoiningEvent(eventId);

        const isJoined = userEvents[eventId] === true;

        try {
            if (isJoined) {
                try {
                    await leaveEventApi(eventId, user.id);
                } catch (e) { }
                leaveEventLocal(eventId);
                setEvents(prev => prev.map(e =>
                    e.id === eventId ? { ...e, participants_count: Math.max(0, (e.participants_count || 1) - 1) } : e
                ));
            } else {
                try {
                    await joinEventApi(eventId, user.id);
                } catch (e) { }
                joinEventLocal(eventId);
                setEvents(prev => prev.map(e =>
                    e.id === eventId ? { ...e, participants_count: (e.participants_count || 0) + 1 } : e
                ));
            }
        } catch (error) {
            console.error('Error joining event:', error);
        }

        setJoiningEvent(null);
    };

    const formatEventDate = (dateStr) => {
        const date = new Date(dateStr);
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const day = days[date.getDay()];
        const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${day}, ${time}`;
    };

    const displayedCommunities = activeTab === 'my_communities'
        ? communities.filter(c => userCommunities[c.id] === true)
        : communities;

    const joinedCount = getJoinedCommunitiesCount();

    return (
        <div className={`min-h-screen bg-background-light dark:bg-background-dark ${hideHeader ? '' : 'pb-24'}`}>
            {!hideHeader && (
                <TopAppBar
                    title="Comunidades"
                    showNotifications
                    rightAction={
                        <motion.button whileTap={{ scale: 0.95 }} className="text-primary font-bold text-sm">
                            Criar
                        </motion.button>
                    }
                />
            )}

            <main className="flex flex-col gap-6 px-4 pt-2">
                {/* Location Badge */}
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span className="font-medium">Crateús, Ceará</span>
                </div>

                {/* Search */}
                <Input
                    placeholder="Buscar comunidades, eventos..."
                    icon="search"
                    iconPosition="left"
                    className="shadow-sm"
                />

                {/* Tabs */}
                <div className="flex p-1 bg-gray-200 dark:bg-surface-dark rounded-xl">
                    <button
                        onClick={() => setActiveTab('discover')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'discover'
                            ? 'bg-white dark:bg-surface-dark-highlight text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Descobrir
                    </button>
                    <button
                        onClick={() => setActiveTab('my_communities')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'my_communities'
                            ? 'bg-white dark:bg-surface-dark-highlight text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Minhas ({joinedCount})
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Communities Carousel */}
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {activeTab === 'my_communities' ? 'Suas Comunidades' : 'Comunidades em Destaque'}
                                </h3>
                            </div>

                            {displayedCommunities.length === 0 ? (
                                <Card className="py-8 text-center">
                                    <span className="material-symbols-outlined text-4xl text-white/30 mb-2">groups</span>
                                    <p className="text-white/50">Você ainda não participa de nenhuma comunidade</p>
                                    <button
                                        onClick={() => setActiveTab('discover')}
                                        className="mt-4 text-primary font-bold text-sm"
                                    >
                                        Descobrir comunidades
                                    </button>
                                </Card>
                            ) : (
                                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4">
                                    {displayedCommunities.map(item => (
                                        <motion.div
                                            key={item.id}
                                            whileTap={{ scale: 0.98 }}
                                            className="relative min-w-[280px] h-[180px] rounded-2xl overflow-hidden shadow-lg snap-center group"
                                        >
                                            <img
                                                src={item.cover_image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h4 className="text-white font-bold text-lg leading-tight">{item.name}</h4>
                                                <p className="text-gray-300 text-xs mt-1 line-clamp-1">{item.description}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px] text-primary">groups</span>
                                                        <span className="text-primary text-xs font-bold">{item.members_count} membros</span>
                                                    </div>
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleJoinCommunity(item.id)}
                                                        disabled={joiningCommunity === item.id}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold ${userCommunities[item.id] === true
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-primary text-background-dark'
                                                            }`}
                                                    >
                                                        {joiningCommunity === item.id ? (
                                                            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : userCommunities[item.id] === true ? 'Sair' : 'Entrar'}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Events Nearby */}
                        {activeTab === 'discover' && (
                            <section>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Próximos Eventos em Crateús
                                    </h3>
                                    <button className="text-primary text-xs font-bold">Ver todos</button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {events.map(event => (
                                        <Card key={event.id} padding="none" className="overflow-hidden flex bg-white dark:bg-surface-dark">
                                            <div className="w-24 h-full relative min-h-[120px]">
                                                <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover absolute" />
                                            </div>
                                            <div className="flex-1 p-4">
                                                <span className="text-xs font-bold text-primary mb-1 block">
                                                    {formatEventDate(event.event_date)}
                                                </span>
                                                <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-1">{event.title}</h4>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                    {event.location}
                                                </p>
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleJoinEvent(event.id)}
                                                    disabled={joiningEvent === event.id}
                                                    className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${userEvents[event.id] === true
                                                        ? 'bg-primary text-background-dark'
                                                        : 'bg-primary/10 text-primary border border-primary/30'
                                                        }`}
                                                >
                                                    {joiningEvent === event.id ? (
                                                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-sm">
                                                                {userEvents[event.id] === true ? 'check_circle' : 'add_circle'}
                                                            </span>
                                                            {userEvents[event.id] === true ? 'Confirmado ✓' : 'Participar'} ({event.participants_count || 0})
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Communities;
