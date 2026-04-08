import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ANILHAS = [
    { weight: 25, color: '#FF0000', label: '25kg', textColor: 'white' },
    { weight: 20, color: '#0000FF', label: '20kg', textColor: 'white' },
    { weight: 15, color: '#FFFF00', label: '15kg', textColor: 'black' },
    { weight: 10, color: '#008000', label: '10kg', textColor: 'white' },
    { weight: 5, color: '#FFFFFF', label: '5kg', textColor: 'black' },
    { weight: 2.5, color: '#000000', label: '2.5kg', textColor: 'white' },
    { weight: 1.25, color: '#888888', label: '1.25kg', textColor: 'white' },
];

const PlateCalculatorModal = ({ isOpen, onClose, targetWeight = 0, barWeight = 20 }) => {
    const [weight, setWeight] = useState(targetWeight || 0);
    const [bar, setBar] = useState(barWeight);
    const [plates, setPlates] = useState([]);

    const calculatePlates = () => {
        let remaining = (weight - bar) / 2; // Per side
        if (remaining <= 0) {
            setPlates([]);
            return;
        }

        const calculated = [];
        // Sort descending just in case
        const sortedAnilhas = [...ANILHAS].sort((a, b) => b.weight - a.weight);

        sortedAnilhas.forEach(anil => {
            while (remaining >= anil.weight) {
                // Deep copy to allow duplicate objects in array if needed for rendering specific styles
                calculated.push({ ...anil });
                remaining -= anil.weight;
            }
        });
        setPlates(calculated);
    };

    useEffect(() => {
        if (isOpen && targetWeight > 0) {
            setWeight(targetWeight);
        }
    }, [isOpen, targetWeight]);

    useEffect(() => {
        calculatePlates();
    }, [weight, bar]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#1c1c1e] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-white text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-500">fitness_center</span>
                            Calculadora de Anilhas
                        </h2>
                        <button onClick={onClose} className="p-2 -mr-2 text-white/50 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-white/50 text-xs uppercase font-bold mb-1 block">Peso Total (kg)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-2xl font-bold focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-white/50 text-xs uppercase font-bold mb-1 block">Barra (kg)</label>
                            <select
                                value={bar}
                                onChange={(e) => setBar(parseFloat(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none appearance-none"
                            >
                                <option value={20}>20kg (Olimpíca)</option>
                                <option value={15}>15kg (Média)</option>
                                <option value={12}>12kg (W)</option>
                                <option value={10}>10kg (Curta)</option>
                                <option value={0}>0kg (Máquina)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 mb-6 min-h-[120px] flex items-center justify-center relative overflow-hidden">
                        {/* Bar Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-4 bg-gray-600 -translate-y-1/2 rounded-full" />

                        {/* Plates Visual */}
                        <div className="relative z-10 flex items-center gap-1">
                            {plates.length === 0 ? (
                                <p className="text-white/30 text-sm font-medium">Digite o peso total para calcular</p>
                            ) : (
                                plates.map((plate, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ scale: 0, x: -20 }}
                                        animate={{ scale: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="h-24 w-6 rounded-md border border-black/20 shadow-lg flex items-center justify-center"
                                        style={{
                                            backgroundColor: plate.color,
                                            height: `${Math.max(60, plate.weight * 5)}px` // Dynamic height
                                        }}
                                        title={`${plate.weight}kg`}
                                    >
                                        <span
                                            className="text-[10px] font-bold -rotate-90 whitespace-nowrap"
                                            style={{ color: plate.textColor }}
                                        >
                                            {plate.label}
                                        </span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {plates.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-4">
                            <h3 className="text-white/70 text-sm font-bold mb-2 uppercase">Colocar de <span className="text-yellow-500">CADA LADO</span>:</h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(plates.reduce((acc, curr) => {
                                    acc[curr.label] = (acc[curr.label] || 0) + 1;
                                    return acc;
                                }, {})).map(([label, count]) => (
                                    <div key={label} className="bg-white/10 px-3 py-1 rounded-lg text-white text-sm">
                                        <span className="font-bold text-yellow-500">{count}x</span> {label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PlateCalculatorModal;
