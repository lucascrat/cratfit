import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSponsors } from '../../services/sponsorApi';

const SponsorCarousel = () => {
    const [sponsors, setSponsors] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSponsors = async () => {
            const { data, error } = await getSponsors();
            if (data && data.length > 0) {
                setSponsors(data);
            } else {
                // Fallback / Mock se não houver no banco ainda
                setSponsors([
                    { id: 'm1', name: 'Corrida Crateús', image_url: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800&q=80' },
                    { id: 'm2', name: 'Suplementos VIP', image_url: 'https://images.unsplash.com/photo-1461896836934-bc06bc3ade47?w=1200&q=80' },
                    { id: 'm3', name: 'Arena Fitness', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80' }
                ]);
            }
            setLoading(false);
        };
        loadSponsors();
    }, []);

    useEffect(() => {
        if (sponsors.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % sponsors.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [sponsors]);

    if (loading) return (
        <div className="w-full h-44 bg-surface-dark/50 animate-pulse rounded-2xl mx-4 my-2 border border-white/5" />
    );

    if (sponsors.length === 0) return null;

    return (
        <div className="px-4 py-2 w-full max-w-2xl mx-auto">
            <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={sponsors[currentIndex]?.id || currentIndex}
                        initial={{ opacity: 0, scale: 1.1, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: -20 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="absolute inset-0"
                    >
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${sponsors[currentIndex].image_url})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Info Badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                    <div>
                        <span className="bg-primary/20 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-primary/30 mb-1 inline-block backdrop-blur-md">
                            Patrocinador
                        </span>
                        <h4 className="text-white font-bold text-lg drop-shadow-lg leading-tight">
                            {sponsors[currentIndex].name}
                        </h4>
                    </div>
                </div>

                {/* Indicators */}
                {sponsors.length > 1 && (
                    <div className="absolute top-4 right-4 flex gap-1 z-10">
                        {sponsors.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Decorative border glow */}
                <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none group-hover:border-primary/30 transition-colors duration-500" />
            </div>
        </div>
    );
};

export default SponsorCarousel;
