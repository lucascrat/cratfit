import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthStore } from '../../store/authStore';
import { useFastingStore } from '../../store/fastingStore';
import { getMealsRange } from '../../services/nutritionApi';
import { getActivitiesRange } from '../../services/activityApi';
import { getWorkoutsRange, getFitnessProfile } from '../../services/trainingApi';

const NutritionHistory = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { history: fastingHistory } = useFastingStore();

    // States
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState({
        totalCaloriesIn: 0,
        totalCaloriesOut: 0,
        netBalance: 0,
        avgProteins: 0,
        avgCarbs: 0,
        avgFats: 0
    });

    // Load Data
    const loadMonthData = async () => {
        if (!user) return;
        setIsLoading(true);

        const start = startOfMonth(selectedMonth);
        const end = endOfMonth(selectedMonth);

        try {
            const [mealsRes, activeRes, gymRes] = await Promise.all([
                getMealsRange(user.id, start, end),
                getActivitiesRange(user.id, start, end),
                getWorkoutsRange(user.id, start, end)
            ]);

            // Filter fasting for this month (client side since it's local store)
            const monthFasts = fastingHistory.filter(f => {
                const fDate = new Date(f.endTime);
                return fDate >= start && fDate <= end;
            });

            // Process Daily Data
            const days = eachDayOfInterval({ start, end });
            const processedData = days.map(day => {
                const dayDate = day;

                // Get Meals for this day
                const dayMeals = (mealsRes.data || []).filter(m => isSameDay(new Date(m.date + 'T12:00:00'), dayDate)); // Fix timezone potential issue by using date string matching primarily, but Supabase returns YYYY-MM-DD
                // Better approach: filter by string match
                const dayString = format(dayDate, 'yyyy-MM-dd');
                const matchedMeals = (mealsRes.data || []).filter(m => m.date === dayString);

                // Get Activities
                const dayActivities = (activeRes.data || []).filter(a => isSameDay(new Date(a.created_at), dayDate));

                // Get Gym Workouts
                const dayWorkouts = (gymRes.data || []).filter(w => isSameDay(new Date(w.created_at), dayDate));

                // Get Fasts (completed on this day)
                const dayFasts = monthFasts.filter(f => isSameDay(new Date(f.endTime), dayDate));

                // Calculate Totals
                const caloriesIn = matchedMeals.reduce((acc, meal) => {
                    return acc + meal.meal_items.reduce((sum, item) => sum + (item.calories || 0), 0);
                }, 0);

                const macros = matchedMeals.reduce((acc, meal) => {
                    meal.meal_items.forEach(item => {
                        acc.p += item.protein_g || 0;
                        acc.c += item.carbs_g || 0;
                        acc.f += item.fats_g || 0;
                    });
                    return acc;
                }, { p: 0, c: 0, f: 0 });

                const caloriesOutRun = dayActivities.reduce((acc, act) => acc + (act.calories || 0), 0);
                const caloriesOutGym = dayWorkouts.reduce((acc, w) => acc + (w.calories_burned || 0), 0);
                const caloriesOutTotal = caloriesOutRun + caloriesOutGym; // Plus BMR later if we want detailed net, but usually "Active Calories" is what matters for "Out" display in history context

                return {
                    date: dayDate,
                    dayName: format(dayDate, 'EEEE', { locale: ptBR }),
                    dayNumber: format(dayDate, 'd'),
                    caloriesIn,
                    caloriesOut: caloriesOutTotal,
                    macros,
                    details: {
                        meals: matchedMeals,
                        runs: dayActivities,
                        gym: dayWorkouts,
                        fasts: dayFasts
                    }
                };
            });

            // Calculate Monthly Stats
            const totalIn = processedData.reduce((acc, d) => acc + d.caloriesIn, 0);
            const totalOutActive = processedData.reduce((acc, d) => acc + d.caloriesOut, 0);

            // Average Macros
            const daysWithFood = processedData.filter(d => d.caloriesIn > 0).length || 1;
            const totalMacros = processedData.reduce((acc, d) => ({
                p: acc.p + d.macros.p,
                c: acc.c + d.macros.c,
                f: acc.f + d.macros.f
            }), { p: 0, c: 0, f: 0 });

            setMonthlyStats({
                totalCaloriesIn: totalIn,
                totalCaloriesOut: totalOutActive, // This is active calories only
                netBalance: totalIn - totalOutActive, // Rough estimate
                avgProteins: Math.round(totalMacros.p / daysWithFood),
                avgCarbs: Math.round(totalMacros.c / daysWithFood),
                avgFats: Math.round(totalMacros.f / daysWithFood)
            });

            // Reverse to show newest first
            setMonthlyData(processedData.reverse());
            setIsLoading(false);

        } catch (error) {
            console.error('Error loading history:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMonthData();
    }, [selectedMonth, user]);

    const changeMonth = (delta) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedMonth(newDate);
    };

    return (
        <div className="pb-24 pt-8 px-6 min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-sans animate-in fade-in">
            {/* Header with Navigation */}
            <header className="mb-6 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold flex-1 text-center mr-8">Histórico Nutricional</h1>
            </header>

            {/* Month Selector */}
            <div className="flex items-center justify-between bg-white dark:bg-[#1c2e22] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-bold capitalize">
                        {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                </div>
                <button onClick={() => changeMonth(1)} disabled={selectedMonth > new Date()} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full disabled:opacity-30">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>

            {/* Monthly Summary Cards */}
            <section className="grid grid-cols-2 gap-4 mb-8">
                {/* Calories In */}
                <div className="bg-white dark:bg-[#1c2e22] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-blue-500">restaurant</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Ingerido</p>
                        <h3 className="text-2xl font-black text-blue-500">{monthlyStats.totalCaloriesIn.toLocaleString()} <span className="text-xs font-normal text-gray-400">kcal</span></h3>
                        <div className="mt-3 flex gap-2 text-[10px] text-gray-400">
                            <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">P: {monthlyStats.avgProteins}g</span>
                            <span className="bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded">C: {monthlyStats.avgCarbs}g</span>
                            <span className="bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded">G: {monthlyStats.avgFats}g</span>
                        </div>
                    </div>
                </div>

                {/* Calories Out */}
                <div className="bg-white dark:bg-[#1c2e22] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-orange-500">local_fire_department</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Gasto Ativo Total</p>
                        <h3 className="text-2xl font-black text-orange-500">{monthlyStats.totalCaloriesOut.toLocaleString()} <span className="text-xs font-normal text-gray-400">kcal</span></h3>
                        <p className="text-[10px] text-gray-400 mt-2">Corridas + Treinos</p>
                    </div>
                </div>
            </section>

            {/* Daily History List */}
            <section>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">calendar_month</span>
                    Diário Completo
                </h3>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-200 dark:bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {monthlyData.filter(d => d.caloriesIn > 0 || d.caloriesOut > 0 || d.details.fasts.length > 0).map((day) => (
                            <DayHistoryCard key={day.date.toISOString()} day={day} />
                        ))}

                        {monthlyData.filter(d => d.caloriesIn > 0 || d.caloriesOut > 0 || d.details.fasts.length > 0).length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                                <p>Nenhum registro encontrado neste período.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

// Subcomponent for efficient rendering and state management of each card
const DayHistoryCard = ({ day }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const netCalories = day.caloriesIn - day.caloriesOut;
    const isDeficit = netCalories < 0;

    return (
        <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-800">
            {/* Timeline Dot */}
            <div className={`absolute -left-[9px] top-6 size-4 rounded-full border-4 border-background-light dark:border-background-dark ${isDeficit ? 'bg-green-500' : 'bg-orange-500'}`} />

            <div className={`bg-white dark:bg-[#1c2e22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
                {/* Card Header (Clickable) */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors rounded-t-2xl"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">{day.dayName}</p>
                            <h4 className="text-lg font-bold flex items-center gap-2">
                                {format(day.date, "d 'de' MMMM", { locale: ptBR })}
                            </h4>
                        </div>
                        <div className="text-right">
                            <div className="flex flex-col items-end">
                                <span className={`text-sm font-bold ${isDeficit ? 'text-green-500' : 'text-orange-500'}`}>
                                    {isDeficit ? '-' : '+'}{Math.abs(netCalories)} kcal
                                </span>
                                <span className="text-[10px] text-gray-400">Saldo do dia</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-blue-500">restaurant</span>
                            <span className="font-bold text-gray-700 dark:text-gray-200">{day.caloriesIn}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-orange-500">local_fire_department</span>
                            <span className="font-bold text-gray-700 dark:text-gray-200">{day.caloriesOut}</span>
                        </div>
                        {day.details.fasts.length > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm text-cyan-500">timelapse</span>
                                <span className="font-bold text-cyan-500">Jejum OK</span>
                            </div>
                        )}
                        <span className="material-symbols-outlined text-gray-300 ml-auto transform transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            expand_more
                        </span>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700/50 animate-in slide-in-from-top-2 duration-200">

                        {/* Macronutrients Day Summary */}
                        {day.caloriesIn > 0 && (
                            <div className="py-4 grid grid-cols-3 gap-2">
                                <div className="bg-blue-500/10 p-2 rounded-lg text-center">
                                    <span className="block text-xs text-blue-500 font-bold uppercase">Prot</span>
                                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{day.macros.p.toFixed(0)}g</span>
                                </div>
                                <div className="bg-orange-500/10 p-2 rounded-lg text-center">
                                    <span className="block text-xs text-orange-500 font-bold uppercase">Carb</span>
                                    <span className="text-sm font-bold text-orange-700 dark:text-orange-300">{day.macros.c.toFixed(0)}g</span>
                                </div>
                                <div className="bg-yellow-500/10 p-2 rounded-lg text-center">
                                    <span className="block text-xs text-yellow-500 font-bold uppercase">Gord</span>
                                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{day.macros.f.toFixed(0)}g</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Meals List */}
                            {day.details.meals.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Refeições Realizadas</h5>
                                    <div className="space-y-2">
                                        {day.details.meals.map((meal, idx) => (
                                            <div key={idx} className="bg-gray-50 dark:bg-black/20 p-3 rounded-xl flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{meal.name}</p>
                                                    <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
                                                        {meal.meal_items.map((item, itemIdx) => (
                                                            <div key={itemIdx} className="flex items-center gap-1">
                                                                <span className="size-1 bg-gray-400 rounded-full"></span>
                                                                <span>{item.name} <span className="opacity-70">({item.amount}g)</span></span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-sm text-blue-500">
                                                        {meal.meal_items.reduce((s, i) => s + (i.calories || 0), 0)}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 ml-0.5">kcal</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Activities Log */}
                            {(day.details.runs.length > 0 || day.details.gym.length > 0) && (
                                <div>
                                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-2 mt-2">Atividades Físicas</h5>
                                    <div className="space-y-2">
                                        {day.details.runs.map((run, idx) => (
                                            <div key={`run-${idx}`} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 py-1 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-orange-500 text-base">directions_run</span>
                                                    <span>Corrida ({run.distance_km}km)</span>
                                                </div>
                                                <span className="font-bold text-orange-500">{run.calories} kcal</span>
                                            </div>
                                        ))}
                                        {day.details.gym.map((gym, idx) => (
                                            <div key={`gym-${idx}`} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 py-1 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-purple-500 text-base">fitness_center</span>
                                                    <span>{gym.training_plans?.title || 'Treino de Musculação'}</span>
                                                </div>
                                                <span className="font-bold text-purple-500">{gym.calories_burned || gym.calories} kcal</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NutritionHistory;
