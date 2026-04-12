import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNutritionCalendar, getNutritionStreak } from '../../services/nutritionApi';
import { useAuthStore } from '../../store/authStore';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function getCalColor(cal, target) {
    if (!cal || cal === 0) return 'bg-white/5';
    const ratio = cal / target;
    if (ratio < 0.5) return 'bg-yellow-500/30';       // undereating
    if (ratio >= 0.5 && ratio <= 0.85) return 'bg-blue-500/40';   // deficit (good for weight loss)
    if (ratio > 0.85 && ratio <= 1.1) return 'bg-green-500/50';   // on target
    return 'bg-orange-500/40';                          // surplus
}

function getCalBorder(cal, target) {
    if (!cal || cal === 0) return '';
    const ratio = cal / target;
    if (ratio >= 0.85 && ratio <= 1.1) return 'ring-1 ring-green-400/40';
    return '';
}

const NutritionCalendar = ({ calorieTarget = 2000, onDaySelect }) => {
    const { user } = useAuthStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarData, setCalendarData] = useState({});
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid = [];

        // Padding for days before the 1st
        for (let i = 0; i < firstDay; i++) grid.push(null);
        for (let d = 1; d <= daysInMonth; d++) grid.push(d);

        return grid;
    }, [year, month]);

    // Fetch data
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        Promise.all([
            getNutritionCalendar(monthKey),
            getNutritionStreak()
        ]).then(([calRes, streakRes]) => {
            setCalendarData(calRes.data || {});
            setStreak(streakRes.data?.streak || 0);
        }).finally(() => setLoading(false));
    }, [user, monthKey]);

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => {
        const now = new Date();
        if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth())) {
            setCurrentMonth(new Date(year, month + 1, 1));
        }
    };

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Monthly summary
    const monthSummary = useMemo(() => {
        const entries = Object.values(calendarData);
        if (entries.length === 0) return null;
        const total = entries.reduce((acc, d) => acc + (d.calories || 0), 0);
        const avg = Math.round(total / entries.length);
        const daysOnTarget = entries.filter(d => {
            const r = d.calories / calorieTarget;
            return r >= 0.85 && r <= 1.1;
        }).length;
        const totalProtein = entries.reduce((a, d) => a + (d.protein_g || 0), 0);
        const avgProtein = Math.round(totalProtein / entries.length);
        return { total, avg, daysOnTarget, daysLogged: entries.length, avgProtein };
    }, [calendarData, calorieTarget]);

    const handleDayClick = (day) => {
        if (!day) return;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const data = calendarData[dateStr];
        setSelectedDay(selectedDay === dateStr ? null : dateStr);
        if (onDaySelect) onDaySelect(dateStr, data);
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth}
                    className="p-2 rounded-lg bg-white/5 active:bg-white/10">
                    <span className="material-symbols-outlined text-white text-xl">chevron_left</span>
                </motion.button>

                <div className="text-center">
                    <h3 className="text-white font-bold text-lg">{MONTHS_PT[month]} {year}</h3>
                    {streak > 0 && (
                        <p className="text-xs text-green-400 mt-0.5">
                            <span className="inline-block mr-1">&#128293;</span>
                            {streak} {streak === 1 ? 'dia' : 'dias'} de sequencia
                        </p>
                    )}
                </div>

                <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth}
                    disabled={isCurrentMonth}
                    className="p-2 rounded-lg bg-white/5 active:bg-white/10 disabled:opacity-30">
                    <span className="material-symbols-outlined text-white text-xl">chevron_right</span>
                </motion.button>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map(w => (
                    <div key={w} className="text-center text-[10px] text-white/40 font-medium py-1">{w}</div>
                ))}
            </div>

            {/* Calendar grid */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <span className="animate-spin material-symbols-outlined text-white/40 text-3xl">progress_activity</span>
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => {
                        if (day === null) return <div key={`pad-${i}`} />;

                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const data = calendarData[dateStr];
                        const cal = data?.calories || 0;
                        const isToday = isCurrentMonth && day === today.getDate();
                        const isFuture = new Date(year, month, day) > today;
                        const isSelected = selectedDay === dateStr;
                        const color = isFuture ? 'bg-white/3' : getCalColor(cal, calorieTarget);
                        const border = isFuture ? '' : getCalBorder(cal, calorieTarget);

                        return (
                            <motion.button
                                key={dateStr}
                                whileTap={{ scale: 0.92 }}
                                onClick={() => !isFuture && handleDayClick(day)}
                                disabled={isFuture}
                                className={`
                                    relative aspect-square rounded-lg flex flex-col items-center justify-center
                                    transition-all ${color} ${border}
                                    ${isToday ? 'ring-2 ring-green-400' : ''}
                                    ${isSelected ? 'ring-2 ring-white' : ''}
                                    ${isFuture ? 'opacity-25' : 'active:scale-95'}
                                `}
                            >
                                <span className={`text-xs font-medium ${isToday ? 'text-green-400' : 'text-white/80'}`}>
                                    {day}
                                </span>
                                {cal > 0 && (
                                    <span className="text-[9px] text-white/60 leading-none mt-0.5">
                                        {cal >= 1000 ? `${(cal / 1000).toFixed(1)}k` : cal}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* Selected day detail */}
            <AnimatePresence>
                {selectedDay && calendarData[selectedDay] && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/5 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-white font-semibold text-sm">
                                    {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                                </span>
                                <span className="text-white/60 text-xs">
                                    {calendarData[selectedDay].meal_count} {calendarData[selectedDay].meal_count === 1 ? 'refeicao' : 'refeicoes'}
                                </span>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { label: 'Calorias', value: calendarData[selectedDay].calories, unit: 'kcal', color: 'text-orange-400' },
                                    { label: 'Proteina', value: calendarData[selectedDay].protein_g?.toFixed(1), unit: 'g', color: 'text-red-400' },
                                    { label: 'Carbs', value: calendarData[selectedDay].carbs_g?.toFixed(1), unit: 'g', color: 'text-yellow-400' },
                                    { label: 'Gordura', value: calendarData[selectedDay].fats_g?.toFixed(1), unit: 'g', color: 'text-blue-400' },
                                ].map((m, i) => (
                                    <div key={i} className="text-center">
                                        <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                                        <p className="text-[10px] text-white/40">{m.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Progress vs target */}
                            <div className="pt-1">
                                <div className="flex justify-between text-[10px] text-white/50 mb-1">
                                    <span>{calendarData[selectedDay].calories} / {calorieTarget} kcal</span>
                                    <span>{Math.round((calendarData[selectedDay].calories / calorieTarget) * 100)}%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (calendarData[selectedDay].calories / calorieTarget) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {calendarData[selectedDay].water_ml > 0 && (
                                <p className="text-xs text-blue-300/70 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">water_drop</span>
                                    {calendarData[selectedDay].water_ml}ml de agua
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Monthly summary */}
            {monthSummary && (
                <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white/70 text-xs font-semibold mb-2 uppercase tracking-wider">Resumo do mes</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <p className="text-white font-bold text-lg">{monthSummary.avg}</p>
                            <p className="text-white/40 text-[10px]">kcal/dia (media)</p>
                        </div>
                        <div className="text-center">
                            <p className="text-green-400 font-bold text-lg">{monthSummary.daysOnTarget}</p>
                            <p className="text-white/40 text-[10px]">dias na meta</p>
                        </div>
                        <div className="text-center">
                            <p className="text-white font-bold text-lg">{monthSummary.daysLogged}</p>
                            <p className="text-white/40 text-[10px]">dias registrados</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-white/40">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500/30" /> Pouco</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500/40" /> Deficit</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500/50" /> Na meta</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500/40" /> Acima</div>
            </div>
        </div>
    );
};

export default NutritionCalendar;
