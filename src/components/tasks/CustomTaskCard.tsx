import { CustomTask } from '@/types';
import { motion } from 'framer-motion';
import { Play, Check, Trash2, Zap } from 'lucide-react';
import React from 'react';
import { clsx } from 'clsx';

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
    onStart: (task: CustomTask, chapterId?: string) => void;
    onDelete: (id: string) => void;
    onCompleteChapter?: (taskId: string, chapterId: string) => void;
}

export const CustomTaskCard = ({ task, onComplete, onStart, onDelete, onCompleteChapter }: Props) => {
    const isCompleted = task.status === 'completed';
    const colors = PILLAR_COLORS[task.pillar] || PILLAR_COLORS.general;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "p-4 rounded-xl border transition-all",
                isCompleted ? "bg-white/5 border-emerald-500/20 opacity-60" : `bg - surface ${colors.split(' ')[1]} `
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

            {/* Main Task Notes */}
            {task.notes && (
                <div className="mt-4 p-3 bg-neon-blue/5 border-l-2 border-neon-blue text-sm italic text-zinc-300 font-serif">
                    "{task.notes}"
                </div>
            )}

            {/* Chapters Section (Constellation UI) */}
            {task.chapters && task.chapters.length > 0 && !isCompleted && (
                <div className="mt-4 pt-4 border-t border-white/5 pl-2">
                    <div className="relative border-l border-zinc-800 ml-3 pl-6 space-y-4">
                        {task.chapters.map((chapter) => (
                            <React.Fragment key={chapter.id}>
                                <div className="relative flex items-center justify-between group">
                                    {/* Timeline Node */}
                                    <div className={clsx(
                                        "absolute -left-[29px] w-3 h-3 rounded-full border-2 bg-bg-dark transition-colors duration-300",
                                        chapter.isCompleted ? "border-neon-blue bg-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.5)]" : "border-zinc-700"
                                    )}></div>

                                    <span className={clsx(
                                        "text-sm font-medium transition-colors",
                                        chapter.isCompleted ? "text-zinc-500 line-through" : "text-zinc-300"
                                    )}>
                                        {chapter.title}
                                    </span>

                                    {!chapter.isCompleted && (
                                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onStart(task, chapter.id)}
                                                className="w-7 h-7 rounded-md bg-neon-blue/10 hover:bg-neon-blue/20 flex items-center justify-center text-neon-blue transition-colors"
                                                title="Start chapter timer">
                                                <Play size={12} fill="currentColor" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onCompleteChapter) {
                                                        onCompleteChapter(task.id, chapter.id);
                                                    }
                                                }}
                                                className="w-7 h-7 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 transition-colors"
                                                title="Complete chapter">
                                                <Check size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Chapter Notes */}
                                {chapter.notes && (
                                    <div className="ml-2 mt-2 p-2 bg-neon-blue/5 border-l border-neon-blue/50 text-xs italic text-zinc-400 font-serif">
                                        "{chapter.notes}"
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};
