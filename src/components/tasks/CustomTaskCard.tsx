import { CustomTask } from '@/types';
import { motion } from 'framer-motion';
import { Play, Check, Trash2, Zap } from 'lucide-react';
import clsx from 'clsx';

const PILLAR_COLORS: Record<string, string> = {
    physical: 'text-neon-pink border-neon-pink/30',
    mental: 'text-neon-blue border-neon-blue/30',
    wealth: 'text-neon-gold border-neon-gold/30',
    vitality: 'text-emerald-400 border-emerald-500/30',
    general: 'text-zinc-400 border-white/10'
};

interface Props {
    task: CustomTask;
    onComplete: (id: string) => void;
    onStart: (task: CustomTask) => void;
    onDelete: (id: string) => void;
}

export const CustomTaskCard = ({ task, onComplete, onStart, onDelete }: Props) => {
    const isCompleted = task.status === 'completed';
    const colors = PILLAR_COLORS[task.pillar] || PILLAR_COLORS.general;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "p-4 rounded-xl border transition-all",
                isCompleted ? "bg-white/5 border-emerald-500/20 opacity-60" : `bg-surface ${colors.split(' ')[1]}`
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={clsx("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", colors)}>
                            {task.pillar === 'general' ? 'General' : task.pillar}
                        </span>
                        <div className="flex gap-0.5">
                            {Array.from({ length: task.difficulty }).map((_, i) => (
                                <span key={i} className="w-1.5 h-1.5 rounded-full bg-neon-gold"></span>
                            ))}
                        </div>
                    </div>
                    <p className={clsx("font-bold truncate", isCompleted ? "text-zinc-500 line-through" : "text-white")}>
                        {task.title}
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className={clsx("text-xs font-black tracking-widest flex items-center", isCompleted ? "text-emerald-500" : "text-neon-gold")}>
                        <Zap size={12} className="mr-0.5" /> {task.xpReward}
                    </span>

                    {!isCompleted && (
                        <>
                            <button onClick={() => onStart(task)}
                                className="w-9 h-9 rounded-lg bg-neon-blue/10 hover:bg-neon-blue/20 flex items-center justify-center text-neon-blue transition-colors"
                                title="Start with timer">
                                <Play size={16} />
                            </button>
                            <button onClick={() => onComplete(task.id)}
                                className="w-9 h-9 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 transition-colors"
                                title="Complete now">
                                <Check size={16} />
                            </button>
                            <button onClick={() => onDelete(task.id)}
                                className="w-9 h-9 rounded-lg hover:bg-neon-pink/10 flex items-center justify-center text-zinc-600 hover:text-neon-pink transition-colors"
                                title="Delete">
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
