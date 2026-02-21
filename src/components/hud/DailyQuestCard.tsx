import { DailyQuest } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    quest: DailyQuest;
    onComplete: (id: string) => void;
}

export const DailyQuestCard: React.FC<Props> = ({ quest, onComplete }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={clsx(
                "flex items-center p-4 rounded-2xl border transition-all duration-300",
                quest.isCompleted
                    ? "bg-zinc-900/40 border-zinc-800/50 opacity-60"
                    : "bg-surface border-white/5 hover:border-white/10 hover:bg-surface-hover shadow-lg"
            )}
        >
            <button
                disabled={quest.isCompleted}
                onClick={() => onComplete(quest.id)}
                className="flex-shrink-0 mr-4 focus:outline-none"
            >
                <AnimatePresence mode="wait">
                    {quest.isCompleted ? (
                        <motion.div
                            key="checked"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-neon-green glow-green"
                        >
                            <CheckCircle2 size={28} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="unchecked"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-zinc-600 hover:text-white transition-colors"
                        >
                            <Circle size={28} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>

            <div className="flex-1">
                <p className={clsx(
                    "font-bold text-sm tracking-wide transition-colors",
                    quest.isCompleted ? "text-zinc-500 line-through" : "text-white"
                )}>
                    {quest.questDescription}
                </p>
            </div>

            <div className="flex-shrink-0 ml-4">
                <span className={clsx(
                    "px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase",
                    quest.isCompleted
                        ? "bg-zinc-800 text-zinc-600"
                        : "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                )}>
                    +{quest.xpReward} XP
                </span>
            </div>
        </motion.div>
    );
};
