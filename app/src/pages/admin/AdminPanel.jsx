import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getSponsors, createSponsor, deleteSponsor as apiDeleteSponsor, uploadSponsorImage,
    getGymImages, uploadGymImage,
    getExercises, updateExercise, getExerciseImages, uploadExerciseImage, uploadExerciseAudio,
    getPromoVideo, uploadPromoVideo,
} from '../../services/adminApi';
import { exerciseDatabase, muscleGroups } from '../../data/exerciseData';

const STORAGE_URL = import.meta.env.VITE_API_URL || '';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('gym');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [gymImages, setGymImages] = useState([]);
    const [appSettings, setAppSettings] = useState({
        appName: 'FITCRAT',
        primaryColor: '#D4FF00',
        enableGym: true,
        enablePersonal: true,
        enableSocial: true
    });

    // Exercises management
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('peitoral');
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [exerciseImages, setExerciseImages] = useState({});
    const [searchExercise, setSearchExercise] = useState('');
    const [uploadingExerciseImage, setUploadingExerciseImage] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // Edição de exercício
    const [editingDescription, setEditingDescription] = useState('');
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [exercises, setExercises] = useState([]);
    const [loadingExercises, setLoadingExercises] = useState(false);

    // Promo video management
    const [uploadingPromoVideo, setUploadingPromoVideo] = useState(false);
    const [promoVideoUrl, setPromoVideoUrl] = useState(null);

    // Sponsors management
    const [sponsors, setSponsors] = useState([]);
    const [uploadingSponsor, setUploadingSponsor] = useState(false);
    const [newSponsorName, setNewSponsorName] = useState('');
    const [newSponsorLink, setNewSponsorLink] = useState('');

    // Admin credentials
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = '01Deus02@';

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === ADMIN_USER && password === ADMIN_PASS) {
            setIsAuthenticated(true);
            setError('');
            sessionStorage.setItem('adminAuth', 'true');
        } else {
            setError('Credenciais inválidas');
        }
    };

    useEffect(() => {
        if (sessionStorage.getItem('adminAuth') === 'true') {
            setIsAuthenticated(true);
        }
        loadGymImages();
        loadExerciseImages();
        loadSponsors();
    }, []);

    const loadSponsors = async () => {
        const { data } = await getSponsors();
        if (data) setSponsors(data);
    };

    const handleSponsorUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !newSponsorName) {
            alert('Por favor, preencha o nome do patrocinador antes de selecionar a imagem.');
            return;
        }

        setUploadingSponsor(true);
        try {
            const { data: uploadData, error: uploadError } = await uploadSponsorImage(file);
            if (uploadError) throw new Error('Erro no upload da imagem');

            const imageUrl = uploadData?.url || uploadData;
            const { error: dbError } = await createSponsor({
                name: newSponsorName,
                image_url: imageUrl,
                link_url: newSponsorLink,
                order_index: sponsors.length
            });

            if (!dbError) {
                setNewSponsorName('');
                setNewSponsorLink('');
                loadSponsors();
                showToast();
            }
        } catch (err) {
            console.error('Erro ao salvar patrocinador:', err);
            alert('Erro ao carregar patrocinador');
        } finally {
            setUploadingSponsor(false);
        }
    };

    const deleteSponsor = async (id) => {
        if (!confirm('Deseja excluir este patrocinador?')) return;
        const { error } = await apiDeleteSponsor(id);
        if (!error) loadSponsors();
    };

    const loadGymImages = async () => {
        try {
            const { data, error } = await getGymImages();
            if (!error && data) {
                setGymImages(data);
            }
        } catch (err) {
            console.log('Erro ao carregar imagens da academia');
        }
    };

    const loadExerciseImages = async () => {
        try {
            const { data, error } = await getExerciseImages();
            if (!error && data) {
                const imagesMap = {};
                data.forEach(item => {
                    imagesMap[item.exercise_id] = item.image_url;
                });
                setExerciseImages(imagesMap);
            }
        } catch (err) {
            console.log('Erro ao carregar imagens de exercícios');
        }
    };

    const loadExercisesFromApi = async (muscleGroup) => {
        setLoadingExercises(true);
        try {
            const { data, error } = await getExercises(muscleGroup);
            if (!error && data) {
                setExercises(data);
            }
        } catch (err) {
            console.log('Erro ao carregar exercícios:', err);
        } finally {
            setLoadingExercises(false);
        }
    };

    const updateExerciseDescription = async (exerciseId, description) => {
        try {
            const { error } = await updateExercise(exerciseId, { description });
            if (!error) {
                showToast();
                loadExercisesFromApi(selectedMuscleGroup);
            } else {
                alert('Erro ao atualizar descrição');
            }
        } catch (err) {
            console.error('Erro ao atualizar descrição:', err);
            alert('Erro ao atualizar descrição');
        }
    };

    const handleAudioUpload = async (e, exerciseId) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAudio(true);
        try {
            const { data, error } = await uploadExerciseAudio(exerciseId, file);
            if (error) throw new Error('Erro no upload do áudio');
            showToast();
            loadExercisesFromApi(selectedMuscleGroup);
        } catch (err) {
            console.error('Erro ao enviar áudio:', err);
            alert('Erro ao enviar áudio');
        } finally {
            setUploadingAudio(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadExercisesFromApi(selectedMuscleGroup);
            loadPromoVideo();
        }
    }, [selectedMuscleGroup, isAuthenticated]);

    const loadPromoVideo = async () => {
        try {
            const { data } = await getPromoVideo();
            if (data?.url) {
                setPromoVideoUrl(data.url);
            }
        } catch (err) {
            console.log('Vídeo promocional não encontrado');
        }
    };

    const handlePromoVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['video/webm', 'video/mp4', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Formato inválido. Use WebM, MP4 ou GIF.');
            return;
        }

        setUploadingPromoVideo(true);
        try {
            const { data, error } = await uploadPromoVideo(file);
            if (error) throw new Error('Erro no upload do vídeo');
            setPromoVideoUrl((data?.url || data) + '?t=' + Date.now());
            showToast();
        } catch (err) {
            console.error('Erro ao enviar vídeo:', err);
            alert('Erro ao enviar vídeo: ' + err.message);
        } finally {
            setUploadingPromoVideo(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
    };

    const handleImageUpload = async (e, category) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const { data, error } = await uploadGymImage(file, { category });
            if (!error && data) {
                loadGymImages();
                showToast();
            }
        } catch (err) {
            console.error('Erro ao enviar:', err);
            alert('Erro ao enviar imagem');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleExerciseImageUpload = async (e, exerciseId) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingExerciseImage(true);
        try {
            const { data, error } = await uploadExerciseImage(exerciseId, file);
            if (!error && data) {
                const imageUrl = data?.url || data;
                setExerciseImages({ ...exerciseImages, [exerciseId]: imageUrl });
                showToast();
            }
        } catch (err) {
            console.error('Erro ao enviar:', err);
            alert('Erro ao enviar imagem');
        } finally {
            setUploadingExerciseImage(false);
            setSelectedExercise(null);
        }
    };

    const showToast = () => {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2000);
    };

    const getFilteredExercises = () => {
        let filteredExercises = exercises || [];

        if (searchExercise.trim()) {
            filteredExercises = filteredExercises.filter(ex =>
                ex.name.toLowerCase().includes(searchExercise.toLowerCase())
            );
        }

        return filteredExercises;
    };

    const getExerciseImage = (exercise) => {
        return exerciseImages[exercise.id] || `/exercises/${exercise.image}`;
    };

    const tabs = [
        { id: 'gym', label: 'Academia', icon: 'fitness_center' },
        { id: 'exercises', label: 'Exercícios', icon: 'sports_gymnastics' },
        { id: 'sponsors', label: 'Patrocinadores', icon: 'ads_click' },
        { id: 'settings', label: 'Configurações', icon: 'settings' },
    ];

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 mx-auto flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
                        </div>
                        <h1 className="text-white text-2xl font-bold">FitCrat Admin</h1>
                        <p className="text-white/50 text-sm">Acesso restrito</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-white/70 text-sm">Usuário</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                                placeholder="admin"
                            />
                        </div>
                        <div>
                            <label className="text-white/70 text-sm">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl"
                        >
                            Entrar
                        </motion.button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full py-3 text-white/50 text-sm"
                        >
                            Voltar
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="min-h-screen bg-background-dark pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-gradient-to-r from-red-900/50 to-orange-900/50 backdrop-blur-md border-b border-white/10 px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/')}
                            className="p-2 -ml-2"
                        >
                            <span className="material-symbols-outlined text-white">arrow_back</span>
                        </motion.button>
                        <div>
                            <h1 className="text-white font-bold text-lg">Painel Admin</h1>
                            <p className="text-red-400 text-sm">Área restrita</p>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleLogout}
                        className="p-2"
                    >
                        <span className="material-symbols-outlined text-white/50">logout</span>
                    </motion.button>
                </div>
            </header>

            {/* Tabs */}
            <div className="px-4 py-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                : 'bg-surface-dark text-white/60 border border-white/10'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="px-4 space-y-6">
                {/* Gym Images Tab */}
                {activeTab === 'gym' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-400">image</span>
                            Imagens da Academia
                        </h2>

                        <div className="bg-surface-dark rounded-2xl p-4 border border-white/10 mb-6">
                            <h3 className="text-white font-medium mb-3">Upload de Imagens</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {['background', 'exercises', 'equipment', 'motivation'].map(category => (
                                    <label
                                        key={category}
                                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-red-500 transition-colors"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, category)}
                                            className="hidden"
                                        />
                                        <span className="material-symbols-outlined text-white/50 text-2xl mb-2">add_photo_alternate</span>
                                        <span className="text-white/70 text-sm capitalize">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-white/70 text-sm font-medium">Imagens Enviadas ({gymImages.length})</h3>
                            {gymImages.length === 0 ? (
                                <div className="text-center py-8 text-white/40">
                                    <span className="material-symbols-outlined text-4xl mb-2">collections</span>
                                    <p>Nenhuma imagem enviada ainda</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {gymImages.map(img => (
                                        <div key={img.id} className="relative rounded-xl overflow-hidden">
                                            <img src={img.url} alt={img.filename} className="w-full h-32 object-cover" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                                                <p className="text-white text-xs truncate">{img.category}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Promo Video Section */}
                        <div className="bg-surface-dark rounded-2xl p-4 border border-purple-500/30 mt-6">
                            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400">movie</span>
                                Vídeo Promocional da Biblioteca
                            </h3>
                            <p className="text-white/50 text-xs mb-4">
                                Este vídeo aparece no topo da biblioteca de exercícios. Formatos aceitos: WebM, MP4, GIF.
                            </p>

                            {promoVideoUrl && (
                                <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
                                    <video
                                        src={promoVideoUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-40 object-cover"
                                    />
                                </div>
                            )}

                            <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-purple-500/40 rounded-xl cursor-pointer hover:border-purple-500 transition-colors bg-purple-500/5">
                                <input
                                    type="file"
                                    accept="video/webm,video/mp4,image/gif"
                                    onChange={handlePromoVideoUpload}
                                    className="hidden"
                                    disabled={uploadingPromoVideo}
                                />
                                {uploadingPromoVideo ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-purple-400 font-medium">Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-purple-400 text-2xl">upload</span>
                                        <div>
                                            <span className="text-purple-400 font-medium block">Trocar Vídeo Promocional</span>
                                            <span className="text-white/40 text-xs">WebM, MP4 ou GIF até 50MB</span>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>
                    </motion.div>
                )}

                {/* Exercises Tab */}
                {activeTab === 'exercises' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-400">sports_gymnastics</span>
                            Gerenciar Exercícios
                        </h2>

                        {/* Muscle Group Filter */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
                            {muscleGroups.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={() => setSelectedMuscleGroup(group.id)}
                                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedMuscleGroup === group.id
                                        ? `bg-gradient-to-r ${group.color} text-white`
                                        : 'bg-white/5 text-white/70'
                                        }`}
                                >
                                    {group.name}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                                search
                            </span>
                            <input
                                type="text"
                                value={searchExercise}
                                onChange={(e) => setSearchExercise(e.target.value)}
                                placeholder="Buscar exercício..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-white/40 focus:outline-none focus:border-red-500/50"
                            />
                        </div>

                        {/* Exercise List */}
                        <div className="space-y-3">
                            {loadingExercises ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-2 border-white/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-white/50 text-sm">Carregando exercícios...</p>
                                </div>
                            ) : getFilteredExercises().length === 0 ? (
                                <div className="text-center py-8 text-white/40">
                                    <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                                    <p>Nenhum exercício encontrado</p>
                                </div>
                            ) : (
                                getFilteredExercises().map((exercise) => (
                                    <div
                                        key={exercise.id}
                                        className="bg-surface-dark rounded-xl p-3 flex items-center gap-3 border border-white/5"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black/30 relative">
                                            <img
                                                src={exercise.gif_path ? `${STORAGE_URL}/uploads/exercises/${exercise.gif_path}` : getExerciseImage(exercise)}
                                                alt={exercise.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {exercise.audio_path && (
                                                <div className="absolute bottom-0 right-0 w-5 h-5 bg-purple-500 flex items-center justify-center rounded-tl">
                                                    <span className="material-symbols-outlined text-white text-xs">mic</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium text-sm truncate">{exercise.name}</h3>
                                            <p className="text-white/50 text-xs capitalize">{exercise.primary_muscle} • {exercise.equipment}</p>
                                            <p className="text-white/30 text-xs truncate">{exercise.description?.substring(0, 40) || 'Sem descrição'}...</p>
                                        </div>

                                        {/* Edit Button */}
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                                setSelectedExercise(exercise);
                                                setEditingDescription(exercise.description || '');
                                            }}
                                            className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-white">edit</span>
                                        </motion.button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Stats */}
                        <div className="mt-6 bg-surface-dark rounded-xl p-4 border border-white/10">
                            <h3 className="text-white font-medium mb-3">Estatísticas</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">
                                        {Object.values(exerciseDatabase).flat().length}
                                    </p>
                                    <p className="text-white/50 text-xs">Total Exercícios</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-400">
                                        {Object.keys(exerciseImages).length}
                                    </p>
                                    <p className="text-white/50 text-xs">Imagens Custom</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Sponsors Tab */}
                {activeTab === 'sponsors' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <h2 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">ads_click</span>
                            Gerenciar Patrocinadores (Home)
                        </h2>

                        {/* Add Sponsor Form */}
                        <div className="bg-surface-dark rounded-2xl p-4 border border-white/10 space-y-4">
                            <h3 className="text-white font-medium text-sm">Adicionar Novo Patrocinador</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nome do patrocinador"
                                    value={newSponsorName}
                                    onChange={(e) => setNewSponsorName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Link (opcional)"
                                    value={newSponsorLink}
                                    onChange={(e) => setNewSponsorLink(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none text-sm"
                                />
                                <label className="flex items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary transition-colors bg-white/5">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleSponsorUpload}
                                        className="hidden"
                                        disabled={uploadingSponsor || !newSponsorName}
                                    />
                                    {uploadingSponsor ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            <span className="text-white/50 text-xs">Fazendo upload...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-3xl text-primary">add_photo_alternate</span>
                                            <span className="text-white/70 font-medium">Selecionar Imagem</span>
                                            <span className="text-white/30 text-[10px]">Recomendado: 800x400 (2:1)</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Sponsors List */}
                        <div className="space-y-3">
                            <h3 className="text-white/70 text-sm font-medium">Patrocinadores Ativos ({sponsors.length})</h3>
                            {sponsors.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="material-symbols-outlined text-4xl text-white/20 mb-2">branding_watermark</span>
                                    <p className="text-white/40 text-sm">Nenhum patrocinador cadastrado</p>
                                </div>
                            ) : (
                                sponsors.map(sp => (
                                    <div key={sp.id} className="bg-surface-dark rounded-2xl overflow-hidden border border-white/5 flex gap-4 p-3 items-center">
                                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-black/50 shrink-0">
                                            <img src={sp.image_url} alt={sp.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold text-sm truncate">{sp.name}</h4>
                                            {sp.link_url && <p className="text-white/30 text-[10px] truncate">{sp.link_url}</p>}
                                        </div>
                                        <button
                                            onClick={() => deleteSponsor(sp.id)}
                                            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-400">settings</span>
                            Configurações do App
                        </h2>

                        <div className="space-y-4">
                            <div className="bg-surface-dark rounded-2xl p-4 border border-white/10">
                                <label className="text-white/70 text-sm mb-2 block">Nome do App</label>
                                <input
                                    type="text"
                                    value={appSettings.appName}
                                    onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="bg-surface-dark rounded-2xl p-4 border border-white/10">
                                <h3 className="text-white font-medium mb-4">Funcionalidades</h3>
                                {[
                                    { key: 'enableGym', label: 'Módulo Academia', icon: 'fitness_center' },
                                    { key: 'enablePersonal', label: 'Personal Trainer', icon: 'directions_run' },
                                    { key: 'enableSocial', label: 'Comunidades', icon: 'groups' },
                                ].map(feature => (
                                    <div key={feature.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-white/50">{feature.icon}</span>
                                            <span className="text-white">{feature.label}</span>
                                        </div>
                                        <button
                                            onClick={() => setAppSettings({
                                                ...appSettings,
                                                [feature.key]: !appSettings[feature.key]
                                            })}
                                            className={`w-12 h-6 rounded-full transition-colors ${appSettings[feature.key] ? 'bg-green-500' : 'bg-white/20'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${appSettings[feature.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-surface-dark rounded-2xl p-4 border border-white/10">
                                <h3 className="text-white font-medium mb-4">Informações do Sistema</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Versão</span>
                                        <span className="text-white">1.0.0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Ambiente</span>
                                        <span className="text-green-400">Produção</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Banco de Dados</span>
                                        <span className="text-white">PostgreSQL</span>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl"
                            >
                                Salvar Configurações
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Edit Exercise Modal */}
            <AnimatePresence>
                {selectedExercise && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-end overflow-y-auto"
                        onClick={() => setSelectedExercise(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-surface-dark rounded-t-3xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-center py-3 sticky top-0 bg-surface-dark">
                                <div className="w-12 h-1 bg-white/30 rounded-full" />
                            </div>

                            <div className="px-4 pb-8">
                                <h2 className="text-white text-lg font-bold mb-4">Editar Exercício</h2>

                                {/* Exercise Info Header */}
                                <div className="bg-white/5 rounded-xl p-4 mb-4">
                                    <h3 className="text-white font-medium">{selectedExercise.name}</h3>
                                    <p className="text-white/50 text-sm capitalize">{selectedExercise.primary_muscle || selectedExercise.primaryMuscle} • {selectedExercise.equipment}</p>
                                    <p className="text-white/30 text-xs mt-1">ID: {selectedExercise.id}</p>
                                </div>

                                {/* GIF Preview */}
                                <div className="relative mb-4">
                                    <img
                                        src={selectedExercise.gif_path ? `${STORAGE_URL}/uploads/exercises/${selectedExercise.gif_path}` : getExerciseImage(selectedExercise)}
                                        alt={selectedExercise.name}
                                        className="w-full h-48 object-contain rounded-xl bg-black/30"
                                    />
                                </div>

                                {/* Description Edit */}
                                <div className="mb-4">
                                    <label className="text-white/70 text-sm mb-2 block flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">description</span>
                                        Descrição do Exercício
                                    </label>
                                    <textarea
                                        value={editingDescription || selectedExercise.description || ''}
                                        onChange={(e) => setEditingDescription(e.target.value)}
                                        placeholder="Descreva como executar o exercício..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 min-h-[100px] resize-none focus:outline-none focus:border-primary"
                                    />
                                    <button
                                        onClick={() => {
                                            updateExerciseDescription(selectedExercise.id, editingDescription || selectedExercise.description);
                                            setEditingDescription('');
                                        }}
                                        className="mt-2 w-full py-2 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">save</span>
                                        Salvar Descrição
                                    </button>
                                </div>

                                {/* Audio Upload */}
                                <div className="mb-4">
                                    <label className="text-white/70 text-sm mb-2 block flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">mic</span>
                                        Áudio do Exercício
                                    </label>

                                    {selectedExercise.audio_path && (
                                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-2 flex items-center gap-3">
                                            <span className="material-symbols-outlined text-green-400">audio_file</span>
                                            <span className="text-green-400 text-sm flex-1 truncate">{selectedExercise.audio_path}</span>
                                            <audio controls className="h-8">
                                                <source src={`${STORAGE_URL}/uploads/exercises/${selectedExercise.audio_path}`} />
                                            </audio>
                                        </div>
                                    )}

                                    <label className="block w-full py-3 bg-purple-600 rounded-xl text-center cursor-pointer">
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            onChange={(e) => handleAudioUpload(e, selectedExercise.id)}
                                            className="hidden"
                                            disabled={uploadingAudio}
                                        />
                                        {uploadingAudio ? (
                                            <div className="flex items-center justify-center gap-2 text-white">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Enviando áudio...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-white font-bold">
                                                <span className="material-symbols-outlined">upload</span>
                                                {selectedExercise.audio_path ? 'Trocar Áudio' : 'Adicionar Áudio'}
                                            </div>
                                        )}
                                    </label>
                                </div>

                                {/* Image Upload */}
                                <label className="block w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-center cursor-pointer mb-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleExerciseImageUpload(e, selectedExercise.id)}
                                        className="hidden"
                                        disabled={uploadingExerciseImage}
                                    />
                                    {uploadingExerciseImage ? (
                                        <div className="flex items-center justify-center gap-2 text-white">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando imagem...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-white font-bold">
                                            <span className="material-symbols-outlined">image</span>
                                            Trocar Imagem/GIF
                                        </div>
                                    )}
                                </label>

                                <button
                                    onClick={() => {
                                        setSelectedExercise(null);
                                        setEditingDescription('');
                                    }}
                                    className="w-full py-3 text-white/50 text-sm"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-4 right-4 z-[101]"
                    >
                        <div className="bg-green-500 rounded-xl p-4 flex items-center gap-3 shadow-lg">
                            <span className="material-symbols-outlined text-white">check_circle</span>
                            <span className="text-white font-medium">Imagem atualizada com sucesso!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;
