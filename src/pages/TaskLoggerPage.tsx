import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { Pillar, CustomTask, calcXpFromDifficulty } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Zap } from 'lucide-react';
import clsx from 'clsx';
import { CustomTaskCard } from '@/components/tasks/CustomTaskCard';
import { TaskTimerModal } from '@/components/tasks/TaskTimerModal';

interface Props {
    pillar: Pillar;
}

const PILLAR_CONFIG = {
    physical: { title: 'The Vanguard', color: 'text-neon-pink', border: 'border-neon-pink/30', placeholder: 'e.g. 30 min gym session' },
    mental: { title: 'The Sage', color: 'text-neon-blue', border: 'border-neon-blue/30', placeholder: 'e.g. Read 20 pages of philosophy' },
    wealth: { title: 'The Merchant', color: 'text-neon-gold', border: 'border-neon-gold/30', placeholder: 'e.g. 2 hours of deep work coding' },
    vitality: { title: 'The Guardian', color: 'text-emerald-400', border: 'border-emerald-500/30', placeholder: 'e.g. Meditated for 15 minutes' }
};

export const TaskLoggerPage = ({ pillar }: Props) => {
    const user = useStore(state => state.user);
    const addCustomTask = useStore(state => state.addCustomTask);
    const completeCustomTask = useStore(state => state.completeCustomTask);
    const deleteCustomTask = useStore(state => state.deleteCustomTask);
    const config = PILLAR_CONFIG[pillar];

    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState(5);
    const [addingTask, setAddingTask] = useState(false);
    const [timerTask, setTimerTask] = useState<CustomTask | null>(null);

    const allTasks = (user?.customTasks || []).filter(t => t.pillar === pillar);
    const activeTasks = allTasks.filter(t => t.status === 'active');
    const completedTasks = allTasks.filter(t => t.status === 'completed');

    const previewXp = calcXpFromDifficulty(difficulty);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        addCustomTask(title.trim(), pillar, difficulty);
        setTitle('');
        setDifficulty(5);
        setAddingTask(false);
    };

    return (
        <div className="min-h-screen bg-bg-dark pt-8 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
            <header className="mb-10">
                <h1 className={clsx("text-4xl font-black uppercase tracking-widest mb-2", config.color)}>
                    {config.title}
                </h1>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                    Add tasks. Set difficulty. Earn XP.
                </p>
            </header>

            {/* Add Task Button / Form */}
            {!addingTask ? (
                <button onClick={() => setAddingTask(true)}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 text-zinc-500 hover:text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all mb-8">
                    <Plus size={20} /> Add New Task
                </button>
            ) : (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={clsx("glass-panel p-6 rounded-2xl mb-8 border", config.border)}>
                    <form onSubmit={handleAddTask} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">What's the task?</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                                placeholder={config.placeholder} autoFocus
                                className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/30 outline-none transition-colors" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Difficulty</label>
                                <div className="flex items-center gap-2">
                                    <span className={clsx("font-black text-lg", config.color)}>{difficulty}/10</span>
                                    <span className="text-zinc-600 text-xs">→</span>
                                    <span className="text-neon-gold font-black text-sm flex items-center">
                                        <Zap size={12} className="mr-0.5" /> {previewXp} XP
                                    </span>
                                </div>
                            </div>
                            <input type="range" min={1} max={10} step={1} value={difficulty}
                                onChange={e => setDifficulty(Number(e.target.value))}
                                className="w-full accent-neon-gold" />
                            <div className="flex justify-between text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1">
                                <span>Easy</span><span>Medium</span><span>Hard</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => { setAddingTask(false); setTitle(''); }}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 font-bold uppercase text-xs tracking-widest hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={!title.trim()}
                                className={clsx(
                                    "flex-[2] py-3 rounded-xl font-black uppercase tracking-widest flex items-center justify-center transition-all",
                                    title.trim() ? "bg-white text-black hover:scale-[1.02] active:scale-95" : "bg-zinc-800 text-zinc-600"
                                )}>
                                <Plus size={18} className="mr-2" /> Add Task
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Active Tasks */}
            <div className="mb-10">
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
                    <span className={clsx("w-2 h-2 rounded-full mr-3", config.color.replace('text-', 'bg-'))}></span>
                    Active ({activeTasks.length})
                </h2>
                <div className="space-y-3">
                    {activeTasks.length === 0 && (
                        <div className="text-center py-8 text-zinc-700 font-bold uppercase tracking-widest text-xs">
                            No active tasks. Add one above.
                        </div>
                    )}
                    {activeTasks.map(task => (
                        <CustomTaskCard key={task.id} task={task}
                            onComplete={completeCustomTask}
                            onStart={setTimerTask}
                            onDelete={deleteCustomTask} />
                    ))}
                </div>
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center border-t border-white/5 pt-6">
                        <Search className="mr-3" size={16} /> Completed ({completedTasks.length})
                    </h2>
                    <div className="space-y-3">
                        {completedTasks.slice(0, 10).map(task => (
                            <CustomTaskCard key={task.id} task={task}
                                onComplete={() => { }} onStart={() => { }} onDelete={deleteCustomTask} />
                        ))}
                    </div>
                </div>
            )}

            {/* Timer Modal */}
            <AnimatePresence>
                {timerTask && (
                    <TaskTimerModal task={timerTask} onComplete={completeCustomTask} onClose={() => setTimerTask(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};
