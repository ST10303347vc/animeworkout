import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { MOCK_SENSEIS } from '@/data/mockData';
import { AppMode, Pillar, ALL_PILLARS } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { ChevronRight, ListTodo, Sliders, Swords, Dumbbell, Brain, Wallet, Heart } from 'lucide-react';

const MODES: { mode: AppMode; senseiId: string; label: string; subtitle: string; icon: typeof ListTodo; description: string; color: string; glow: string }[] = [
    {
        mode: 'tasks-only',
        senseiId: 'sensei_1',
        label: 'Task Master',
        subtitle: 'Pure Productivity',
        icon: ListTodo,
        description: 'Focus on custom tasks only. No pillar system — just pure task completion with XP.',
        color: 'text-neon-gold',
        glow: 'border-neon-gold shadow-[0_0_30px_rgba(255,207,0,0.4)]'
    },
    {
        mode: 'custom',
        senseiId: 'sensei_2',
        label: 'Custom Path',
        subtitle: 'Choose Your Focus',
        icon: Sliders,
        description: 'Pick exactly 2 pillars to focus on. Custom tasks available everywhere.',
        color: 'text-neon-blue',
        glow: 'border-neon-blue shadow-[0_0_30px_rgba(0,240,255,0.4)]'
    },
    {
        mode: 'full',
        senseiId: 'sensei_3',
        label: 'Full Warrior',
        subtitle: 'All Four Pillars',
        icon: Swords,
        description: 'Train Physical, Mental, Wealth, and Vitality. The complete experience.',
        color: 'text-neon-pink',
        glow: 'border-neon-pink shadow-[0_0_30px_rgba(255,0,85,0.4)]'
    }
];

const PILLAR_OPTIONS: { pillar: Pillar; label: string; icon: typeof Dumbbell; color: string }[] = [
    { pillar: 'physical', label: 'Physical', icon: Dumbbell, color: 'text-neon-pink border-neon-pink bg-neon-pink/10' },
    { pillar: 'mental', label: 'Mental', icon: Brain, color: 'text-neon-blue border-neon-blue bg-neon-blue/10' },
    { pillar: 'wealth', label: 'Wealth', icon: Wallet, color: 'text-neon-gold border-neon-gold bg-neon-gold/10' },
    { pillar: 'vitality', label: 'Vitality', icon: Heart, color: 'text-emerald-400 border-emerald-400 bg-emerald-500/10' }
];

export const SelectSenseiPage = () => {
    const setSensei = useStore((state) => state.setSensei);
    const setAppMode = useStore((state) => state.setAppMode);
    const navigate = useNavigate();

    const [step, setStep] = useState<'mode' | 'pillars'>('mode');
    const [selectedMode, setSelectedMode] = useState<typeof MODES[0] | null>(null);
    const [selectedPillars, setSelectedPillars] = useState<Pillar[]>([]);

    const handleSelectMode = (modeConfig: typeof MODES[0]) => {
        setSelectedMode(modeConfig);
        if (modeConfig.mode === 'custom') {
            setStep('pillars');
        } else {
            setSensei(modeConfig.senseiId);
            setAppMode(modeConfig.mode, modeConfig.mode === 'full' ? [...ALL_PILLARS] : []);
            navigate('/hub');
        }
    };

    const handleTogglePillar = (pillar: Pillar) => {
        setSelectedPillars(prev => {
            if (prev.includes(pillar)) return prev.filter(p => p !== pillar);
            if (prev.length >= 2) return prev; // Max 2
            return [...prev, pillar];
        });
    };

    const handleConfirmPillars = () => {
        if (!selectedMode || selectedPillars.length !== 2) return;
        setSensei(selectedMode.senseiId);
        setAppMode('custom', selectedPillars);
        navigate('/hub');
    };

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
    const item = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } } };

    return (
        <div className="min-h-screen bg-bg-dark pt-16 pb-12 px-6">
            <div className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">

                    {/* ── STEP 1: CHOOSE MODE ─────────────── */}
                    {step === 'mode' && (
                        <motion.div key="mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="text-center mb-14">
                                <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className="text-5xl font-extrabold text-white mb-4 tracking-tight">
                                    CHOOSE YOUR PATH
                                </motion.h1>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                    className="text-zinc-400 text-lg max-w-2xl mx-auto">
                                    How do you want to use the app? You can always change this later in Settings.
                                </motion.p>
                            </div>

                            <motion.div variants={container} initial="hidden" animate="show"
                                className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {MODES.map((m) => {
                                    const Icon = m.icon;
                                    const sensei = MOCK_SENSEIS.find(s => s.id === m.senseiId);
                                    return (
                                        <motion.div key={m.mode} variants={item} whileHover={{ scale: 1.03, y: -8 }}
                                            className="relative group cursor-pointer" onClick={() => handleSelectMode(m)}>
                                            <div className={clsx("relative h-full glass-panel overflow-hidden border-2 border-transparent group-hover:border-white/20 flex flex-col pt-8 px-6 pb-6 transition-all bg-zinc-900/80")}>
                                                <div className="flex-1 flex flex-col items-center text-center">
                                                    <div className={clsx("w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2", m.glow)}>
                                                        <Icon size={36} className={m.color} />
                                                    </div>
                                                    <h3 className={clsx("text-2xl font-bold mb-1", m.color)}>{m.label}</h3>
                                                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-4">{m.subtitle}</p>
                                                    <p className="text-zinc-400 text-sm mb-6 flex-1">{m.description}</p>
                                                    {sensei && <p className="text-zinc-600 text-xs italic mb-4">Master: {sensei.name}</p>}
                                                    <div className="flex items-center justify-center space-x-2 text-white font-bold uppercase tracking-wider group-hover:text-neon-gold transition-colors">
                                                        <span>Select</span>
                                                        <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ── STEP 2: PICK 2 PILLARS ─────────── */}
                    {step === 'pillars' && (
                        <motion.div key="pillars" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className="max-w-lg mx-auto">
                            <button onClick={() => { setStep('mode'); setSelectedPillars([]); }}
                                className="text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs mb-8 block">
                                ← Back to modes
                            </button>
                            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight text-center">PICK 2 PILLARS</h1>
                            <p className="text-zinc-400 text-center mb-10">
                                Select exactly <span className="text-neon-blue font-black">2</span> areas to focus on. Tap to toggle.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                {PILLAR_OPTIONS.map(p => {
                                    const Icon = p.icon;
                                    const isSelected = selectedPillars.includes(p.pillar);
                                    const isDisabled = !isSelected && selectedPillars.length >= 2;
                                    return (
                                        <motion.button key={p.pillar} whileTap={{ scale: 0.95 }}
                                            onClick={() => handleTogglePillar(p.pillar)}
                                            disabled={isDisabled}
                                            className={clsx(
                                                "p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                                                isSelected ? p.color : "border-white/10 bg-zinc-900/50 text-zinc-500",
                                                isDisabled && "opacity-30 cursor-not-allowed"
                                            )}>
                                            <Icon size={32} />
                                            <span className="font-bold uppercase tracking-widest text-sm">{p.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <button onClick={handleConfirmPillars}
                                disabled={selectedPillars.length !== 2}
                                className={clsx(
                                    "w-full py-4 rounded-xl font-black uppercase tracking-widest text-lg transition-all",
                                    selectedPillars.length === 2
                                        ? "bg-white text-black hover:scale-[1.02] active:scale-95"
                                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                )}>
                                Confirm & Begin
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};
