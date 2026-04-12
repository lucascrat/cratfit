import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchFoods, getPopularFoods, logMeal } from '../../services/nutritionApi';
import { useAuthStore } from '../../store/authStore';

const CATEGORY_LABELS = {
    grains: 'Cereais', proteins: 'Proteinas', dairy: 'Laticinios',
    fruits: 'Frutas', vegetables: 'Verduras', fats: 'Gorduras',
    beverages: 'Bebidas', sweets: 'Doces', prepared: 'Preparacoes',
    fast_food: 'Fast Food',
};
const CATEGORY_ICONS = {
    grains: 'rice_bowl', proteins: 'egg', dairy: 'local_cafe',
    fruits: 'nutrition', vegetables: 'eco', fats: 'water_drop',
    beverages: 'local_drink', sweets: 'cake', prepared: 'restaurant',
    fast_food: 'fastfood',
};

const FoodSearchModal = ({ isOpen, onClose, onFoodAdded }) => {
    const { user } = useAuthStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [popular, setPopular] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [portions, setPortions] = useState(1);
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    // Load popular foods on open
    useEffect(() => {
        if (isOpen && user) {
            getPopularFoods(12).then(r => {
                if (r.data?.length) setPopular(r.data);
            });
            setTimeout(() => inputRef.current?.focus(), 200);
        }
        if (!isOpen) {
            setQuery('');
            setResults([]);
            setSelectedFood(null);
            setPortions(1);
        }
    }, [isOpen, user]);

    // Debounced search
    const handleSearch = useCallback((q) => {
        setQuery(q);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (q.length < 2) { setResults([]); return; }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            const { data } = await searchFoods(q, 15);
            setResults(data || []);
            setLoading(false);
        }, 250);
    }, []);

    const getMealName = () => {
        const h = new Date().getHours();
        if (h < 11) return 'Cafe da Manha';
        if (h < 15) return 'Almoco';
        if (h < 18) return 'Lanche';
        return 'Jantar';
    };

    const handleAddFood = async (food) => {
        if (!user) return;
        setSaving(true);

        const mult = portions;
        const items = [{
            name: food.name,
            calories: Math.round(food.calories * mult),
            protein_g: parseFloat((food.protein_g * mult).toFixed(1)),
            carbs_g: parseFloat((food.carbs_g * mult).toFixed(1)),
            fats_g: parseFloat((food.fats_g * mult).toFixed(1)),
            fiber_g: parseFloat(((food.fiber_g || 0) * mult).toFixed(1)),
            portion_desc: mult === 1 ? food.serving_desc : `${mult}x ${food.serving_desc}`,
            food_id: food.id,
        }];

        const { error } = await logMeal(user.id, getMealName(), items);
        setSaving(false);

        if (!error) {
            setSelectedFood(null);
            setPortions(1);
            if (onFoodAdded) onFoodAdded();
            onClose();
        }
    };

    if (!isOpen) return null;

    const displayList = query.length >= 2 ? results : popular;
    const listTitle = query.length >= 2 ? `Resultados para "${query}"` : (popular.length > 0 ? 'Seus alimentos frequentes' : '');

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <div className="bg-background-dark pt-safe-top px-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3 mb-3">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="p-1">
                        <span className="material-symbols-outlined text-white">close</span>
                    </motion.button>
                    <h2 className="text-white font-bold text-lg flex-1">Buscar Alimento</h2>
                </div>

                {/* Search input */}
                <div className="relative">
                    <span className="material-symbols-outlined text-white/40 absolute left-3 top-1/2 -translate-y-1/2 text-xl">search</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Buscar alimento (ex: banana, frango...)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-green-500/50"
                    />
                    {loading && (
                        <span className="animate-spin material-symbols-outlined text-white/40 absolute right-3 top-1/2 -translate-y-1/2 text-xl">progress_activity</span>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-auto px-4 py-3">
                {listTitle && (
                    <p className="text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">{listTitle}</p>
                )}

                {displayList.length === 0 && query.length >= 2 && !loading && (
                    <div className="text-center py-10">
                        <span className="material-symbols-outlined text-white/20 text-5xl block mb-2">search_off</span>
                        <p className="text-white/40 text-sm">Nenhum alimento encontrado</p>
                        <p className="text-white/30 text-xs mt-1">Tente outro termo ou use a camera/texto para analisar com IA</p>
                    </div>
                )}

                {displayList.length === 0 && query.length < 2 && popular.length === 0 && (
                    <div className="text-center py-10">
                        <span className="material-symbols-outlined text-white/20 text-5xl block mb-2">restaurant</span>
                        <p className="text-white/40 text-sm">Digite para buscar alimentos</p>
                        <p className="text-white/30 text-xs mt-1">350+ alimentos com dados TACO/USDA</p>
                    </div>
                )}

                <div className="space-y-2">
                    {displayList.map(food => (
                        <motion.button
                            key={food.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setSelectedFood(food); setPortions(1); }}
                            className="w-full text-left bg-white/5 rounded-xl p-3 border border-white/5 active:bg-white/10 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-white/50 text-lg">
                                        {CATEGORY_ICONS[food.category] || 'restaurant'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{food.name}</p>
                                    <p className="text-white/40 text-xs">{food.serving_desc} | {CATEGORY_LABELS[food.category] || food.category}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-orange-400 font-bold text-sm">{Math.round(food.calories)}</p>
                                    <p className="text-white/30 text-[10px]">kcal</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-2 ml-13">
                                <span className="text-red-400/70 text-[10px]">P {food.protein_g}g</span>
                                <span className="text-yellow-400/70 text-[10px]">C {food.carbs_g}g</span>
                                <span className="text-blue-400/70 text-[10px]">G {food.fats_g}g</span>
                                {food.fiber_g > 0 && <span className="text-green-400/70 text-[10px]">F {food.fiber_g}g</span>}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Food detail / add modal */}
            <AnimatePresence>
                {selectedFood && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute bottom-0 left-0 right-0 bg-surface-dark rounded-t-3xl border-t border-white/10 p-4 pb-safe-bottom"
                    >
                        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

                        <h3 className="text-white font-bold text-lg mb-1">{selectedFood.name}</h3>
                        <p className="text-white/50 text-sm mb-4">{selectedFood.serving_desc} | {selectedFood.source || 'TACO'}</p>

                        {/* Macros grid */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[
                                { label: 'Calorias', value: Math.round(selectedFood.calories * portions), color: 'text-orange-400', unit: '' },
                                { label: 'Proteina', value: (selectedFood.protein_g * portions).toFixed(1), color: 'text-red-400', unit: 'g' },
                                { label: 'Carbs', value: (selectedFood.carbs_g * portions).toFixed(1), color: 'text-yellow-400', unit: 'g' },
                                { label: 'Gordura', value: (selectedFood.fats_g * portions).toFixed(1), color: 'text-blue-400', unit: 'g' },
                            ].map((m, i) => (
                                <div key={i} className="bg-white/5 rounded-lg p-2 text-center">
                                    <p className={`font-bold text-base ${m.color}`}>{m.value}{m.unit}</p>
                                    <p className="text-white/40 text-[10px]">{m.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Micros (if available) */}
                        {(selectedFood.sodium_mg > 0 || selectedFood.calcium_mg > 0 || selectedFood.iron_mg > 0) && (
                            <div className="flex gap-3 mb-4 text-[10px] text-white/40 flex-wrap">
                                {selectedFood.fiber_g > 0 && <span>Fibra: {(selectedFood.fiber_g * portions).toFixed(1)}g</span>}
                                {selectedFood.sugar_g > 0 && <span>Acucar: {(selectedFood.sugar_g * portions).toFixed(1)}g</span>}
                                {selectedFood.sodium_mg > 0 && <span>Sodio: {Math.round(selectedFood.sodium_mg * portions)}mg</span>}
                                {selectedFood.calcium_mg > 0 && <span>Calcio: {Math.round(selectedFood.calcium_mg * portions)}mg</span>}
                                {selectedFood.iron_mg > 0 && <span>Ferro: {(selectedFood.iron_mg * portions).toFixed(1)}mg</span>}
                                {selectedFood.potassium_mg > 0 && <span>Potassio: {Math.round(selectedFood.potassium_mg * portions)}mg</span>}
                                {selectedFood.vitamin_c_mg > 0 && <span>Vit C: {(selectedFood.vitamin_c_mg * portions).toFixed(1)}mg</span>}
                            </div>
                        )}

                        {/* Portions */}
                        <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 mb-4">
                            <span className="text-white/70 text-sm">Porcoes</span>
                            <div className="flex items-center gap-3">
                                <motion.button whileTap={{ scale: 0.9 }}
                                    onClick={() => setPortions(Math.max(0.5, portions - 0.5))}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-lg">remove</span>
                                </motion.button>
                                <span className="text-white font-bold text-lg w-8 text-center">{portions}</span>
                                <motion.button whileTap={{ scale: 0.9 }}
                                    onClick={() => setPortions(portions + 0.5)}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-lg">add</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <motion.button whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedFood(null)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium">
                                Cancelar
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }}
                                onClick={() => handleAddFood(selectedFood)}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? (
                                    <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">add</span>
                                        Adicionar
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FoodSearchModal;
