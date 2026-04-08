import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Communities from './Communities';
import Explore from '../maps/Explore';
import TopAppBar from '../../components/common/TopAppBar';

const SocialHub = () => {
    const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'maps'

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <TopAppBar title="Social & Exploração" />

            {/* Custom Tab Selector */}
            <div className="px-4 py-2 sticky top-[64px] z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex bg-gray-100 dark:bg-surface-dark rounded-xl p-1 shadow-inner">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'feed'
                                ? 'bg-primary text-background-dark shadow-lg'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        <span className="material-symbols-outlined text-xl">groups</span>
                        Comunidade
                    </button>
                    <button
                        onClick={() => setActiveTab('maps')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'maps'
                                ? 'bg-primary text-background-dark shadow-lg'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        <span className="material-symbols-outlined text-xl">map</span>
                        Explorar Mapa
                    </button>
                </div>
            </div>

            <main className="flex-1 pb-20">
                <AnimatePresence mode="wait">
                    {activeTab === 'feed' ? (
                        <motion.div
                            key="feed"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Communities hideHeader={true} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="maps"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-[calc(100vh-180px)]"
                        >
                            <Explore hideHeader={true} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default SocialHub;
