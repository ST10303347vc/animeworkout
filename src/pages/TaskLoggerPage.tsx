import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { Pillar } from '@/types';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Search } from 'lucide-react';
import clsx from 'clsx';
import { soundFx } from '@/utils/sound';

interface Props {
    pillar: Pillar;
}

const PILLAR_CONFIG = {
    physical: { title: 'The Vanguard', color: 'text-neon-pink', bgGlow: 'bg-neon-pink/10', border: 'border-neon-pink/30', placeholder: 'e.g. Completed a 5k run' },
    mental: { title: 'The Sage', color: 'text-neon-blue', bgGlow: 'bg-neon-blue/10', border: 'border-neon-blue/30', placeholder: 'e.g. Read 20 pages of philosophy' },
    wealth: { title: 'The Merchant', color: 'text-neon-gold', bgGlow: 'bg-neon-gold/10', border: 'border-neon-gold/30', placeholder: 'e.g. 2 hours of Deep Work coding' },
    vitality: { title: 'The Guardian', color: 'text-emerald-400', bgGlow: 'bg-emerald-500/10', border: 'border-emerald-500/30', placeholder: 'e.g. Meditated for 15 minutes' }
};

export const TaskLoggerPage = ({ pillar }: Props) => {
    const user = useStore(state => state.user);
    const logTask = useStore(state => state.logTask);
    const config = PILLAR_CONFIG[pillar];

    const [title, setTitle] = useState('');
    const [xpReward, setXpReward] = useState('25');

    // Filter tasks for this pillar
    const pillarTasks = (user?.taskLog || []).filter(t => t.pillar === pillar);

    const handleLogTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !xpReward) return;

        soundFx.playClick();
        logTask({
            pillar,
            title,
            description: '', // Can expand later
            xpReward: Number(xpReward)
        });

        setTitle('');
    };

    return (
        <div className="min-h-screen bg-bg-dark pt-8 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
            <header className="mb-12">
                <h1 className={clsx("text-4xl font-black uppercase tracking-widest mb-2", config.color)}>
                    {config.title} Log
                </h1>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                    Record your actions. Forge your discipline.
                </p>
            </header>

            {/* Logger Form */}
            <div className={clsx("glass-panel p-6 rounded-2xl mb-12 border", config.border)}>
                <form onSubmit={handleLogTask} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Activity</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={config.placeholder}
                            className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/30 outline-none transition-colors"
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">XP Yield</label>
                        <input
                            type="number"
                            value={xpReward}
                            onChange={(e) => setXpReward(e.target.value)}
                            min="1"
                            max="500"
                            className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-white/30 outline-none transition-colors"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className={clsx(
                                "h-[50px] px-8 rounded-xl font-black uppercase tracking-widest flex items-center shadow-lg transition-all",
                                title.trim() ? "bg-white text-black hover:scale-105" : "bg-zinc-800 text-zinc-600"
                            )}
                        >
                            <Plus className="mr-2" size={20} /> Log It
                        </button>
                    </div>
                </form>
            </div>

            {/* History */}
            <div>
                <h2 className="text-lg font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center border-b border-white/10 pb-4">
                    <Search className="mr-3" size={20} /> History Log
                </h2>

                <div className="space-y-4">
                    {pillarTasks.length === 0 ? (
                        <div className="text-center py-12 text-zinc-600 font-bold uppercase tracking-widest text-sm">
                            No entries found. Begin your journey.
                        </div>
                    ) : (
                        pillarTasks.map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-surface border border-white/5"
                            >
                                <div className="flex items-center">
                                    <CheckCircle2 className={clsx("mr-4", config.color)} size={24} />
                                    <div>
                                        <p className="text-white font-bold">{task.title}</p>
                                        {task.completedAt && (
                                            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">
                                                {new Date(task.completedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className={clsx("font-black tracking-widest border px-3 py-1 rounded-full text-xs", config.color, config.border, config.bgGlow)}>
                                    +{task.xpReward} XP
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
