import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { motion } from 'framer-motion';
import { ChevronLeft, GitMerge, Lock, Unlock } from 'lucide-react';
import { SKILL_TREES } from '@/data/skillTrees';
import { calculatePillarLevel } from '@/lib/xp';
import clsx from 'clsx';

export const SkillTreePage = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const userLevel = user?.globalLevel || 1;

    return (
        <div className="min-h-screen bg-bg-dark pt-12 pb-24 text-white">
            <header className="px-6 md:px-12 mb-12 flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white transition-colors">
                    <ChevronLeft size={28} />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase flex items-center">
                        <GitMerge className="mr-3 text-neon-purple" />
                        Skill Trees
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-1">Advanced Calisthenics Paradigms</p>
                </div>
            </header>

            <main className="px-6 md:px-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                {SKILL_TREES.map((tree, treeIndex) => {
                    const treeLevel = tree.pillar && user ? calculatePillarLevel(user.pillarXp[tree.pillar]) : userLevel;
                    return (
                        <div key={tree.id} className="relative">
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-8 flex items-center" style={{ textShadow: '2px 2px 0 #000' }}>
                                <span className={clsx(`w-3 h-3 rounded-full mr-3`, `bg-${tree.color}`, `glow-${tree.color.replace('neon-', '')}`)}></span>
                                {tree.name}
                            </h2>

                            <div className="relative pl-8 border-l-2 border-zinc-800 space-y-10">
                                {tree.nodes.map((node, i) => {
                                    const isUnlocked = treeLevel >= node.requiredLevel;
                                    const isNext = !isUnlocked && (i === 0 || treeLevel >= tree.nodes[i - 1].requiredLevel);

                                    return (
                                        <motion.div
                                            key={node.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: treeIndex * 0.2 + i * 0.1 }}
                                            className="relative"
                                        >
                                            {/* Connector Node */}
                                            <div className={clsx(
                                                "absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-bg-dark z-10",
                                                isUnlocked ? `bg-${tree.color} shadow-[0_0_15px_var(--tw-shadow-color)] shadow-${tree.color}` : isNext ? 'bg-zinc-500 animate-pulse' : 'bg-zinc-800'
                                            )}></div>

                                            <div className={clsx(
                                                "glass-panel p-6 border transition-all",
                                                isUnlocked ? `border-${tree.color}/50 hover:border-${tree.color} bg-black/40` : isNext ? 'border-zinc-600 bg-zinc-900/50' : 'border-white/5 opacity-50 grayscale'
                                            )}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className={clsx(
                                                        "text-xl font-bold",
                                                        isUnlocked ? "text-white" : "text-zinc-400"
                                                    )}>
                                                        {node.name}
                                                    </h3>
                                                    {isUnlocked ? (
                                                        <Unlock size={20} className={`text-${tree.color}`} />
                                                    ) : (
                                                        <div className="flex items-center text-zinc-500 font-bold text-xs">
                                                            <Lock size={14} className="mr-1" /> LVL {node.requiredLevel}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-zinc-400 text-sm">{node.description}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
            </main>
        </div>
    );
};
