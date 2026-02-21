import { useState, useMemo } from 'react';
import { useStore, useEnabledPillars, useAppMode } from '@/stores/useStore';
import { MOCK_SENSEIS } from '@/data/mockData';
import { getDominantAura } from '@/lib/xp';
import { getUserTitle } from '@/lib/titles';
import { AuraAvatar } from '@/components/effects/AuraAvatar';
import { PillarCard } from '@/components/hud/PillarCard';
import { Dumbbell, Brain, Wallet, Heart, Calendar, Plus, Check, Zap, Play, Trash2 } from 'lucide-react';
import { WeeklyRecapModal } from '@/components/hud/WeeklyRecapModal';
import { TaskTimerModal } from '@/components/tasks/TaskTimerModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Pillar, CustomTask, calcXpFromDifficulty } from '@/types';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    Tooltip, ResponsiveContainer
} from 'recharts';

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
    const user = useStore(state => state.user);
    const enabledPillars = useEnabledPillars();
    const appMode = useAppMode();
    const completeDailyHabit = useStore(state => state.completeDailyHabit);
    const addDailyHabit = useStore(state => state.addDailyHabit);
    const deleteDailyHabit = useStore(state => state.deleteDailyHabit);
    const addCustomTask = useStore(state => state.addCustomTask);
    const completeCustomTask = useStore(state => state.completeCustomTask);
    const deleteCustomTask = useStore(state => state.deleteCustomTask);
    const [isRecapOpen, setIsRecapOpen] = useState(false);
    const [addingHabit, setAddingHabit] = useState(false);
    const [habitTitle, setHabitTitle] = useState('');
    const [habitDifficulty, setHabitDifficulty] = useState(3);
    const [addingTask, setAddingTask] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDifficulty, setTaskDifficulty] = useState(5);
    const [timerTask, setTimerTask] = useState<CustomTask | null>(null);

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

    const handleAddTask = () => {
        if (!taskTitle.trim()) return;
        addCustomTask(taskTitle.trim(), 'general', taskDifficulty);
        setTaskTitle('');
        setTaskDifficulty(5);
        setAddingTask(false);
    };

    const activeTasks = (user.customTasks || []).filter(t => t.status === 'active');
    const taskPreviewXp = calcXpFromDifficulty(taskDifficulty);

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

            {/* ── TASKS ONLY MODE: Quick Task Manager ──────────────── */}
            {appMode === 'tasks-only' && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-widest flex items-center">
                            <span className="w-2 h-2 rounded-full bg-neon-blue mr-3 shadow-[0_0_10px_#00f0ff]"></span>
                            Active Tasks ({activeTasks.length})
                        </h2>
                        <button onClick={() => setAddingTask(true)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center">
                            <Plus size={14} className="mr-1" /> New Task
                        </button>
                    </div>

                    {/* Add Task Form */}
                    <AnimatePresence>
                        {addingTask && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                                <div className="glass-panel p-4 border border-neon-blue/20 space-y-4">
                                    <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)}
                                        placeholder="e.g. Study for 1 hour" autoFocus
                                        className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-blue/50 outline-none transition-colors" />
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Difficulty</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-neon-blue font-black text-sm">{taskDifficulty}/10</span>
                                                <span className="text-zinc-600">→</span>
                                                <span className="text-neon-gold font-black text-sm flex items-center">
                                                    <Zap size={12} className="mr-0.5" /> {taskPreviewXp} XP
                                                </span>
                                            </div>
                                        </div>
                                        <input type="range" min={1} max={10} step={1} value={taskDifficulty}
                                            onChange={e => setTaskDifficulty(Number(e.target.value))} className="w-full accent-neon-blue" />
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => { setAddingTask(false); setTaskTitle(''); }}
                                            className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 font-bold uppercase text-xs tracking-widest hover:bg-white/5 transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={handleAddTask} disabled={!taskTitle.trim()}
                                            className="flex-1 py-2.5 rounded-xl bg-neon-blue text-black font-black uppercase text-xs tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors">
                                            Add Task
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Task List */}
                    <div className="space-y-3">
                        {activeTasks.length === 0 && !addingTask && (
                            <div className="text-center py-10 text-zinc-600 font-bold uppercase tracking-widest text-sm">
                                No active tasks. Add one to get started!
                            </div>
                        )}
                        {activeTasks.map(task => (
                            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 rounded-xl border bg-surface border-white/5">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: task.difficulty }).map((_, i) => (
                                                <span key={i} className="w-1.5 h-1.5 rounded-full bg-neon-gold"></span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-white font-bold truncate">{task.title}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <span className="text-neon-gold font-black text-xs flex items-center">
                                        <Zap size={12} className="mr-0.5" /> {task.xpReward}
                                    </span>
                                    <button onClick={() => setTimerTask(task)}
                                        className="w-9 h-9 rounded-lg bg-neon-blue/10 hover:bg-neon-blue/20 flex items-center justify-center text-neon-blue transition-colors">
                                        <Play size={16} />
                                    </button>
                                    <button onClick={() => completeCustomTask(task.id)}
                                        className="w-9 h-9 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 transition-colors">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => deleteCustomTask(task.id)}
                                        className="w-9 h-9 rounded-lg hover:bg-neon-pink/10 flex items-center justify-center text-zinc-600 hover:text-neon-pink transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

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
                {timerTask && (
                    <TaskTimerModal task={timerTask} onComplete={completeCustomTask} onClose={() => setTimerTask(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};
