import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { motion } from 'framer-motion';
import { Droplet, Moon, Apple, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { soundFx } from '@/utils/sound';

const HABITS = [
    { id: 'water', title: 'Hydration', description: 'Drink 2 Liters of Water', icon: Droplet, xp: 15 },
    { id: 'sleep', title: 'Rest Recovery', description: '8 Hours of Quality Sleep', icon: Moon, xp: 25 },
    { id: 'nutrition', title: 'Clean Fuel', description: 'Eat 3 Healthy Meals', icon: Apple, xp: 20 },
];

export const HabitTrackerPage = () => {
    const user = useStore(state => state.user);
    const logTask = useStore(state => state.logTask);

    // For simplicity in this demo, we'll track completed habits in local state per session.
    // In a real app, this would be tied to the current date in the global store.
    const [completedHabits, setCompletedHabits] = useState<string[]>([]);

    const handleComplete = (id: string, xp: number, title: string) => {
        if (completedHabits.includes(id)) return;

        soundFx.playHover(); // gentle ding
        setCompletedHabits(prev => [...prev, id]);

        logTask({
            pillar: 'vitality',
            title: `Habit: ${title}`,
            description: '',
            xpReward: xp
        });
    };

    return (
        <div className="min-h-screen bg-bg-dark pt-8 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-2 text-emerald-400">
                    The Guardian Log
                </h1>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                    Maintain your vessel. Cultivate enduring energy.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {HABITS.map((habit, i) => {
                    const isCompleted = completedHabits.includes(habit.id);
                    return (
                        <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={clsx(
                                "p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                                isCompleted
                                    ? "bg-zinc-900/40 border-zinc-800/50 opacity-60"
                                    : "glass-panel border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            )}
                        >
                            {/* Inner Glow */}
                            {!isCompleted && <div className="absolute inset-0 bg-emerald-500/5 blur-xl"></div>}

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={clsx("p-3 rounded-lg", isCompleted ? "bg-zinc-800 text-zinc-600" : "bg-emerald-500/20 text-emerald-400")}>
                                        <habit.icon size={24} />
                                    </div>
                                    <span className={clsx(
                                        "font-black tracking-widest text-xs px-2 py-1 rounded",
                                        isCompleted ? "text-zinc-600 bg-zinc-800" : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                    )}>
                                        +{habit.xp} XP
                                    </span>
                                </div>
                                <h3 className={clsx("text-xl font-bold uppercase mb-2", isCompleted ? "text-zinc-500 line-through" : "text-white")}>
                                    {habit.title}
                                </h3>
                                <p className="text-zinc-400 font-medium text-sm mb-6 flex-1">
                                    {habit.description}
                                </p>

                                <button
                                    disabled={isCompleted}
                                    onClick={() => handleComplete(habit.id, habit.xp, habit.title)}
                                    className={clsx(
                                        "w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center transition-all",
                                        isCompleted
                                            ? "bg-emerald-500/10 text-emerald-600"
                                            : "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-[1.02]"
                                    )}
                                >
                                    {isCompleted ? <><CheckCircle2 className="mr-2" size={20} /> Logged</> : 'Complete'}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Recent Vitality Task History */}
            <div>
                <h2 className="text-lg font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                    Vitality Actions Log
                </h2>
                <div className="space-y-4">
                    {(user?.taskLog || []).filter(t => t.pillar === 'vitality').slice(0, 5).map(task => (
                        <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-white/5">
                            <div className="flex items-center text-white font-bold">
                                <CheckCircle2 className="mr-4 text-emerald-400" size={20} />
                                {task.title}
                            </div>
                            <div className="font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs">
                                +{task.xpReward} XP
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
