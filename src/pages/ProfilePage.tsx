import { useState } from 'react';
import { useStore, useEnabledPillars } from '@/stores/useStore';
import { useNavigate } from 'react-router-dom';
import { MOCK_SENSEIS } from '@/data/mockData';
import { getDominantAura } from '@/lib/xp';
import { getUserTitle } from '@/lib/titles';
import { AuraAvatar } from '@/components/effects/AuraAvatar';
import { Pillar, ALL_PILLARS, AppMode } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Brain, Wallet, Heart, Volume2, VolumeX, LogOut, AlertTriangle, Settings, Sliders } from 'lucide-react';
import clsx from 'clsx';

const PILLAR_INFO: Record<Pillar, { label: string; icon: typeof Dumbbell; color: string }> = {
    physical: { label: 'Physical', icon: Dumbbell, color: 'text-neon-pink' },
    mental: { label: 'Mental', icon: Brain, color: 'text-neon-blue' },
    wealth: { label: 'Wealth', icon: Wallet, color: 'text-neon-gold' },
    vitality: { label: 'Vitality', icon: Heart, color: 'text-emerald-400' }
};

const MODE_LABELS: Record<AppMode, string> = {
    'tasks-only': 'Task Master — Pure Tasks',
    'custom': 'Custom Path — 2 Pillars',
    'full': 'Full Warrior — All 4 Pillars'
};

