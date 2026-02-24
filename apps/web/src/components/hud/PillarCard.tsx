import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface PillarCardProps {
    title: string;
    level: number;
    xp: number;
    icon: LucideIcon;
    colorClass: string;
    bgGlowClass: string;
}

export const PillarCard: React.FC<PillarCardProps> = ({
    title, level, xp, icon: Icon, colorClass, bgGlowClass
}) => {
    // XP needed for the current level (total)
    const prevLevelXp = level > 1 ? 100 * Math.pow(level - 1, 1.5) : 0;
    const nextLevelXp = 100 * Math.pow(level, 1.5);

    const progress = Math.max(0, Math.min(100, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl glass-panel p-4 flex flex-col justify-between border border-white/5"
        >
            {/* Background Glow */}
            <div className={clsx("absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl", bgGlowClass)} />

            <div className="flex justify-between items-start mb-4 z-10 relative">
                <div className="flex items-center space-x-3">
                    <div className={clsx("p-2 rounded-xl bg-bg-dark border border-white/10", colorClass)}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold uppercase tracking-widest text-sm text-zinc-200">{title}</h3>
                        <p className="text-zinc-500 text-xs font-mono">Lv. {level}</p>
                    </div>
                </div>
            </div>

            {/* XP Bar */}
            <div className="z-10 relative">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className={colorClass}>{Math.floor(xp)} XP</span>
                    <span className="text-zinc-500">{Math.floor(nextLevelXp)} XP</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={clsx("h-full rounded-full shadow-[0_0_10px_currentColor]", bgGlowClass.replace('bg-', 'bg-').replace('text-glow-', 'bg-'))}
                    />
                </div>
            </div>
        </motion.div>
    );
};
