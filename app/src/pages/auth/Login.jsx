import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { signIn, signUp, signInWithGoogle, signInWithApple, updateProfile } from '../../services/authApi';
import { uploadAvatar } from '../../services/uploadApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const COUNTRIES = [
    { code: 'BR', name: 'Brasil', lang: 'pt' },
    { code: 'US', name: 'United States', lang: 'en' },
    { code: 'ES', name: 'España', lang: 'es' },
    { code: 'MX', name: 'México', lang: 'es' },
    { code: 'PT', name: 'Portugal', lang: 'pt' },
    { code: 'GB', name: 'United Kingdom', lang: 'en' },
    // Add more as needed
];

const Login = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Form States
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [country, setCountry] = useState('BR');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Simple heuristic for default country based on timezone
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz.includes('Sao_Paulo') || tz.includes('Rio_Branco') || tz.includes('Fortaleza')) {
                setCountry('BR');
                i18n.changeLanguage('pt');
            } else if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago')) {
                setCountry('US');
                i18n.changeLanguage('en');
            } else if (tz.includes('Madrid')) {
                setCountry('ES');
                i18n.changeLanguage('es');
            } else if (tz.includes('London')) {
                setCountry('GB');
                i18n.changeLanguage('en');
            }
            // Let i18next detector handle the rest for language, but country needs explicit setting often.
        } catch (e) {
            console.log('Timezone detection failed', e);
        }
    }, [i18n]);

    const handleCountryChange = (e) => {
        const newCountryCode = e.target.value;
        setCountry(newCountryCode);

        // Auto-switch language based on country selection?
        const selectedC = COUNTRIES.find(c => c.code === newCountryCode);
        if (selectedC) {
            i18n.changeLanguage(selectedC.lang);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (activeTab === 'register') {
                // 1. Register User
                const { data: authData, error: authError } = await signUp(email, password, {
                    full_name: name,
                    country: country // Saving country to metadata
                });

                if (authError) throw authError;

                // 2. Upload Avatar (if logged in immediately)
                if (avatarFile && authData.user && authData.session) {
                    const { data: publicUrl, error: uploadError } = await uploadAvatar(authData.user.id, avatarFile);

                    if (uploadError) {
                        console.error("Avatar upload failed:", uploadError);
                        // Don't block registration, just warn or silent fail
                    } else if (publicUrl) {
                        // 3. Update Profile with Avatar URL
                        await updateProfile(authData.user.id, { avatar_url: publicUrl });
                    }
                }

                // Success - Redirect to Onboarding
                navigate('/onboarding');
            } else {
                // Login
                const { data, error } = await signIn(email, password);
                if (error) throw error;
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || t('auth_error', 'Erro ao realizar autenticação'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(err.message || 'Erro ao fazer login com Google');
        }
    };

    const handleAppleLogin = async () => {
        try {
            await signInWithApple();
        } catch (err) {
            setError(err.message || 'Erro ao fazer login com Apple');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden font-sans">
            {/* Background glow effect */}
            <div className="absolute top-0 left-0 w-full h-64 overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary blur-[100px] rounded-full" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-background-light dark:to-background-dark" />
            </div>

            {/* Language/Country Switcher Top Right */}
            <div className="absolute top-4 right-4 z-20">
                <select
                    value={country}
                    onChange={handleCountryChange}
                    className="bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg py-1 px-2 text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                >
                    {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="relative z-10 flex flex-col flex-1 px-6 pt-8 pb-6 justify-between max-w-md mx-auto w-full">
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-2 mb-6"
                >
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-2 shadow-glow-primary">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            directions_run
                        </span>
                    </div>
                    <h1 className="text-gray-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight text-center">
                        {t('app_name')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal text-center max-w-[280px]">
                        {t('login_title')}
                    </p>
                </motion.div>

                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col gap-6 w-full"
                >
                    {/* Tab Switcher */}
                    <div className="w-full">
                        <div className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-200 dark:bg-surface-dark p-1">
                            {['login', 'register'].map((tab) => (
                                <label
                                    key={tab}
                                    className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-all duration-200 ${activeTab === tab
                                        ? 'bg-white dark:bg-surface-dark-highlight shadow-sm'
                                        : ''
                                        }`}
                                >
                                    <span
                                        className={`truncate font-medium text-sm ${activeTab === tab
                                            ? 'text-primary'
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        {tab === 'login' ? t('login_button') : t('register_button')}
                                    </span>
                                    <input
                                        type="radio"
                                        name="auth-type"
                                        value={tab}
                                        checked={activeTab === tab}
                                        onChange={() => setActiveTab(tab)}
                                        className="hidden"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {/* Registration Extra Fields */}
                        <AnimatePresence>
                            {activeTab === 'register' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-col gap-4 overflow-hidden"
                                >
                                    {/* Avatar Upload */}
                                    <div className="flex justify-center mb-2">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative w-24 h-24 rounded-full bg-surface-dark border-2 border-dashed border-gray-600 hover:border-primary cursor-pointer flex items-center justify-center overflow-hidden group transition-colors"
                                        >
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-gray-500 text-3xl group-hover:text-primary transition-colors">
                                                    add_a_photo
                                                </span>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xs font-medium">Trocar</span>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>

                                    <Input
                                        label={t('full_name_label')}
                                        type="text"
                                        placeholder={t('full_name_placeholder')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        icon="person"
                                        required
                                    />

                                    {/* Country Selection Explicit in Form for Clarity */}
                                    <div>
                                        <label className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 ml-1 block">
                                            {t('country_label')}
                                        </label>
                                        <div className="flex h-14 w-full items-center gap-3 rounded-xl border border-gray-300 dark:border-border-green bg-white dark:bg-surface-dark px-4 focus-within:border-primary transition-colors">
                                            <span className="material-symbols-outlined text-gray-400 dark:text-[#94c7a8]">public</span>
                                            <select
                                                value={country}
                                                onChange={handleCountryChange}
                                                className="flex-1 bg-transparent text-gray-900 dark:text-white outline-none font-medium h-full cursor-pointer"
                                            >
                                                {COUNTRIES.map(c => (
                                                    <option key={c.code} value={c.code} className="bg-white dark:bg-gray-800">
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Input
                            label={t('email_label')}
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon="mail"
                            required
                        />

                        <div className="flex flex-col w-full">
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 ml-1">
                                {t('password_label')}
                            </span>
                            <div className="group flex w-full items-stretch rounded-xl border border-gray-300 dark:border-border-green bg-white dark:bg-surface-dark focus-within:border-primary transition-colors overflow-hidden h-14">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={t('password_placeholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex w-full min-w-0 flex-1 bg-transparent text-gray-900 dark:text-white outline-none px-4 text-base"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="px-4 text-gray-400 dark:text-[#94c7a8] hover:text-primary flex items-center"
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {activeTab === 'login' && (
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    {t('forgot_password')}
                                </Link>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={isLoading}
                            icon="arrow_forward"
                            iconPosition="right"
                            className="mt-2"
                        >
                            {activeTab === 'login' ? t('login_button') : t('register_button')}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-background-light dark:bg-background-dark text-gray-500 dark:text-gray-400">
                                {t('continue_with')}
                            </span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleAppleLogin}
                            className="flex items-center justify-center h-14 w-full sm:flex-1 rounded-xl bg-white dark:bg-white text-black border border-gray-300 dark:border-transparent hover:bg-gray-50 transition-colors gap-2 px-6"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                            </svg>
                            <span className="font-medium text-sm">Apple</span>
                        </button>

                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center h-14 w-full sm:flex-1 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white border border-gray-300 dark:border-border-green hover:bg-gray-50 dark:hover:bg-white/5 transition-colors gap-2 px-6"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span className="font-medium text-sm">Google</span>
                        </button>
                    </div>
                </motion.div>

                {/* Terms */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-auto pt-6 text-center"
                >
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('terms_text')}{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                            {t('terms_link')}
                        </Link>{' '}
                        e{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                            {t('privacy_link')}
                        </Link>
                        .
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
