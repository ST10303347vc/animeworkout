import { useState, useMemo } from 'react';
import { useStore, useEnabledPillars, useAppMode } from '@/stores/useStore';
import { MOCK_SENSEIS } from '@/data/mockData';
import { getDominantAura } from '@/lib/xp';
import { getUserTitle } from '@/lib/titles';
import { AuraAvatar } from '@/components/effects/AuraAvatar';
import { GlobalXpBar } from '@/components/hud/GlobalXpBar';
import { PillarCard } from '@/components/hud/PillarCard';
import { Dumbbell, Brain, Wallet, Heart, Calendar, Plus, Check, Crosshair, Target } from 'lucide-react';
import { WeeklyRecapModal } from '@/components/hud/WeeklyRecapModal';
import { TaskTimerModal } from '@/components/tasks/TaskTimerModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Pillar, CustomTask } from '@/types';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { clsx } from 'clsx';
import { CustomTaskCard } from '@/components/tasks/CustomTaskCard';


const PILLAR_META: Record<Pillar, { title: string; icon: typeof Dumbbell; color: string; bgGlow: string }> = {
    physical: { title: 'The Vanguard', icon: Dumbbell, color: 'text-neon-pink', bgGlow: 'bg-neon-pink text-glow-pink' },
    mental: { title: 'The Sage', icon: Brain, color: 'text-neon-blue', bgGlow: 'bg-neon-blue text-glow-blue' },
    wealth: { title: 'The Merchant', icon: Wallet, color: 'text-neon-gold', bgGlow: 'bg-neon-gold text-glow-gold' },
    vitality: { title: 'The Guardian', icon: Heart, color: 'text-emerald-400', bgGlow: 'bg-emerald-500 shadow-[0_0_10px_#10b981]' }
};

const PILLAR_BAR_COLORS: Record<Pillar, string> = {
    physical: '#ff0055',
    mental: '#00f0ff',
    wealth: '#ffcf00',
    vitality: '#10b981'
};

function getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
}