export const ProfilePage = () => {
    const user = useStore(state => state.user);
    const logout = useStore(state => state.logout);
    const toggleSound = useStore(state => state.toggleSound);
    const soundEnabled = useStore(state => state.soundEnabled);
    const togglePillar = useStore(state => state.togglePillar);
    const setAppMode = useStore(state => state.setAppMode);
    const enabledPillars = useEnabledPillars();
    const navigate = useNavigate();

    const [confirmToggle, setConfirmToggle] = useState<Pillar | null>(null);
    const [confirmLogout, setConfirmLogout] = useState(false);

    if (!user) return null;

    const sensei = MOCK_SENSEIS.find(s => s.id === user.senseiId);
    const dominantAura = getDominantAura(user.pillarXp);
    const mode = user.settings?.appMode || 'full';

    const totalXp = Object.values(user.pillarXp).reduce((s, v) => s + v, 0);
    const workoutsCount = user.battleLog?.length || 0;
    const tasksCount = (user.customTasks || []).filter(t => t.status === 'completed').length;

    const handleTogglePillar = (pillar: Pillar) => {
        if (mode === 'tasks-only') return;
        if (enabledPillars.includes(pillar)) {
            setConfirmToggle(pillar);
        } else {
            if (mode === 'custom' && enabledPillars.length >= 2) return; // Max 2 in custom
            togglePillar(pillar);
        }
    };

    const confirmDisablePillar = () => {
        if (!confirmToggle) return;
        togglePillar(confirmToggle);
        setConfirmToggle(null);
    };

    const handleModeSwitch = (newMode: AppMode) => {
        if (newMode === 'tasks-only') {
            setAppMode('tasks-only');
        } else if (newMode === 'full') {
            setAppMode('full');
        } else {
            setAppMode('custom', enabledPillars.slice(0, 2));
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark pt-8 pb-24 px-6 md:px-12 max-w-2xl mx-auto">
            {/* Header */}
            <header className="flex flex-col items-center text-center mb-12">
                <AuraAvatar user={user} sensei={sensei || MOCK_SENSEIS[0]} dominantAura={dominantAura} size="lg" />
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">{user.displayName}</h1>
                    <p className={`mt-2 text-sm font-mono font-black tracking-widest ${dominantAura.color.replace('bg-', 'text-')} uppercase`}>
                        Lv. {user.globalLevel} — {getUserTitle(user.globalLevel, dominantAura.pillar)}
                    </p>
                </motion.div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-10">
                <div className="glass-panel p-4 text-center">
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-1">Total XP</p>
                    <p className="text-neon-gold font-black text-xl">{totalXp.toLocaleString()}</p>
                </div>
                <div className="glass-panel p-4 text-center">
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-1">Workouts</p>
                    <p className="text-neon-pink font-black text-xl">{workoutsCount}</p>
                </div>
                <div className="glass-panel p-4 text-center">
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-1">Tasks Done</p>
                    <p className="text-neon-blue font-black text-xl">{tasksCount}</p>
                </div>
            </div>

            {/* Settings */}
            <div className="space-y-8">

                {/* App Mode */}
                <section>
                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
                        <Settings size={16} className="mr-2" /> App Mode
                    </h2>
                    <div className="glass-panel p-1 rounded-xl flex">
                        {(['tasks-only', 'custom', 'full'] as AppMode[]).map(m => (
                            <button key={m} onClick={() => handleModeSwitch(m)}
                                className={clsx(
                                    "flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                                    mode === m ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                                )}>
                                {m === 'tasks-only' ? 'Tasks' : m === 'custom' ? 'Custom' : 'Full'}
                            </button>
                        ))}
                    </div>
                    <p className="text-zinc-600 text-xs mt-2 text-center">{MODE_LABELS[mode]}</p>
                </section>

                {/* Pillar Toggles */}
                {mode !== 'tasks-only' && (
                    <section>
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
                            <Sliders size={16} className="mr-2" /> Active Pillars
                            {mode === 'custom' && <span className="ml-2 text-neon-blue">(max 2)</span>}
                        </h2>
                        <div className="space-y-2">
                            {ALL_PILLARS.map(pillar => {
                                const info = PILLAR_INFO[pillar];
                                const Icon = info.icon;
                                const isEnabled = enabledPillars.includes(pillar);
                                const isDisabled = !isEnabled && mode === 'custom' && enabledPillars.length >= 2;
                                return (
                                    <button key={pillar} onClick={() => handleTogglePillar(pillar)}
                                        disabled={isDisabled}
                                        className={clsx(
                                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                                            isEnabled ? `glass-panel ${info.color}` : "bg-zinc-900/50 text-zinc-600 border-white/5",
                                            isDisabled && "opacity-30 cursor-not-allowed"
                                        )}>
                                        <div className="flex items-center gap-3">
                                            <Icon size={20} />
                                            <span className="font-bold uppercase tracking-widest text-sm">{info.label}</span>
                                        </div>
                                        <div className={clsx(
                                            "w-10 h-6 rounded-full relative transition-colors",
                                            isEnabled ? "bg-emerald-500" : "bg-zinc-800"
                                        )}>
                                            <motion.div
                                                className="w-4 h-4 rounded-full bg-white absolute top-1"
                                                animate={{ left: isEnabled ? 22 : 4 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Sound */}
                <section>
                    <button onClick={toggleSound}
                        className="w-full flex items-center justify-between p-4 rounded-xl glass-panel text-white">
                        <div className="flex items-center gap-3">
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="text-zinc-600" />}
                            <span className="font-bold uppercase tracking-widest text-sm">Sound Effects</span>
                        </div>
                        <div className={clsx("w-10 h-6 rounded-full relative transition-colors", soundEnabled ? "bg-emerald-500" : "bg-zinc-800")}>
                            <motion.div className="w-4 h-4 rounded-full bg-white absolute top-1"
                                animate={{ left: soundEnabled ? 22 : 4 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                        </div>
                    </button>
                </section>

                {/* Logout */}
                <section>
                    <button onClick={() => setConfirmLogout(true)}
                        className="w-full py-4 rounded-xl border-2 border-neon-pink/30 text-neon-pink font-bold uppercase tracking-widest hover:bg-neon-pink/10 transition-colors flex items-center justify-center gap-2">
                        <LogOut size={18} /> Logout & Reset
                    </button>
                </section>
            </div>

            {/* ── Confirm Disable Pillar Modal ──────────────────────── */}
            <AnimatePresence>
                {confirmToggle && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="glass-panel p-6 max-w-sm w-full text-center">
                            <AlertTriangle size={40} className="text-neon-gold mx-auto mb-4" />
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Disable {confirmToggle}?</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                This will hide the {confirmToggle} tab and remove it from your dashboard.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmToggle(null)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 font-bold uppercase text-xs tracking-widest hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={confirmDisablePillar}
                                    className="flex-1 py-3 rounded-xl bg-neon-pink text-white font-black uppercase text-xs tracking-widest hover:bg-neon-pink/80 transition-colors">
                                    Disable
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Confirm Logout Modal ──────────────────────────────── */}
            <AnimatePresence>
                {confirmLogout && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="glass-panel p-6 max-w-sm w-full text-center">
                            <LogOut size={40} className="text-neon-pink mx-auto mb-4" />
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Logout?</h3>
                            <p className="text-zinc-400 text-sm mb-6">This will reset all your progress. Are you sure?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmLogout(false)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 font-bold uppercase text-xs tracking-widest hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => { logout(); navigate('/auth'); }}
                                    className="flex-1 py-3 rounded-xl bg-neon-pink text-white font-black uppercase text-xs tracking-widest">
                                    Yes, Logout
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
