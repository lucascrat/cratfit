import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../constants';

const TopAppBar = ({
    title,
    showBack = false,
    showNotifications = false,
    showSettings = false,
    showMenu = false,
    rightAction = null,
    transparent = false,
    children,
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <header
            className={`sticky top-0 z-50 ${transparent
                ? 'bg-transparent'
                : 'bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5'
                }`}
        >
            <div className="flex items-center justify-between px-4 pt-12 pb-3">
                {/* Left side */}
                <div className="flex items-center gap-3">
                    {showBack && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBack}
                            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-900 dark:text-white">
                                arrow_back
                            </span>
                        </motion.button>
                    )}

                    {showMenu && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-900 dark:text-white">
                                menu
                            </span>
                        </motion.button>
                    )}
                </div>

                {/* Title */}
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                    {title}
                </h2>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {showNotifications && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="relative flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-900 dark:text-white">
                                notifications
                            </span>
                            {/* Notification badge */}
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full" />
                        </motion.button>
                    )}

                    {showSettings && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(ROUTES.SETTINGS)}
                            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-900 dark:text-white">
                                settings
                            </span>
                        </motion.button>
                    )}

                    {rightAction}
                </div>
            </div>

            {/* Additional content (search bar, tabs, etc.) */}
            {children}
        </header>
    );
};

export default TopAppBar;
