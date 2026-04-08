import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Share } from '@capacitor/share';
import TopAppBar from '../../components/common/TopAppBar';
import Card from '../../components/common/Card';
import StatCard from '../../components/stats/StatCard';
import SponsorCarousel from '../../components/home/SponsorCarousel';
import { useAuthStore } from '../../store/authStore';
import { getFeed, getMyActivities, toggleLike } from '../../services/activityApi';
import { ROUTES } from '../../constants';
import { calculateBMR } from '../../utils/fitnessUtils';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, profile, isLoading } = useAuthStore();

    const [stats, setStats] = useState({
        weeklyDistance: 0,
        avgPace: '--:--',
        weeklyCalories: 0,
        dailyBurn: 0
    });

    const [feedItems, setFeedItems] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user, profile]);

    const loadData = async () => {
        try {
            // Load Feed
            const { data: feed } = await getFeed();
            if (feed) setFeedItems(feed);

            // Load User Activities
            const { data: myActivities } = await getMyActivities(user.id, 20);

            if (myActivities) {
                setActivities(myActivities);

                // Calculate stats
                const now = new Date();
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                const weeklyActivities = myActivities.filter(a =>
                    new Date(a.created_at) >= oneWeekAgo
                );

                const totalDistance = weeklyActivities.reduce((sum, a) => sum + (a.distance_km || 0), 0);
                const totalCalories = weeklyActivities.reduce((sum, a) => sum + (a.calories || 0), 0);
                const totalDuration = weeklyActivities.reduce((sum, a) => sum + (a.duration_seconds || 0), 0);

                // Average Pace
                let avgPace = '--:--';
                if (totalDistance > 0 && totalDuration > 0) {
                    const paceSecondsPerKm = totalDuration / totalDistance;
                    const mins = Math.floor(paceSecondsPerKm / 60);
                    const secs = Math.round(paceSecondsPerKm % 60);
                    avgPace = `${mins}:${secs.toString().padStart(2, '0')}`;
                }

                // Daily Burn Calculation
                const todayActivities = myActivities.filter(a => {
                    const actDate = new Date(a.created_at);
                    return actDate.getDate() === now.getDate() &&
                        actDate.getMonth() === now.getMonth() &&
                        actDate.getFullYear() === now.getFullYear();
                });

                const todayActivityCalories = todayActivities.reduce((sum, a) => sum + (a.calories || 0), 0);

                // Safe fallback for profile data
                const weight = Number(profile?.weight) || 70;
                const height = Number(profile?.height) || 170;
                const age = Number(profile?.age) || 30;
                const gender = profile?.gender || 'male';

                const bmr = calculateBMR(weight, height, age, gender);
                const totalDailyBurn = (bmr || 2000) + todayActivityCalories; // Safe fallback for BMR

                setStats({
                    weeklyDistance: totalDistance.toFixed(1),
                    avgPace,
                    weeklyCalories: totalCalories,
                    dailyBurn: totalDailyBurn
                });

                // Generate Weekly Chart Data (Mock logic or calculated)
                const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                const chartData = days.map((day, index) => {
                    const dayActivities = weeklyActivities.filter(a => new Date(a.created_at).getDay() === index);
                    const dist = dayActivities.reduce((sum, a) => sum + (a.distance_km || 0), 0);
                    return {
                        day,
                        progress: Math.min((dist / 5) * 100, 100),
                        active: index === now.getDay()
                    };
                });
                setWeeklyData(chartData);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    const handleLike = async (id) => {
        if (!user) return;
        await toggleLike(id, user.id);
        setFeedItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
                : item
        ));
    };

    const handleShare = async (item) => {
        try {
            await Share.share({
                title: 'FitCrat Activity',
                text: `Confira minha atividade no FitCrat: ${item.title}`,
                url: item.url || 'https://fitcrat.app',
                dialogTitle: 'Compartilhar atividade',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">Carregando...</div>;
    }

    return (
        <div className="min-h-screen bg-background-dark pb-24">
            <TopAppBar user={user} showNotifications showSettings />

            <main className="pt-20 space-y-6">
                <SponsorCarousel />

                {/* Stats Carousel */}
                <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2 snap-x">
                    <StatCard
                        icon="local_fire_department"
                        iconColor="text-orange-500"
                        label="Queima Hoje"
                        value={(stats.dailyBurn || 0).toLocaleString()}
                        unit="kcal"
                        className="snap-center min-w-[160px] flex-1"
                    />
                    <StatCard
                        icon="directions_run"
                        iconColor="text-primary"
                        label="Distância Semanal"
                        value={stats.weeklyDistance}
                        unit="km"
                        className="snap-center min-w-[160px] flex-1"
                    />
                    <StatCard
                        icon="timer"
                        iconColor="text-blue-400"
                        label="Ritmo Médio"
                        value={stats.avgPace}
                        unit="/km"
                        className="snap-center min-w-[160px] flex-1"
                    />
                    <StatCard
                        icon="history"
                        iconColor="text-purple-400"
                        label="Calorias Semanal"
                        value={(stats.weeklyCalories || 0).toLocaleString()}
                        unit="kcal"
                        className="snap-center min-w-[160px] flex-1"
                    />
                </div>

                {/* Weekly Chart */}
                <section className="px-4">
                    <Card variant="default" padding="lg">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                                    Meta da Semana
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        35.0 <span className="text-base font-normal text-gray-400">km</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-primary text-sm font-bold flex items-center justify-end gap-1">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    70% da meta
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-3 h-40 items-end">
                            {weeklyData.map((item, index) => (
                                <div key={index} className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                                    <div
                                        className={`w-full rounded-t-sm relative transition-all ${item.active
                                            ? 'bg-primary shadow-glow-primary'
                                            : 'bg-primary/20 dark:bg-primary/10 group-hover:bg-primary/40'
                                            }`}
                                        style={{ height: `${item.progress}%` }}
                                    />
                                    <span className={`text-xs font-medium ${item.active ? 'text-primary font-bold' : 'text-gray-400'}`}>
                                        {item.day}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>

                {/* Recent History */}
                <section className="flex flex-col gap-3">
                    <div className="px-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Seu Histórico
                        </h3>
                        {activities.length > 0 && (
                            <button onClick={() => navigate(ROUTES.GYM_HISTORY)} className="text-primary text-xs font-bold">
                                Ver todos
                            </button>
                        )}
                    </div>

                    {activities.length > 0 ? (
                        <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-4 snap-x">
                            {activities.map((activity) => (
                                <div key={activity.id} className="snap-center shrink-0 w-64 rounded-2xl overflow-hidden relative shadow-lg bg-surface-dark border border-white/5">
                                    <div
                                        className="h-32 w-full bg-cover bg-center bg-gray-800"
                                        style={{ backgroundImage: `url(${activity.displayMapImage || activity.map_image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'})` }}
                                        onClick={() => navigate(`/activity/${activity.id}`, { state: { activity } })}
                                    >
                                        <div className="absolute inset-0 bg-black/40 hover:bg-black/30 transition-colors cursor-pointer" />
                                        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
                                            <span className="text-[10px] font-bold text-white/90 uppercase">
                                                {new Date(activity.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-surface-dark">
                                        <h4 className="text-sm font-bold text-white mb-2 truncate">{activity.title}</h4>
                                        <div className="flex items-center justify-between text-xs mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-gray-400">Distância</span>
                                                <span className="font-bold text-white">{activity.distance_km?.toFixed(2)} km</span>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-gray-400">Ritmo</span>
                                                <span className="font-bold text-white">{activity.pace} /km</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleShare(activity)} className="w-full py-2 flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-white/10 text-gray-600 dark:text-white/80 transition-colors text-xs font-semibold">
                                            <span className="material-symbols-outlined text-[16px]">share</span>
                                            Compartilhar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 flex flex-col items-center justify-center text-center bg-white/5 rounded-xl mx-4 border border-white/5 border-dashed">
                            <div className="w-12 h-12 rounded-full bg-surface-dark flex items-center justify-center mb-3">
                                <span className="material-symbols-outlined text-gray-400">format_list_bulleted</span>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">Nenhuma atividade recente.</p>
                            <button onClick={() => navigate(ROUTES.TRACKING_START)} className="mt-3 text-primary text-xs font-bold uppercase tracking-wider hover:underline">
                                Começar agora
                            </button>
                        </div>
                    )}
                </section>

                {/* Social Feed */}
                <section className="flex flex-col gap-4">
                    <h3 className="px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Atividade dos Amigos
                    </h3>
                    {feedItems.map((item) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col bg-white dark:bg-surface-dark border-y border-gray-100 dark:border-white/5 pb-4">
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    {item.user?.avatar ? (
                                        <div className="bg-center bg-no-repeat bg-cover rounded-full size-10" style={{ backgroundImage: `url(${item.user.avatar})` }} />
                                    ) : (
                                        <div className="rounded-full size-10 bg-primary/20 flex items-center justify-center">
                                            <span className="text-primary font-bold text-sm">{item.user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{item.user?.name || 'Usuário'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{item.time} • {item.location}</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-white">
                                    <span className="material-symbols-outlined">more_horiz</span>
                                </button>
                            </div>
                            <div className="px-4 mb-3">
                                <p className="text-base font-medium text-gray-900 dark:text-white">{item.title}</p>
                            </div>
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(`/activity/${item.id}`, { state: { activity: item } })}
                                className="w-full h-48 bg-gray-800 relative mb-4 cursor-pointer"
                            >
                                <div className="w-full h-full object-cover opacity-80 bg-center bg-cover" style={{ backgroundImage: `url(${item.mapImage})` }} />
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/10">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase">Distância</span>
                                        <span className="text-lg font-bold text-white">{item.distance} <span className="text-xs font-normal">km</span></span>
                                    </div>
                                    <div className="flex flex-col border-l border-white/20 pl-4">
                                        <span className="text-xs text-gray-400 uppercase">Ritmo</span>
                                        <span className="text-lg font-bold text-white">{item.pace} <span className="text-xs font-normal">/km</span></span>
                                    </div>
                                    <div className="flex flex-col border-l border-white/20 pl-4">
                                        <span className="text-xs text-gray-400 uppercase">Tempo</span>
                                        <span className="text-lg font-bold text-white">{item.duration}</span>
                                    </div>
                                </div>
                            </motion.div>
                            <div className="px-4 flex gap-6">
                                <button onClick={() => handleLike(item.id)} className={`flex items-center gap-2 font-medium text-sm transition-all hover:scale-110 active:scale-95 ${item.isLiked ? 'text-primary' : 'text-gray-500 hover:text-gray-400'}`}>
                                    <span className={`material-symbols-outlined text-[20px] ${item.isLiked ? 'filled' : ''}`}>thumb_up</span>
                                    {item.likes}
                                </button>
                                <button onClick={() => navigate(ROUTES.ACTIVITY_DETAILS.replace(':id', item.id))} className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm">
                                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                                    Comentar
                                </button>
                                <button onClick={() => handleShare(item)} className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm ml-auto">
                                    <span className="material-symbols-outlined text-[20px]">share</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </section>
            </main>

            {/* FAB - Academia */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(ROUTES.GYM)}
                className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full p-4 shadow-xl shadow-purple-500/30 transition-all flex items-center justify-center"
            >
                <span className="material-symbols-outlined text-[32px] font-bold">fitness_center</span>
            </motion.button>
        </div>
    );
};

export default Dashboard;
