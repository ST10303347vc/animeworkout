import { DailyQuest } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Dumbbell, Brain, Wallet, Heart } from 'lucide-react';
import clsx from 'clsx';

const PILLAR_CONFIG = {
    physical: { icon: Dumbbell, color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/20' },
    mental: { icon: Brain, color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/20' },
    wealth: { icon: Wallet, color: 'text-neon-gold', bg: 'bg-neon-gold/10', border: 'border-neon-gold/20' },
    vitality: { icon: Heart, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
};

interface Props {
    quest: DailyQuest;
    onComplete: (id: string) => void;
}

export const DailyQuestCard: React.FC<Props> = ({ quest, onComplete }) => {
    const config = PILLAR_CONFIG[quest.pillar];
    const bgClass = quest.isCompleted ? "bg-zinc-800" : config.bg;
    const textClass = quest.isCompleted ? "text-zinc-600" : config.color;
    const borderClass = quest.isCompleted ? "border-transparent" : config.border;

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
                            className={clsx("transition-colors flex items-center justify-center relative", config.color)}
                        >
                            <Circle size={28} className="opacity-50" />
                            <config.icon size={14} className="absolute" />
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">{quest.pillar}</p>
            </div>

            <div className="flex-shrink-0 ml-4">
                <span className={clsx(
                    "px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border",
                    bgClass, textClass, borderClass
                )}>
                    +{quest.xpReward} XP
                </span>
            </div>
        </motion.div>
    );
};
