import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TopAppBar from '../../components/common/TopAppBar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { useTrainingStore } from '../../store/trainingStore';
import { getMyActivities } from '../../services/activityApi';
import { updateProfile } from '../../services/authApi';
import { ROUTES } from '../../constants';
import { Geolocation } from '@capacitor/geolocation';

const Profile = () => {
    const navigate = useNavigate();
    const { profile, user, logout, setProfile: updateAuthProfile } = useAuthStore();
    const { profile: trainingProfile, getWeeklyProgress, getTrainingStreak } = useTrainingStore();
    const [lastActivity, setLastActivity] = useState(null);
    const [location, setLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: ''
    });
    const [stats, setStats] = useState([
        { label: 'Distância', value: '0', unit: 'km', icon: 'straighten' },
        { label: 'Tempo', value: '0', unit: 'h', icon: 'schedule' },
        { label: 'Atividades', value: '0', unit: '', icon: 'directions_run' },
        { label: 'Ritmo Médio', value: '--:--', unit: '/km', icon: 'speed' },
    ]);

    useEffect(() => {
        loadProfileData();
        getLocationFromGPS();
    }, [user]);

    useEffect(() => {
        if (profile) {
            setEditForm({
                name: profile.name || '',
                bio: profile.bio || ''
            });
        }
    }, [profile]);

    const getLocationFromGPS = async () => {
        try {
            setLoadingLocation(true);
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: false,
                timeout: 10000
            });

            // Reverse geocoding using OpenStreetMap Nominatim
            const { latitude, longitude } = position.coords;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'pt-BR'
                    }
                }
            );
            const data = await response.json();

            if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.municipality || data.address.county || '';
                const state = data.address.state || '';
                // Get state abbreviation
                const stateAbbr = getStateAbbreviation(state);
                setLocation(`${city}, ${stateAbbr}`);
            }
        } catch (error) {
            console.error('Error getting location:', error);
            setLocation('Localização indisponível');
        } finally {
            setLoadingLocation(false);
        }
    };

    const getStateAbbreviation = (stateName) => {
        const states = {
            'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
            'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
            'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
            'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
            'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
            'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
            'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
        };
        return states[stateName] || stateName;
    };

    const loadProfileData = async () => {
        if (!user?.id) return;

        try {
            const { data: activities } = await getMyActivities(user.id, 50);

            if (activities && activities.length > 0) {
                // Set last activity
                setLastActivity(activities[0]);

                // Calculate total stats
                const totalDistance = activities.reduce((sum, a) => sum + (a.distance_km || 0), 0);
                const totalTimeSeconds = activities.reduce((sum, a) => sum + (a.duration_seconds || 0), 0);
                const totalHours = Math.floor(totalTimeSeconds / 3600);
                const totalMinutes = Math.floor((totalTimeSeconds % 3600) / 60);

                // Calculate average pace
                let avgPace = '--:--';
                if (totalDistance > 0 && totalTimeSeconds > 0) {
                    const paceSecondsPerKm = totalTimeSeconds / totalDistance;
                    const mins = Math.floor(paceSecondsPerKm / 60);
                    const secs = Math.round(paceSecondsPerKm % 60);
                    avgPace = `${mins}:${secs.toString().padStart(2, '0')}`;
                }

                setStats([
                    { label: 'Distância', value: (Number(totalDistance) || 0).toFixed(1), unit: 'km', icon: 'straighten' },
                    { label: 'Tempo', value: totalHours > 0 ? totalHours.toString() : totalMinutes.toString(), unit: totalHours > 0 ? 'h' : 'min', icon: 'schedule' },
                    { label: 'Atividades', value: activities.length.toString(), unit: '', icon: 'directions_run' },
                    { label: 'Ritmo Médio', value: avgPace, unit: '/km', icon: 'speed' },
                ]);
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s}s`;
    };

    const handleSaveProfile = async () => {
        try {
            const { error } = await updateProfile(user.id, {
                name: editForm.name,
                bio: editForm.bio,
            });

            if (error) throw error;

            updateAuthProfile({ ...profile, name: editForm.name, bio: editForm.bio });
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao salvar perfil');
        }
    };

    const handleLogout = () => {
        if (confirm('Deseja realmente sair?')) {
            logout();
            navigate(ROUTES.LOGIN);
        }
    };

    // Get training stats
    const weeklyProgress = getWeeklyProgress ? getWeeklyProgress() : { completed: 0, total: 0 };
    const streak = getTrainingStreak ? getTrainingStreak() : 0;

    const badges = [
        { id: 1, name: 'Iniciante', icon: 'military_tech', color: 'text-orange-400', earned: true },
        { id: 2, name: 'Maratonista', icon: 'workspace_premium', color: 'text-purple-400', earned: stats[0].value >= 42 },
        { id: 3, name: 'Montanhista', icon: 'landscape', color: 'text-blue-400', earned: false },
        { id: 4, name: 'Velocista', icon: 'bolt', color: 'text-yellow-400', earned: stats[3].value !== '--:--' && stats[3].value < '5:00' },
        { id: 5, name: 'Dedicado', icon: 'local_fire_department', color: 'text-red-400', earned: streak >= 7 },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <TopAppBar
                title="Perfil"
                showNotifications
                showSettings
            />

            <main className="px-4 pt-2 flex flex-col gap-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-3 group">
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-surface-dark overflow-hidden ring-4 ring-primary/20 flex items-center justify-center">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-primary font-bold text-3xl">
                                    {profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="absolute bottom-0 right-0 bg-primary text-background-dark rounded-full p-1.5 shadow-lg"
                        >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {profile?.name || user?.email?.split('@')[0] || 'Corredor'}
                    </h2>

                    {/* Email */}
                    <p className="text-gray-500 text-sm mb-1">
                        {user?.email}
                    </p>

                    {/* Location with GPS */}
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {loadingLocation ? (
                            <span className="animate-pulse">Buscando localização...</span>
                        ) : (
                            location || 'Localização não disponível'
                        )}
                    </p>

                    {/* Bio */}
                    {profile?.bio && (
                        <p className="text-gray-400 text-sm text-center mt-2 max-w-xs">
                            {profile.bio}
                        </p>
                    )}

                    {/* Training Streak Badge */}
                    {streak > 0 && (
                        <div className="flex items-center gap-2 mt-3 bg-orange-500/20 px-3 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-orange-400">local_fire_department</span>
                            <span className="text-orange-400 font-bold">{streak} dias seguidos</span>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4 w-full justify-center">
                        <Button
                            size="sm"
                            variant="outline"
                            className="min-w-[100px]"
                            onClick={() => setShowEditModal(true)}
                        >
                            Editar Perfil
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="min-w-[100px]"
                            onClick={() => navigate(ROUTES.PERSONAL)}
                        >
                            <span className="material-symbols-outlined text-sm mr-1">fitness_center</span>
                            Personal
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-red-500 hover:bg-red-500/10"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </Button>
                    </div>
                </div>

                {/* Weekly Progress (if training plan active) */}
                {trainingProfile?.isSetupComplete && (
                    <Card padding="sm" className="bg-gradient-to-r from-primary/20 to-green-500/20 border-primary/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/70 text-xs uppercase">Progresso Semanal</p>
                                <p className="text-white font-bold text-lg">{weeklyProgress.completed}/{weeklyProgress.total} treinos</p>
                            </div>
                            <div className="text-right">
                                <p className="text-primary font-bold text-2xl">{weeklyProgress.percentage || 0}%</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* General Stats */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Estatísticas Gerais
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {stats.map((stat, index) => (
                            <Card key={index} padding="sm" className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                    <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                                        {stat.value}
                                        <span className="text-xs font-normal text-gray-400 ml-0.5">{stat.unit}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Achievements */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Conquistas
                        </h3>
                        <button className="text-primary text-xs font-bold">Ver tudo</button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {badges.map(badge => (
                            <div
                                key={badge.id}
                                className={`flex flex-col items-center gap-2 min-w-[80px] ${!badge.earned ? 'opacity-40' : ''}`}
                            >
                                <div className="w-16 h-16 rounded-full bg-surface-dark border border-white/5 flex items-center justify-center shadow-lg relative overflow-hidden group">
                                    <span className={`material-symbols-outlined text-3xl ${badge.color} group-hover:scale-110 transition-transform`}>
                                        {badge.icon}
                                    </span>
                                    {badge.earned && (
                                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                            <span className="material-symbols-outlined text-white text-xs">check</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 font-medium text-center truncate w-full">
                                    {badge.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Last Activity */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Última Atividade
                    </h3>
                    {lastActivity ? (
                        <Card
                            padding="none"
                            className="overflow-hidden cursor-pointer"
                            onClick={() => navigate(ROUTES.ACTIVITY_DETAILS.replace(':id', lastActivity.id), { state: { activity: lastActivity } })}
                        >
                            <div className="h-32 bg-gray-800 relative">
                                <div className="w-full h-full flex items-center justify-center bg-primary/20">
                                    <span className="material-symbols-outlined text-6xl text-primary/50">
                                        directions_run
                                    </span>
                                </div>
                                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-white text-xs font-bold">
                                    {new Date(lastActivity.created_at).toLocaleDateString('pt-BR', { weekday: 'long' })}
                                </div>
                                <div className="absolute top-3 right-3 bg-primary/80 px-2 py-1 rounded text-background-dark text-xs font-bold">
                                    Ver Detalhes
                                </div>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                                        {lastActivity.title}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {lastActivity.type === 'running' ? 'Corrida' : lastActivity.type}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-primary">
                                        {(Number(lastActivity.distance_km) || 0).toFixed(2)}
                                        <span className="text-xs text-gray-400">km</span>
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {formatDuration(lastActivity.duration_seconds)}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card padding="lg" className="text-center">
                            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                                directions_run
                            </span>
                            <p className="text-gray-500">Nenhuma atividade ainda</p>
                            <p className="text-sm text-gray-400 mb-3">Complete sua primeira corrida!</p>
                            <Button size="sm" onClick={() => navigate(ROUTES.RECORD)}>
                                <span className="material-symbols-outlined text-sm mr-1">play_arrow</span>
                                Iniciar Corrida
                            </Button>
                        </Card>
                    )}
                </section>

                {/* Quick Actions */}
                <section className="pb-4">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Ações Rápidas
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Card
                            padding="sm"
                            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => navigate(ROUTES.SETTINGS)}
                        >
                            <div className="bg-gray-500/20 p-2 rounded-lg">
                                <span className="material-symbols-outlined text-gray-400">settings</span>
                            </div>
                            <span className="text-white font-medium">Configurações</span>
                        </Card>
                        <Card
                            padding="sm"
                            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => navigate(ROUTES.PERSONAL)}
                        >
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <span className="material-symbols-outlined text-primary">fitness_center</span>
                            </div>
                            <span className="text-white font-medium">Treinos</span>
                        </Card>
                    </div>
                </section>
            </main>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-surface-dark rounded-2xl p-6"
                        >
                            <h2 className="text-white text-xl font-bold mb-6">Editar Perfil</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-white/70 text-sm mb-1 block">Nome</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                                        placeholder="Seu nome"
                                    />
                                </div>

                                <div>
                                    <label className="text-white/70 text-sm mb-1 block">Bio</label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
                                        placeholder="Conte um pouco sobre você..."
                                        rows={3}
                                    />
                                </div>

                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-white/50 text-sm">Email</p>
                                    <p className="text-white">{user?.email}</p>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-white/50 text-sm">Localização</p>
                                    <p className="text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                                        {location || 'Obtendo localização...'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={handleSaveProfile}
                                >
                                    Salvar
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
