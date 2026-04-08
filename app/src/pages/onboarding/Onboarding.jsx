import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { updateFitnessProfile } from '../../services/trainingApi';
import { ROUTES } from '../../constants';

// Imagens fitness reais do Unsplash (free)
const IMAGES = {
  gender:  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  age:     'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
  weight:  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  height:  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  goal:    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  days:    'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
};

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
  exit:  (dir) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0, transition: { duration: 0.18 } }),
};

const STEPS = ['gender', 'age', 'weight', 'height', 'fitness', 'goal', 'days'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUserProfile, completeOnboarding } = useAuthStore();
  const [step, setStep] = useState(0);
  const [dir, setDir]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    gender: '', age: '', weight: '', height: '',
    fitness_level: '', primary_goal: '', workout_days_per_week: '',
  });

  const total    = STEPS.length;
  const progress = ((step + 1) / total) * 100;
  const stepKey  = STEPS[step];

  function goNext() {
    if (step < total - 1) { setDir(1); setStep(s => s + 1); }
    else handleFinish();
  }
  function goBack() {
    if (step > 0) { setDir(-1); setStep(s => s - 1); }
  }
  function setField(key, value) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  // Só gender avança automático (3 opções, cabe fácil)
  // Fitness e goal têm 5 opções longas → mostram botão Continuar
  const autoAdvanceSteps = ['gender'];

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    try {
      await updateFitnessProfile(user.id, {
        age: Number(data.age),
        weight_kg: Number(data.weight),
        height_cm: Number(data.height),
        gender: data.gender,
        fitness_level: data.fitness_level,
        primary_goal: data.primary_goal,
        workout_days_per_week: Number(data.workout_days_per_week),
      });
      // Tenta salvar no banco, mas independente do resultado, marca em memória
      await updateUserProfile({ onboarding_completed: true }).catch(() => {});
      completeOnboarding(); // garante que o store está atualizado antes de navegar
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (e) {
      console.error(e);
      // Mesmo com erro, avança (para não travar o usuário)
      completeOnboarding();
      navigate(ROUTES.DASHBOARD, { replace: true });
    } finally {
      setSaving(false);
    }
  }

  const canNext = () => {
    if (stepKey === 'gender')  return !!data.gender;
    if (stepKey === 'age')     return data.age >= 10 && data.age <= 100;
    if (stepKey === 'weight')  return data.weight >= 20 && data.weight <= 300;
    if (stepKey === 'height')  return data.height >= 100 && data.height <= 250;
    if (stepKey === 'fitness') return !!data.fitness_level;
    if (stepKey === 'goal')    return !!data.primary_goal;
    if (stepKey === 'days')    return data.workout_days_per_week >= 1 && data.workout_days_per_week <= 7;
    return false;
  };

  const showButton = !autoAdvanceSteps.includes(stepKey);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col overflow-hidden">

      {/* Hero Image — menor nas telas com muitas opções */}
      <div className={`relative shrink-0 overflow-hidden ${['fitness','goal'].includes(stepKey) ? 'h-36' : 'h-52'}`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={stepKey}
            src={IMAGES[stepKey]}
            alt=""
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>
        {/* Gradient overlay bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-gray-950" />

        {/* Progress bar + back */}
        <div className="absolute top-0 left-0 right-0 px-5 pt-10 flex items-center gap-3">
          {step > 0 && (
            <button onClick={goBack} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          )}
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>
          <span className="text-white/70 text-xs font-medium w-8 text-right">{step + 1}/{total}</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col px-6 pt-5 pb-2 overflow-y-auto"
          >
            {stepKey === 'gender'  && <GenderStep  value={data.gender}                onChange={v => { setField('gender', v); setTimeout(goNext, 260); }} />}
            {stepKey === 'age'     && <AgeStep     value={data.age}                   onChange={v => setField('age', v)} />}
            {stepKey === 'weight'  && <WeightStep  value={data.weight}                onChange={v => setField('weight', v)} />}
            {stepKey === 'height'  && <HeightStep  value={data.height}                onChange={v => setField('height', v)} />}
            {stepKey === 'fitness' && <FitnessStep value={data.fitness_level}         onChange={v => setField('fitness_level', v)} />}
            {stepKey === 'goal'    && <GoalStep    value={data.primary_goal}          onChange={v => setField('primary_goal', v)} />}
            {stepKey === 'days'    && <DaysStep    value={data.workout_days_per_week} onChange={v => setField('workout_days_per_week', v)} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next Button — fixo no fundo, sempre visível */}
      {showButton && (
        <div className="px-6 pb-10 pt-3 shrink-0 bg-gray-950">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={goNext}
            disabled={!canNext() || saving}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              canNext() && !saving
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </span>
            ) : step === total - 1 ? '🚀 Começar agora' : 'Continuar'}
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ── GENDER ─────────────────────────────────────────────────────────────────
function GenderStep({ value, onChange }) {
  return (
    <div className="flex flex-col">
      <Heading emoji="👤" title="Qual é o seu sexo?" subtitle="Personaliza seus cálculos de treino e nutrição" />
      <div className="flex flex-col gap-3 mt-5">
        {[
          { key: 'male',   label: 'Masculino',         emoji: '♂️', color: 'from-blue-600 to-blue-500' },
          { key: 'female', label: 'Feminino',           emoji: '♀️', color: 'from-pink-600 to-rose-500' },
          { key: 'other',  label: 'Prefiro não dizer',  emoji: '⚧️', color: 'from-gray-600 to-gray-500' },
        ].map(opt => (
          <OptionCard key={opt.key} selected={value === opt.key} onClick={() => onChange(opt.key)} color={opt.color}>
            <span className="text-2xl">{opt.emoji}</span>
            <span className="font-semibold text-white text-base">{opt.label}</span>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

// ── AGE ────────────────────────────────────────────────────────────────────
function AgeStep({ value, onChange }) {
  return (
    <div className="flex flex-col">
      <Heading emoji="🎂" title="Quantos anos você tem?" subtitle="Sua idade calibra intensidade e recuperação" />
      <NumberInput value={value} onChange={onChange} unit="anos" min={10} max={100} placeholder="25" />
    </div>
  );
}

// ── WEIGHT ─────────────────────────────────────────────────────────────────
function WeightStep({ value, onChange }) {
  return (
    <div className="flex flex-col">
      <Heading emoji="⚖️" title="Qual é o seu peso?" subtitle="Usado para calcular calorias e carga ideal" />
      <NumberInput value={value} onChange={onChange} unit="kg" min={20} max={300} placeholder="70" step={0.5} />
    </div>
  );
}

// ── HEIGHT ─────────────────────────────────────────────────────────────────
function HeightStep({ value, onChange }) {
  return (
    <div className="flex flex-col">
      <Heading emoji="📏" title="Qual é a sua altura?" subtitle="Necessária para calcular seu IMC" />
      <NumberInput value={value} onChange={onChange} unit="cm" min={100} max={250} placeholder="170" />
    </div>
  );
}

// ── FITNESS ────────────────────────────────────────────────────────────────
function FitnessStep({ value, onChange }) {
  const opts = [
    { key: 'sedentary',    label: 'Sedentário',      desc: 'Quase não me movimento',         emoji: '🛋️', color: 'from-gray-700 to-gray-600' },
    { key: 'beginner',     label: 'Iniciante',        desc: 'Começo a me exercitar',           emoji: '🌱', color: 'from-green-800 to-green-700' },
    { key: 'intermediate', label: 'Intermediário',    desc: 'Me exercito regularmente',        emoji: '💪', color: 'from-blue-800 to-blue-700' },
    { key: 'advanced',     label: 'Avançado',         desc: 'Treino intenso e consistente',    emoji: '🔥', color: 'from-orange-800 to-orange-700' },
    { key: 'athlete',      label: 'Atleta',           desc: 'Treino como competidor',          emoji: '🏆', color: 'from-violet-800 to-violet-700' },
  ];
  return (
    <div className="flex flex-col">
      <Heading emoji="💡" title="Seu condicionamento atual?" subtitle="Sem julgamentos — seja honesto para um plano ideal" />
      <div className="flex flex-col gap-2.5 mt-4">
        {opts.map(opt => (
          <BigOptionCard key={opt.key} {...opt} selected={value === opt.key} onClick={() => onChange(opt.key)} />
        ))}
      </div>
    </div>
  );
}

// ── GOAL ───────────────────────────────────────────────────────────────────
function GoalStep({ value, onChange }) {
  const opts = [
    { key: 'weight_loss',  label: 'Emagrecer',       desc: 'Queimar gordura e perder peso',      emoji: '🔻', color: 'from-red-800 to-rose-700' },
    { key: 'muscle_gain',  label: 'Ganhar massa',     desc: 'Construir músculos e força',          emoji: '💪', color: 'from-blue-800 to-indigo-700' },
    { key: 'maintenance',  label: 'Manutenção',       desc: 'Manter o peso e saúde atual',         emoji: '⚖️', color: 'from-teal-800 to-cyan-700' },
    { key: 'health',       label: 'Saúde geral',      desc: 'Qualidade de vida e bem-estar',       emoji: '❤️', color: 'from-pink-800 to-rose-800' },
    { key: 'performance',  label: 'Performance',      desc: 'Melhorar resistência e velocidade',   emoji: '⚡', color: 'from-yellow-800 to-amber-700' },
  ];
  return (
    <div className="flex flex-col">
      <Heading emoji="🎯" title="Qual é o seu objetivo?" subtitle="Seu plano será 100% personalizado para isso" />
      <div className="flex flex-col gap-2.5 mt-4">
        {opts.map(opt => (
          <BigOptionCard key={opt.key} {...opt} selected={value === opt.key} onClick={() => onChange(opt.key)} />
        ))}
      </div>
    </div>
  );
}

// ── DAYS ───────────────────────────────────────────────────────────────────
function DaysStep({ value, onChange }) {
  const days   = [1,2,3,4,5,6,7];
  const labels = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  return (
    <div className="flex flex-col">
      <Heading emoji="📅" title="Dias de treino por semana?" subtitle="Vamos montar uma rotina que cabe na sua vida" />
      <div className="mt-6 flex flex-col items-center gap-5">
        <div className="flex gap-2 flex-wrap justify-center">
          {days.map(d => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.88 }}
              onClick={() => onChange(d)}
              className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all ${
                Number(value) === d
                  ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/40'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {d}
            </motion.button>
          ))}
        </div>

        {value >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gray-900 rounded-2xl p-4 border border-gray-800"
          >
            <p className="text-center text-gray-400 text-xs mb-3">Dias selecionados</p>
            <div className="flex gap-1 justify-center">
              {labels.map((lbl, i) => (
                <div
                  key={i}
                  className={`flex-1 h-9 rounded-xl flex items-center justify-center text-[10px] font-semibold transition-all ${
                    i < value
                      ? 'bg-gradient-to-b from-violet-500 to-fuchsia-600 text-white'
                      : 'bg-gray-800 text-gray-600'
                  }`}
                >
                  {lbl}
                </div>
              ))}
            </div>
            <p className="text-center text-violet-400 font-semibold text-sm mt-3">
              {value}x por semana
              {value >= 6 ? ' 🏆' : value >= 4 ? ' 🔥' : value >= 2 ? ' 💪' : ' 🌱'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── SHARED ─────────────────────────────────────────────────────────────────
function Heading({ emoji, title, subtitle }) {
  return (
    <div>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
        className="text-4xl mb-3"
      >
        {emoji}
      </motion.div>
      <motion.h1
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-white leading-tight"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-gray-400 text-sm mt-1.5"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

function OptionCard({ selected, onClick, color, children }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
        selected ? 'border-violet-500 bg-violet-500/15' : 'border-gray-800 bg-gray-900/60'
      }`}
    >
      {children}
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

function BigOptionCard({ key: _k, label, desc, emoji, color, selected, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
        selected ? 'border-violet-500 bg-violet-500/15' : 'border-gray-800 bg-gray-900/60'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shrink-0`}>
        {emoji}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-white text-sm">{label}</p>
        <p className="text-gray-400 text-xs mt-0.5 truncate">{desc}</p>
      </div>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

function NumberInput({ value, onChange, unit, min, max, placeholder, step = 1 }) {
  const num = Number(value) || Number(placeholder);
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="flex flex-col items-center mt-8 gap-5"
    >
      <div className="flex items-end gap-3">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className="w-36 text-center text-5xl font-bold bg-transparent text-white border-b-2 border-violet-500 pb-2 outline-none placeholder:text-gray-700 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-gray-400 text-xl mb-2">{unit}</span>
      </div>

      <div className="flex gap-4">
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => onChange(Math.max(min, num - step).toFixed(step < 1 ? 1 : 0))}
          className="w-14 h-14 rounded-2xl bg-gray-800 text-gray-200 text-2xl font-bold active:bg-gray-700">−</motion.button>
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => onChange(Math.min(max, num + step).toFixed(step < 1 ? 1 : 0))}
          className="w-14 h-14 rounded-2xl bg-gray-800 text-gray-200 text-2xl font-bold active:bg-gray-700">+</motion.button>
      </div>

      {value !== '' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium">
          {Number(value) < min || Number(value) > max
            ? <span className="text-red-400">⚠️ Valor entre {min} e {max} {unit}</span>
            : <span className="text-violet-400">✓ {value} {unit}</span>}
        </motion.p>
      )}
    </motion.div>
  );
}
