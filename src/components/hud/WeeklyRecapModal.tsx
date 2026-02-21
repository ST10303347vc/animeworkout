import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/stores/useStore';
import { X, Calendar, TrendingUp, Award } from 'lucide-react';
import { useMemo } from 'react';
import clsx from 'clsx';
import { soundFx } from '@/utils/sound';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const WeeklyRecapModal = ({ isOpen, onClose }: Props) => {
    const user = useStore(state => state.user);

    const stats = useMemo(() => {
        if (!user) return { totalXp: 0, tasks: 0, workouts: 0, bestPillar: 'physical' };

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Filter last 7 days
        const recentTasks = (user.taskLog || []).filter(t => t.completedAt && new Date(t.completedAt) > oneWeekAgo);
        const recentWorkouts = (user.battleLog || []).filter(w => new Date(w.date) > oneWeekAgo);

        let totalXp = 0;
        const pillarHits: Record<string, number> = { physical: 0, mental: 0, wealth: 0, vitality: 0 };

        recentTasks.forEach(t => {
            totalXp += t.xpReward;
            pillarHits[t.pillar] = (pillarHits[t.pillar] || 0) + t.xpReward;
        });

        recentWorkouts.forEach(w => {
            totalXp += w.xpEarned;
            pillarHits['physical'] += w.xpEarned;
        });

        // Find best pillar
        const bestPillar = Object.entries(pillarHits).sort((a, b) => b[1] - a[1])[0][0];

        return {
            totalXp,
            tasks: recentTasks.length,
            workouts: recentWorkouts.length,
            bestPillar
        };
    }, [user]);

    if (!isOpen || !user) return null;

    const PILLAR_COLORS: Record<string, string> = {
        physical: 'text-neon-pink glow-pink',
        mental: 'text-neon-blue glow-blue',
        wealth: 'text-neon-gold glow-gold',
        vitality: 'text-emerald-400 glow-green'
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg glass-panel p-8 rounded-2xl border border-white/10"
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={() => {
                            soundFx.playClick();
                            onClose();
                        }}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-2"
                    >
                        <X size={24} />
                    </button>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Weekly Assessment</h2>
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Your actions over the last 7 days</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-surface border border-white/5 flex items-center justify-between">
                            <div className="flex items-center text-zinc-300 font-bold tracking-widest uppercase">
                                <TrendingUp size={20} className="mr-3 text-neon-gold" />
                                Total Power Output
                            </div>
                            <div className="text-2xl font-black text-neon-gold glow-gold tracking-tighter">
                                +{stats.totalXp} XP
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-surface border border-white/5 text-center">
                                <p className="text-zinc-500 font-bold tracking-widest text-xs uppercase mb-1">Dungeons Cleared</p>
                                <p className="text-2xl font-black text-white">{stats.workouts}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-surface border border-white/5 text-center">
                                <p className="text-zinc-500 font-bold tracking-widest text-xs uppercase mb-1">Actions Logged</p>
                                <p className="text-2xl font-black text-white">{stats.tasks}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-surface border border-white/5 flex items-center justify-between">
                            <div className="flex items-center text-zinc-300 font-bold tracking-widest uppercase text-sm">
                                <Award size={20} className="mr-3 text-neon-blue" />
                                Focused Pillar
                            </div>
                            <div className={clsx("font-black uppercase tracking-widest", PILLAR_COLORS[stats.bestPillar])}>
                                {stats.bestPillar}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            soundFx.playHover();
                            onClose();
                        }}
                        className="w-full mt-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-transform"
                    >
                        Acknowledge
                    </button>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
