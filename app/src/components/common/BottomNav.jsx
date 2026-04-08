import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../constants';

const navItems = [
    { path: ROUTES.DASHBOARD, icon: 'home', label: 'Início' },
    { path: ROUTES.NUTRITION, icon: 'restaurant', label: 'Nutri' },
    { path: ROUTES.RECORD, icon: 'radio_button_checked', label: 'Gravar' },
    { path: ROUTES.FASTING, icon: 'timelapse', label: 'Jejum' },
    { path: ROUTES.PROFILE, icon: 'person', label: 'Perfil' },
];

const BottomNav = () => {
    const location = useLocation();

    // Esconde em páginas específicas
    const hiddenPaths = [ROUTES.LOGIN, ROUTES.TRACKING, ROUTES.ONBOARDING];
    if (hiddenPaths.some(path => location.pathname.startsWith(path))) {
        return null;
    }

    return (
        <>
            <nav className="fixed bottom-0 w-full bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-gray-200 dark:border-white/5 z-50 safe-bottom">
                <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const isRecord = item.path === ROUTES.RECORD;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isRecord ? '-mt-3' : ''
                                    }`}
                            >
                                {isRecord ? (
                                    // Special record button
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center justify-center size-12 bg-primary rounded-full shadow-lg shadow-primary/40 border-3 border-white dark:border-background-dark"
                                    >
                                        <span className="material-symbols-outlined text-background-dark text-2xl">
                                            {item.icon}
                                        </span>
                                    </motion.div>
                                ) : (
                                    <span
                                        className={`material-symbols-outlined text-xl ${isActive
                                            ? 'text-primary'
                                            : 'text-gray-400 dark:text-gray-500'
                                            } ${isActive ? 'filled' : ''}`}
                                    >
                                        {item.icon}
                                    </span>
                                )}
                                <span
                                    className={`text-[9px] font-medium leading-none ${isActive
                                        ? 'text-primary'
                                        : 'text-gray-400 dark:text-gray-500'
                                        } ${isRecord ? 'font-bold' : ''}`}
                                >
                                    {item.label}
                                </span>

                                {/* Active indicator */}
                                {isActive && !isRecord && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="absolute -top-px left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-b-full"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* Floating 'Dicas' Button */}
            <NavLink
                to={ROUTES.FEED}
                className="fixed bottom-20 right-4 z-40 bg-white dark:bg-background-dark/90 backdrop-blur border border-gray-200 dark:border-white/10 p-3 rounded-full shadow-xl shadow-black/10 flex flex-col items-center gap-1 group active:scale-95 transition-all"
            >
                <div className="size-10 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <span className="material-symbols-outlined text-white text-xl">smart_display</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Dicas</span>
            </NavLink>
        </>
    );
};

export default BottomNav;
