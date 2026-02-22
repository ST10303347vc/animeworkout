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
    const addCustomTaskWithChapters = useStore(state => state.addCustomTaskWithChapters);
    const completeCustomTask = useStore(state => state.completeCustomTask);
    const completeTaskChapter = useStore(state => state.completeTaskChapter);
    const deleteCustomTask = useStore(state => state.deleteCustomTask);
    const config = PILLAR_CONFIG[pillar];

    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState(5);
    const [addingTask, setAddingTask] = useState(false);
    const [timerTask, setTimerTask] = useState<{ task: CustomTask, chapterId?: string } | null>(null);
    const [activeCompletionTask, setActiveCompletionTask] = useState<{ task: CustomTask, chapterId?: string } | null>(null);
    const [chapters, setChapters] = useState<{ id: string, title: string }[]>([]);

    const allTasks = (user?.customTasks || []).filter(t => t.pillar === pillar);
    const activeTasks = allTasks.filter(t => t.status === 'active');
    const completedTasks = allTasks.filter(t => t.status === 'completed');

    const previewXp = calcXpFromDifficulty(difficulty);
    const totalPreviewXp = previewXp + (chapters.length * 5); // +5 bonus per chapter

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (chapters.length > 0) {
            addCustomTaskWithChapters(title.trim(), pillar, difficulty, chapters);
        } else {
            addCustomTask(title.trim(), pillar, difficulty);
        }

        setTitle('');
        setDifficulty(5);
        setChapters([]);
        setAddingTask(false);
    };

    const handleAddChapter = () => {
        const nextNum = chapters.length + 1;
        setChapters([...chapters, { id: `chap-${Date.now()}`, title: `Chapter ${nextNum}` }]);
    };

    const handleChapterChange = (id: string, newTitle: string) => {
        setChapters(chapters.map(c => c.id === id ? { ...c, title: newTitle } : c));
    };

    const handleRemoveChapter = (id: string) => {
        setChapters(chapters.filter(c => c.id !== id));
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
                                        <Zap size={12} className="mr-0.5" />
                                        {chapters.length > 0 ? (
                                            <motion.span
                                                key={totalPreviewXp}
                                                initial={{ opacity: 0, scale: 0.5, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                className="inline-block"
                                            >
                                                {totalPreviewXp}
                                            </motion.span>
                                        ) : (
                                            previewXp
                                        )} XP
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

                        {/* Chapters Section (Mental Pillar specific or generally available) */}
                        {pillar === 'mental' && (
                            <div className="pt-2 border-t border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        Break it down
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddChapter}
                                        className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={10} /> Add Chapter (+5 XP)
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {chapters.map((chapter) => (
                                            <motion.div
                                                key={chapter.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    value={chapter.title}
                                                    onChange={(e) => handleChapterChange(chapter.id, e.target.value)}
                                                    className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-neon-blue/30 focus:text-white outline-none transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveChapter(chapter.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-neon-pink hover:bg-neon-pink/10 transition-colors shrink-0"
                                                >
                                                    <Plus size={14} className="rotate-45" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => { setAddingTask(false); setTitle(''); setChapters([]); }}
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
                            onComplete={() => setActiveCompletionTask({ task })}
                            onStart={(t, cId) => setTimerTask({ task: t, chapterId: cId })}
                            onDelete={deleteCustomTask}
                            onCompleteChapter={(_, chapterId) => setActiveCompletionTask({ task, chapterId })}
                        />
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
                                onComplete={() => { }} onStart={(t: CustomTask, cId?: string) => setTimerTask({ task: t, chapterId: cId })} onDelete={deleteCustomTask} onCompleteChapter={() => { }} />
                        ))}
                    </div>
                </div>
            )}

            {/* Timer Modal */}
            <AnimatePresence>
                {timerTask && (
                    <TaskTimerModal
                        task={timerTask.task}
                        chapterId={timerTask.chapterId}
                        onComplete={(taskId, chapterId, notes) => {
                            if (chapterId) {
                                completeTaskChapter(taskId, chapterId, undefined, notes);
                            } else {
                                completeCustomTask(taskId, undefined, notes);
                            }
                        }}
                        onClose={() => setTimerTask(null)}
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
