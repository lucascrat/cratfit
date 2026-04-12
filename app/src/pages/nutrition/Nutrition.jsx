import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useFastingStore } from '../../store/fastingStore';
import { getDailyMeals, getNutritionGoals, saveWaterIntake, updateNutritionGoals } from '../../services/nutritionApi';
import { getFitnessProfile, updateFitnessProfile, getDailyWorkouts } from '../../services/trainingApi';
import { getMyActivities } from '../../services/activityApi';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FoodScanModal from '../../components/nutrition/FoodScanModal';
import FoodSuggestionModal from '../../components/nutrition/FoodSuggestionModal';

// Auto-calculate nutrition goals from fitness profile (Mifflin-St Jeor)
function calcGoalsFromProfile(profile) {
    const w = parseFloat(profile.weight_kg) || 70;
    const h = parseFloat(profile.height_cm) || 170;
    const a = profile.birth_date ? differenceInYears(new Date(), new Date(profile.birth_date)) : 25;
    const gender = profile.gender || 'male';
    const days = parseInt(profile.weekly_training_days) || 3;
    const goal = profile.primary_goal || 'maintenance';

    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += gender === 'female' ? -161 : 5;

    const mult = days <= 1 ? 1.2 : days <= 3 ? 1.375 : days <= 5 ? 1.55 : 1.725;
    const tdee = Math.round(bmr * mult);

    let calories = tdee;
    if (goal === 'weight_loss')  calories = Math.round(tdee * 0.80);
    if (goal === 'muscle_gain')  calories = Math.round(tdee * 1.10);

    const protein = Math.round(w * (goal === 'weight_loss' ? 2.4 : goal === 'muscle_gain' ? 2.2 : 1.8));
    const fats    = Math.round((calories * (goal === 'weight_loss' ? 0.25 : 0.30)) / 9);
    const carbs   = Math.max(50, Math.round((calories - protein * 4 - fats * 9) / 4));
    const water   = Math.round(w * 35) + (days >= 4 ? 500 : 0);

    return { daily_calories_target: calories, daily_protein_g: protein, daily_carbs_g: carbs, daily_fats_g: fats, water_target_ml: water };
}

