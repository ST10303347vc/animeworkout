import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/stores/useStore';
import { ACHIEVEMENTS } from '@/data/achievements';
import clsx from 'clsx';

export const AchievementToast = () => {
    const newlyUnlocked = useStore(state => state.newlyUnlocked);
    const clearNewlyUnlocked = useStore(state => state.clearNewlyUnlocked);
    const [queue, setQueue] = useState<typeof ACHIEVEMENTS>([]);
    const [currentToast, setCurrentToast] = useState<typeof ACHIEVEMENTS[0] | null>(null);

    useEffect(() => {
        if (newlyUnlocked.length > 0) {
            const newAchievements = newlyUnlocked.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean) as typeof ACHIEVEMENTS;
            setQueue(prev => [...prev, ...newAchievements]);
            clearNewlyUnlocked();
        }
    }, [newlyUnlocked, clearNewlyUnlocked]);

    useEffect(() => {
        if (!currentToast && queue.length > 0) {
            setCurrentToast(queue[0]);
            setQueue(prev => prev.slice(1));

            // Auto hide after 4 seconds
            setTimeout(() => {
                setCurrentToast(null);
            }, 4000);
        }
    }, [queue, currentToast]);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <AnimatePresence>
                {currentToast && (
                    <motion.div
                        key={currentToast.id}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="glass-panel px-6 py-4 flex items-center space-x-4 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] min-w-[320px]"
                    >
                        <div className={clsx("w-14 h-14 rounded-full flex items-center justify-center border-2 border-current bg-zinc-900", currentToast.color)}>
                            <currentToast.icon size={28} />
                        </div>
                        <div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-1">Achievement Unlocked</p>
                            <h4 className="text-white font-black text-lg">{currentToast.title}</h4>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