export const HubDashboard = () => {
    const { user, completeCustomTask, deleteCustomTask, completeTaskChapter } = useStore();
    const enabledPillars = useEnabledPillars();
    const appMode = useAppMode();
    const completeDailyHabit = useStore(state => state.completeDailyHabit);
    const addDailyHabit = useStore(state => state.addDailyHabit);
    const deleteDailyHabit = useStore(state => state.deleteDailyHabit);
    const [isRecapOpen, setIsRecapOpen] = useState(false);
    const [addingHabit, setAddingHabit] = useState(false);
    const [habitTitle, setHabitTitle] = useState('');
    const [habitDifficulty, setHabitDifficulty] = useState(3);
    const [view, setView] = useState<'active' | 'library'>('active');
    const [activeTimerTask, setActiveTimerTask] = useState<{ task: CustomTask, chapterId?: string } | null>(null);
    const [activeCompletionTask, setActiveCompletionTask] = useState<{ task: CustomTask, chapterId?: string } | null>(null);

    if (!user) return null;

    const sensei = MOCK_SENSEIS.find(s => s.id === user.senseiId);

    // Safely fallback if pillarXp is missing (e.g. during state migration/rehydration)
    const pillarXp = user.pillarXp || { physical: 0, mental: 0, wealth: 0, vitality: 0 };
    const dominantAura = getDominantAura(pillarXp);

    const pillars = enabledPillars.map(id => ({
        id,
        ...PILLAR_META[id],
        xp: pillarXp[id]
    }));

    // ── Radar / Bar data ───────────────────────────────────────────
    const pillarBalanceData = useMemo(() => {
        return enabledPillars.map(p => ({
            subject: p.charAt(0).toUpperCase() + p.slice(1),
            A: pillarXp[p],
            fullMark: Math.max(100, ...enabledPillars.map(ep => pillarXp[ep])) * 1.1
        }));
    }, [pillarXp, enabledPillars]);

    const showRadar = enabledPillars.length >= 3;
    const showBars = enabledPillars.length === 2;

    // ── Daily Habits ───────────────────────────────────────────────
    const dailyHabits = user.dailyHabits || [];
    const today = getTodayStr();
    const completedCount = dailyHabits.filter(h => h.lastCompletedDate === today).length;
    const totalHabits = dailyHabits.length;

    const handleAddHabit = () => {
        if (!habitTitle.trim()) return;
        addDailyHabit(habitTitle.trim(), 'general', habitDifficulty);
        setHabitTitle('');
        setHabitDifficulty(3);
        setAddingHabit(false);
    };

    const activeTasks = (user?.customTasks || []).filter(t => t.status === 'active');
    const libraryTasks = (user?.customTasks || []).filter(t => t.status === 'completed' && t.pillar === 'mental');

    return (
        <div className="min-h-screen bg-bg-dark pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto">

            {/* Header / Avatar Section */}
            <header className="flex flex-col items-center justify-center mb-12 text-center">
                <AuraAvatar user={user} sensei={sensei || MOCK_SENSEIS[0]} dominantAura={dominantAura} size="lg" />

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">{user.displayName}</h1>
                    <div className="flex items-center justify-center space-x-3 mt-2">
                        <span className="text-zinc-500 font-bold tracking-widest text-sm uppercase">Global Level</span>
                        <span className={`text-2xl font-black ${dominantAura.color.replace('bg-', 'text-')} drop-shadow-[0_0_10px_currentColor]`}>
                            {user.globalLevel}
                        </span>
                    </div>
                    {user.globalLevel >= 1 && (
                        <p className={`mt-2 text-sm font-mono font-black tracking-widest ${dominantAura.color.replace('bg-', 'text-')} opacity-90 uppercase`}>
                            {getUserTitle(user.globalLevel, dominantAura.pillar)}
                        </p>
                    )}

                    <button onClick={() => setIsRecapOpen(true)}
                        className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-300 transition-colors flex items-center mx-auto">
                        <Calendar className="mr-2" size={14} /> View Weekly Assessment
                    </button>
                </motion.div>
            </header>

            <GlobalXpBar />

            {/* ── TASKS ONLY MODE: Quick Task Manager ──────────────── */}
            {appMode === 'tasks-only' ? (
                <div className="space-y-8">
                    {/* Header & Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex bg-white/5 p-1 rounded-xl">
                            <button onClick={() => setView('active')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors", view === 'active' ? "bg-white text-black" : "text-zinc-500 hover:text-white")}>
                                Active Quests
                            </button>
                            <button onClick={() => setView('library')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors", view === 'library' ? "bg-neon-blue text-black" : "text-zinc-500 hover:text-white")}>
                                The Grimoire
                            </button>
                        </div>
                    </div>

                    {/* View Switching */}
                    {view === 'active' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {activeTasks.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5"
                                    >
                                        <Target size={48} className="mx-auto mb-4 text-zinc-600" />
                                        <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest mb-2">No Active Quests</h3>
                                        <p className="text-zinc-500">Forge a new path to begin earning XP.</p>
                                    </motion.div>
                                ) : (
                                    activeTasks.map(task => (
                                        <CustomTaskCard
                                            key={task.id}
                                            task={task}
                                            onComplete={(id) => {
                                                const t = activeTasks.find(t => t.id === id);
                                                if (t) setActiveCompletionTask({ task: t });
                                            }}
                                            onCompleteChapter={(taskId, chapterId) => {
                                                const t = activeTasks.find(t => t.id === taskId);
                                                if (t) setActiveCompletionTask({ task: t, chapterId });
                                            }}
                                            onStart={(t, chapterId) => setActiveTimerTask({ task: t, chapterId })}
                                            onDelete={(id) => deleteCustomTask(id)}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-neon-blue/5 border border-neon-blue/20 rounded-2xl">
                            <div className="col-span-full mb-4">
                                <h2 className="text-2xl font-black text-neon-blue uppercase tracking-widest glow-blue">The Library</h2>
                                <p className="text-zinc-400 italic font-serif">A repository of your completed wisdom.</p>
                            </div>

                            {libraryTasks.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-zinc-500 italic">
                                    Your library is empty. Complete Sage paths to fill these shelves.
                                </div>
                            ) : (
                                libraryTasks.map(task => (
                                    <motion.div key={task.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                        className="relative aspect-[3/4] bg-gradient-to-br from-zinc-800 to-black border-2 border-zinc-700/50 rounded-r-xl rounded-l-md shadow-2xl overflow-hidden group hover:border-neon-blue/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all cursor-pointer">

                                        {/* Book Spine Detail */}
                                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/60 border-r border-zinc-700/50 z-10 flex flex-col justify-between py-4 items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-neon-blue/50"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-neon-blue/50"></div>
                                        </div>

                                        {/* Content */}
                                        <div className="absolute inset-x-4 inset-y-4 p-4 border border-zinc-700/30 bg-zinc-900/50 rounded-sm flex flex-col items-center justify-center text-center">
                                            <div className="w-8 h-8 rounded-full border border-neon-blue/30 bg-neon-blue/10 flex items-center justify-center mb-4">
                                                <Crosshair size={14} className="text-neon-blue" />
                                            </div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-tight line-clamp-3 mb-2">
                                                {task.title}
                                            </h3>
                                            {task.tags && task.tags.length > 0 && (
                                                <span className="text-[10px] text-neon-blue tracking-widest uppercase">{task.tags[0]}</span>
                                            )}
                                        </div>

                                        {/* Hover Note Preview */}
                                        {task.notes && (
                                            <div className="absolute inset-0 bg-black/90 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center z-20">
                                                <p className="text-xs text-zinc-300 italic font-serif">"{task.notes}"</p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* The Four Pillars Grid (only if enabled) */}
                    {pillars.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-white mr-3"></span>
                                {pillars.length === 4 ? 'The Four Pillars' : `Active Pillars (${pillars.length})`}
                            </h2>
                            <div className={`grid grid-cols-1 ${pillars.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-4' : pillars.length === 2 ? 'md:grid-cols-2' : ''} gap-4`}>
                                {pillars.map((p, i) => {
                                    const pLevel = Math.floor(Math.pow(Math.max(0, p.xp) / 100, 1 / 1.5)) || 1;
                                    return (
                                        <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (i * 0.1) }}>
                                            <PillarCard title={p.title} level={pLevel} xp={p.xp} icon={p.icon} colorClass={p.color} bgGlowClass={p.bgGlow} />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Pillar Balance Visualization */}
                    {enabledPillars.length >= 2 && (
                        <div className="mb-12">
                            <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-neon-purple mr-3 shadow-[0_0_10px_rgba(188,19,254,0.8)]"></span>
                                Pillar Balance
                            </h2>

                            {showRadar && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                    className="glass-panel p-4 h-[280px] mx-auto max-w-md">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={pillarBalanceData}>
                                            <PolarGrid stroke="#ffffff20" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff80', fontSize: 11, fontWeight: 'bold' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                            <Radar name="XP" dataKey="A" stroke="#bc13fe" fill="#bc13fe" fillOpacity={0.4} strokeWidth={2} />
                                            <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #bc13fe', borderRadius: '8px' }}
                                                itemStyle={{ color: '#bc13fe', fontWeight: 'bold' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            {showBars && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                    className="glass-panel p-6 mx-auto max-w-md space-y-6">
                                    {enabledPillars.map(p => {
                                        const xp = pillarXp[p];
                                        const maxXp = Math.max(100, ...enabledPillars.map(ep => pillarXp[ep])) * 1.1;
                                        const pct = Math.min(100, (xp / maxXp) * 100);
                                        return (
                                            <div key={p}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold uppercase tracking-widest" style={{ color: PILLAR_BAR_COLORS[p] }}>
                                                        {p}
                                                    </span>
                                                    <span className="text-white font-black text-sm">{xp} XP</span>
                                                </div>
                                                <div className="h-4 bg-zinc-900 rounded-full overflow-hidden">
                                                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 }}
                                                        style={{ backgroundColor: PILLAR_BAR_COLORS[p], boxShadow: `0 0 12px ${PILLAR_BAR_COLORS[p]}60` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Daily Habits */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-widest flex items-center">
                        <span className="w-2 h-2 rounded-full bg-neon-gold mr-3 shadow-[0_0_10px_#ffaa00]"></span>
                        Daily Habits
                        {totalHabits > 0 && (
                            <span className="ml-3 text-neon-gold text-xs font-black">
                                {completedCount}/{totalHabits}
                            </span>
                        )}
                    </h2>
                    <button onClick={() => setAddingHabit(true)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center">
                        <Plus size={14} className="mr-1" /> Add
                    </button>
                </div>

                {/* Add Habit Form */}
                <AnimatePresence>
                    {addingHabit && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                            <div className="glass-panel p-4 border border-neon-gold/20 space-y-4">
                                <input type="text" value={habitTitle} onChange={e => setHabitTitle(e.target.value)}
                                    placeholder="e.g. Drink 2L of water" autoFocus
                                    className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-gold/50 outline-none transition-colors" />
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Difficulty</span>
                                        <span className="text-neon-gold font-black text-sm">{habitDifficulty}/10</span>
                                    </div>
                                    <input type="range" min={1} max={10} step={1} value={habitDifficulty}
                                        onChange={e => setHabitDifficulty(Number(e.target.value))} className="w-full accent-neon-gold" />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => { setAddingHabit(false); setHabitTitle(''); }}
                                        className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 font-bold uppercase text-xs tracking-widest hover:bg-white/5 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleAddHabit} disabled={!habitTitle.trim()}
                                        className="flex-1 py-2.5 rounded-xl bg-neon-gold text-black font-black uppercase text-xs tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors">
                                        Add Habit
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Habit List */}
                <div className="space-y-3">
                    {dailyHabits.length === 0 && !addingHabit && (
                        <div className="text-center py-10 text-zinc-600 font-bold uppercase tracking-widest text-sm">
                            No daily habits yet. Add your first one above.
                        </div>
                    )}
                    {dailyHabits.map(habit => {
                        const isDone = habit.lastCompletedDate === today;
                        return (
                            <motion.div key={habit.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDone ? 'bg-white/5 border-emerald-500/20' : 'bg-surface border-white/5'}`}>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button onClick={() => !isDone && completeDailyHabit(habit.id)}
                                        disabled={isDone}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/20 hover:border-neon-gold text-transparent hover:text-neon-gold'}`}>
                                        <Check size={16} />
                                    </button>
                                    <span className={`font-bold truncate ${isDone ? 'text-zinc-500 line-through' : 'text-white'}`}>
                                        {habit.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-3">
                                    <span className={`text-xs font-black tracking-widest ${isDone ? 'text-emerald-500' : 'text-neon-gold'}`}>
                                        +{habit.xpReward} XP
                                    </span>
                                    <button onClick={() => deleteDailyHabit(habit.id)}
                                        className="text-zinc-700 hover:text-neon-pink transition-colors text-xs font-bold">
                                        ✕
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Progress bar */}
                {totalHabits > 0 && (
                    <div className="mt-4">
                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-gradient-to-r from-neon-gold to-emerald-400 rounded-full"
                                animate={{ width: `${(completedCount / totalHabits) * 100}%` }}
                                transition={{ duration: 0.5 }} />
                        </div>
                    </div>
                )}
            </div>

            <WeeklyRecapModal isOpen={isRecapOpen} onClose={() => setIsRecapOpen(false)} />

            {/* Task Timer Modal */}
            <AnimatePresence>
                {activeTimerTask && (
                    <TaskTimerModal
                        task={activeTimerTask.task}
                        chapterId={activeTimerTask.chapterId}
                        onComplete={(taskId, chapId, notes) => completeCustomTask(taskId, chapId, notes)}
                        onClose={() => setActiveTimerTask(null)}
                    />
                )}
                {activeCompletionTask && (
                    <TaskTimerModal
                        task={activeCompletionTask.task}
                        chapterId={activeCompletionTask.chapterId}
                        initialPhase="done"
                        onComplete={(taskId, chapId, notes) => {
                            if (chapId) completeTaskChapter(taskId, chapId, undefined, notes);
                            else completeCustomTask(taskId, undefined, notes);
                        }}
                        onClose={() => setActiveCompletionTask(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