const Nutrition = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { history: fastingHistory, isFasting, startTime: currentFastStart } = useFastingStore();

    // Data States
    const [profile, setProfile] = useState(null);
    const [meals, setMeals] = useState([]);
    const [activities, setActivities] = useState([]);
    const [gymWorkouts, setGymWorkouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Metrics States
    const [weight, setWeight] = useState(70);
    const [goals, setGoals] = useState({ calories: 2000, protein: 150, carbs: 200, fats: 60 });
    const [consumed, setConsumed] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
    const [burned, setBurned] = useState({ bmr: 0, active: 0, total: 0 });
    const [deficit, setDeficit] = useState(0);
    const [waterIntake, setWaterIntake] = useState(0); // Added Water Tracker State

    // UI States
    const [isScanOpen, setIsScanOpen] = useState(false);
    const [isSuggestOpen, setIsSuggestOpen] = useState(false); // Suggestion Modal State
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [newWeight, setNewWeight] = useState('');

    // Timer State
    const [timeUntilReset, setTimeUntilReset] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow - now;

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeUntilReset(`${h}h ${m}m ${s}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        if (!user) return;
        setIsLoading(true);

        const today = new Date();

        // Parallel Fetching
        const [mealsRes, goalsRes, profileRes, activitiesRes, gymRes] = await Promise.all([
            getDailyMeals(user.id, today),
            getNutritionGoals(user.id),
            getFitnessProfile(user.id),
            getMyActivities(user.id, 20),
            getDailyWorkouts(user.id, today)
        ]);

        // 1. Setup Profile & Physical Stats
        if (profileRes.data) {
            setProfile(profileRes.data);
            setWeight(profileRes.data.weight_kg || 70);
            setNewWeight(profileRes.data.weight_kg || 70);
        }

        // 2. Setup Goals — if no goals exist yet, auto-calculate from the profile
        if (goalsRes.data) {
            setGoals({
                calories: goalsRes.data.daily_calories_target || 2000,
                protein:  goalsRes.data.daily_protein_g       || 150,
                carbs:    goalsRes.data.daily_carbs_g         || 200,
                fats:     goalsRes.data.daily_fats_g          || 60,
            });
        } else if (profileRes.data) {
            // First time: auto-generate and save personalised goals from onboarding data
            const calculated = calcGoalsFromProfile(profileRes.data);
            setGoals({
                calories: calculated.daily_calories_target,
                protein:  calculated.daily_protein_g,
                carbs:    calculated.daily_carbs_g,
                fats:     calculated.daily_fats_g,
            });
            updateNutritionGoals(user.id, calculated).catch(console.error);
        }

        // 3. Process Meals (Consumed)
        let stats = { calories: 0, protein: 0, carbs: 0, fats: 0 };
        if (mealsRes.data) {
            setMeals(mealsRes.data);
            mealsRes.data.forEach(meal => {
                meal.meal_items.forEach(item => {
                    stats.calories += item.calories || 0;
                    stats.protein += item.protein_g || 0;
                    stats.carbs += item.carbs_g || 0;
                    stats.fats += item.fats_g || 0;
                });
            });
            setConsumed(stats);
        }

        // 4. Process Activities (Running)
        // Filter for today
        const todayActivities = (activitiesRes.data || []).filter(act =>
            new Date(act.created_at).toDateString() === today.toDateString()
        );
        setActivities(todayActivities);

        // 5. Process Gym Workouts
        if (gymRes.data) {
            setGymWorkouts(gymRes.data);
        } else {
            setGymWorkouts([]);
        }

        if (mealsRes.water) {
            setWaterIntake(mealsRes.water || 0);
        }

        setIsLoading(false);
    };

    // Save water when it changes (debounce could be used here for optimization, but for now simple effect)
    useEffect(() => {
        if (!user || isLoading) return; // Avoid saving during initial load
        const saveTimeout = setTimeout(() => {
            saveWaterIntake(user.id, waterIntake);
        }, 1000); // 1s debounce

        return () => clearTimeout(saveTimeout);
    }, [waterIntake, user]);

    // Recalculate Logic whenever relevant data changes
    useEffect(() => {
        if (!profile) return;

        // BMR Calculation (Mifflin-St Jeor)
        const age = profile.birth_date ? differenceInYears(new Date(), new Date(profile.birth_date)) : 30;
        const height = profile.height_cm || 170;
        const gender = profile.gender || 'male'; // Default male if unset

        let calculatedBMR = (10 * weight) + (6.25 * height) - (5 * age);
        calculatedBMR += gender === 'male' ? 5 : -161;

        // Base Metabolism (BMR * 1.2 for sedentary baseline before added exercise)
        const baseBurn = calculatedBMR * 1.2;

        // Active Burn Calculation
        let activeBurn = 0;

        // 1. From Recorded Activities (Running)
        activities.forEach(act => {
            let actCals = act.calories || 0;

            // Fasting Bonus Logic
            // Check if activity time intersected with a completed fast > 12h or current active fast > 12h
            const actTime = new Date(act.created_at).getTime();

            // Check completed fasts
            const fastedSession = fastingHistory.find(f =>
                actTime >= f.startTime && actTime <= f.endTime && (f.endTime - f.startTime > 12 * 3600 * 1000)
            );

            // Check current fast
            const isCurrentFasted = isFasting && currentFastStart &&
                (new Date().getTime() - currentFastStart > 12 * 3600 * 1000) &&
                actTime > currentFastStart;

            if (fastedSession || isCurrentFasted) {
                actCals *= 1.2; // 20% bonus for training in deep fasting
            }

            activeBurn += actCals;
        });

        // 2. From Gym Workouts
        gymWorkouts.forEach(workout => {
            let gymCals = workout.calories_burned || workout.calories || 0;
            // Apply same fasting bonus logic if needed, or assume gym workouts also benefit
            const actTime = new Date(workout.created_at).getTime();
            const fastedSession = fastingHistory.find(f =>
                actTime >= f.startTime && actTime <= f.endTime && (f.endTime - f.startTime > 12 * 3600 * 1000)
            );
            const isCurrentFasted = isFasting && currentFastStart &&
                (new Date().getTime() - currentFastStart > 12 * 3600 * 1000) &&
                actTime > currentFastStart;

            if (fastedSession || isCurrentFasted) {
                gymCals *= 1.2;
            }

            activeBurn += gymCals;
        });

        const totalBurn = baseBurn + activeBurn;

        setBurned({
            bmr: Math.round(baseBurn),
            active: Math.round(activeBurn),
            total: Math.round(totalBurn)
        });

        setDeficit(Math.round(totalBurn - consumed.calories));

    }, [profile, weight, activities, consumed, fastingHistory, isFasting, gymWorkouts]);

    useEffect(() => {
        loadData();
    }, [user]);

    const handleUpdateWeight = async () => {
        if (!user || !newWeight) return;
        const w = parseFloat(newWeight);
        if (isNaN(w)) return;

        const { error } = await updateFitnessProfile(user.id, { weight_kg: w });
        if (!error) {
            setWeight(w);
            setShowWeightModal(false);
            // Optionally update accumulated deficit logic here
        }
    };

    const calculateProgress = (current, target) => Math.min(100, (current / target) * 100);

    // 1kg Fat = 7700kcal
    // We assume 'accumulated_deficit_kcal' is stored in profile, but for now let's just show TODAY's contribution to that goal visually
    const deficitPercentage = Math.min(100, Math.max(0, (deficit / 7700) * 100));

    const handleSuggestionSelect = async (item) => {
        setIsSuggestOpen(false);
        // Add to meals
        console.log('Adicionando refeição...', item.name);

        const mealName = "Refeição Rápida"; // Could be customized based on time
        const items = [{
            name: item.name,
            calories: item.calories,
            protein: item.protein || 0,
            carbs: item.carbs || 0,
            fats: item.fats || 0,
            portion: '1 porção'
        }];

        const { error } = await logMeal(user.id, mealName, items);

        if (error) {
            alert('Erro ao salvar refeição.');
            console.error(error);
        } else {
            console.log(`${item.name} adicionado!`);
            loadData(); // Refresh
        }
    };

    return (
        <div className="pb-24 pt-8 px-6 min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-sans animate-in fade-in">
            {/* Header */}
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Balanço Energético</h1>
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {format(new Date(), "eeee, d 'de' MMMM", { locale: ptBR })}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md w-fit">
                            <span className="material-symbols-outlined text-[10px]">timer</span>
                            <span>Reseta em {timeUntilReset}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/nutrition/history')}
                        className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        title="Histórico Completo"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">calendar_month</span>
                    </button>

                    <div
                        onClick={() => setShowWeightModal(true)}
                        className="flex flex-col items-end cursor-pointer active:scale-95 transition-transform"
                    >
                        <span className="text-xs text-gray-400">Peso Atual</span>
                        <div className="flex items-center gap-1 text-[#13ec5b]">
                            <span className="text-xl font-bold">{weight}kg</span>
                            <span className="material-symbols-outlined text-sm">edit</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Balance Card */}
            <section className="mb-8">
                <div className="bg-white dark:bg-[#1c2e22] rounded-3xl p-6 shadow-md relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-center">
                            <div className="text-xs text-gray-400 uppercase mb-1">Queima Total</div>
                            <div className="text-xl font-bold text-orange-500 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                                {burned.total}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
                        <div className="text-center">
                            <div className="text-xs text-gray-400 uppercase mb-1">Ingestão</div>
                            <div className="text-xl font-bold text-blue-500 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-sm">restaurant</span>
                                {consumed.calories}
                            </div>
                        </div>
                    </div>

                    {/* Deficit/Surplus Indicator */}
                    <div className={`p-4 rounded-2xl ${deficit > 0 ? 'bg-green-500/10' : 'bg-red-500/10'} mb-4 text-center`}>
                        <div className="text-sm font-medium mb-1 dark:text-gray-200">
                            {deficit > 0 ? 'Déficit Calórico (Perdendo Peso)' : 'Superávit Calórico (Ganhando Peso)'}
                        </div>
                        <div className={`text-4xl font-black ${deficit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {deficit > 0 ? '-' : '+'}{Math.abs(deficit)} <span className="text-base font-normal text-gray-500">kcal</span>
                        </div>
                    </div>

                    {/* 1kg Fat Loss Goal Bar */}
                    {deficit > 0 && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progresso para perder 1kg</span>
                                <span>{Math.floor(deficit / 77)}g queimados hoje</span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 absolute left-0 top-0 transition-all duration-1000"
                                    style={{ width: `${deficitPercentage}%` }}
                                ></div>
                                {/* Markers every 25% */}
                                <div className="absolute inset-0 flex justify-between px-[25%] opacity-30">
                                    <div className="w-px h-full bg-white"></div>
                                    <div className="w-px h-full bg-white"></div>
                                    <div className="w-px h-full bg-white"></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 text-center">
                                Precisa de ~7700kcal de déficit para perder 1kg de gordura.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Breakdown */}
            <section className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white dark:bg-[#1c2e22] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-lg">ecg_heart</span>
                        <span className="text-xs font-bold uppercase">Basal (TMB)</span>
                    </div>
                    <div className="text-2xl font-bold">{burned.bmr}</div>
                    <div className="text-[10px] text-gray-400">Gasto em repouso</div>
                </div>
                <div className="bg-white dark:bg-[#1c2e22] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-2 text-orange-500">
                        <span className="material-symbols-outlined text-lg">directions_run</span>
                        <span className="text-xs font-bold uppercase">Ativo</span>
                    </div>
                    <div className="text-2xl font-bold">{burned.active}</div>
                    <div className="text-[10px] text-gray-400">Exercícios + Jejum + Academia</div>
                </div>
            </section>

            {/* Macros with Progress Bars */}
            <h3 className="text-lg font-bold mb-3">Macronutrientes</h3>
            <section className="grid grid-cols-3 gap-3 mb-8">
                {[
                    { label: 'Prot', current: consumed.protein, target: goals.protein, color: 'bg-blue-500' },
                    { label: 'Carb', current: consumed.carbs, target: goals.carbs, color: 'bg-orange-500' },
                    { label: 'Gord', current: consumed.fats, target: goals.fats, color: 'bg-yellow-500' }
                ].map((macro, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1c2e22] p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-medium text-gray-500">{macro.label}</span>
                            <span className="text-xs font-bold">{Math.min(100, Math.round((macro.current / macro.target) * 100))}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${macro.color} rounded-full transition-all duration-1000`}
                                style={{ width: `${Math.min(100, (macro.current / macro.target) * 100)}%` }}
                            />
                        </div>
                        <div className="mt-2 text-xs text-right text-gray-400">
                            {macro.current.toFixed(0)} / {macro.target}g
                        </div>
                    </div>
                ))}
            </section>

            {/* Water Tracker */}
            <section className="bg-white dark:bg-[#1c2e22] rounded-3xl p-6 shadow-md mb-8 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">water_drop</span>
                        Hidratação
                    </h3>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-blue-500">{waterIntake || 0}</span>
                        <span className="text-sm text-gray-500 font-medium"> / {Math.round(weight * 35)}ml</span>
                    </div>
                </div>

                <div className="relative h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
                    <div
                        className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (waterIntake / (weight * 35)) * 100)}%` }}
                    />
                    {/* Tick Marks */}
                    <div className="absolute inset-0 flex justify-between px-[25%] opacity-20">
                        <div className="w-px h-full bg-white" />
                        <div className="w-px h-full bg-white" />
                        <div className="w-px h-full bg-white" />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <button
                        onClick={() => setWaterIntake(prev => prev + 250)}
                        className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 active:scale-95 transition-all text-blue-600 dark:text-blue-400"
                    >
                        <span className="material-symbols-outlined">local_drink</span>
                        <span className="text-xs font-bold">+250ml</span>
                    </button>
                    <button
                        onClick={() => setWaterIntake(prev => prev + 500)}
                        className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 active:scale-95 transition-all text-blue-600 dark:text-blue-400"
                    >
                        <span className="material-symbols-outlined scale-110">water_bottle</span>
                        <span className="text-xs font-bold">+500ml</span>
                    </button>
                    <button
                        onClick={() => setWaterIntake(prev => Math.max(0, prev - 250))}
                        className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-400 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined">remove</span>
                        <span className="text-xs font-bold">-250ml</span>
                    </button>
                </div>
            </section>

            {/* Meals List */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Refeições de Hoje</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsSuggestOpen(true)}
                            className="bg-purple-500/10 text-purple-500 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-purple-500/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">lightbulb</span>
                            Sugestões
                        </button>
                        <button
                            onClick={() => setIsScanOpen(true)}
                            className="bg-[#13ec5b] text-[#0d1b12] font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-[#13ec5b]/20 flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Adicionar
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : meals.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-white dark:bg-[#1c2e22] rounded-2xl border-dashed border-2 border-gray-200 dark:border-gray-700">
                        <p>Nenhuma refeição registrada hoje.</p>
                        <button onClick={() => setIsScanOpen(true)} className="mt-4 text-primary font-bold text-sm">
                            Registrar Agora
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {meals.map((meal) => (
                            <div key={meal.id} className="bg-white dark:bg-[#1c2e22] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined icon-filled">restaurant</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{meal.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                            {meal.meal_items.map(i => i.name).join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold">
                                        {meal.meal_items.reduce((acc, i) => acc + (i.calories || 0), 0)}
                                    </span>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">kcal</span>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => setIsScanOpen(true)}
                            className="w-full py-4 mt-2 border-2 border-dashed border-gray-600/30 dark:border-gray-600 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            <span>Registrar mais alimentos</span>
                        </button>
                    </div>
                )}
            </section>

            {/* FAB */}
            <button
                onClick={() => setIsScanOpen(true)}
                className="fixed bottom-24 right-6 size-14 bg-[#13ec5b] text-[#0d1b12] rounded-full shadow-lg shadow-[#13ec5b]/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>

            <FoodScanModal
                isOpen={isScanOpen}
                onClose={() => setIsScanOpen(false)}
                onMealLogged={loadData}
            />

            <FoodSuggestionModal
                isOpen={isSuggestOpen}
                onClose={() => setIsSuggestOpen(false)}
                onSelect={handleSuggestionSelect}
            />

            {/* Weight Update Modal */}
            {showWeightModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-text-main dark:text-white">
                    <div className="bg-white dark:bg-[#1c2e22] w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                        <h3 className="font-bold text-lg mb-4">Atualizar Peso</h3>
                        <input
                            type="number"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            placeholder="Seu peso em kg"
                            className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 py-2 focus:border-[#13ec5b] focus:outline-none mb-6"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowWeightModal(false)}
                                className="flex-1 py-3 text-gray-500 font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateWeight}
                                className="flex-1 py-3 bg-[#13ec5b] text-[#0d1b12] font-bold rounded-xl"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Nutrition;
