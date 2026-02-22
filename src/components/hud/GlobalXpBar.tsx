
import { useStore } from '@/stores/useStore';
import { getGlobalXpProgress, getDominantAura } from '@/lib/xp';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export const GlobalXpBar = () => {
    const user = useStore(state => state.user);
    if (!user) return null;

    // Calculate progression
    const totalXp = user.globalXp || 0;
    const { currentLevel, xpInCurrentLevel, xpNeededForNextLevel, progressPercentage } = getGlobalXpProgress(totalXp);

    // Aesthetic flavor based on highest pillar
    const aura = getDominantAura(user.pillarXp);

    return (
        <div className="w-full relative mb-8">
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border`}
                        style={{
                            backgroundColor: `${aura.glowHex}20`,
                            borderColor: `${aura.glowHex}50`,
                            boxShadow: `0 0 15px ${aura.glowHex}40`
                        }}
                    >
                        <span className="text-xl font-black text-white glow-white">
                            {currentLevel}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-white font-bold tracking-widest uppercase text-sm flex items-center gap-2">
                            <Star size={16} style={{ color: aura.glowHex }} />
                            Global Rank
                        </h2>
                        <p className="text-zinc-400 text-xs font-mono">
                            {xpInCurrentLevel} / {xpNeededForNextLevel} XP to Level {currentLevel + 1}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <span
                        className="text-2xl font-black tracking-tighter"
                        style={{
                            color: aura.glowHex,
                            textShadow: `0 0 10px ${aura.glowHex}50`
                        }}
                    >
                        {progressPercentage.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* The Bar */}
            <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 z-10"></div>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                    className="h-full rounded-full relative"
                    style={{
                        backgroundColor: aura.glowHex,
                        boxShadow: `0 0 20px ${aura.glowHex}80`
                    }}
                >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-shimmer" />
                </motion.div>
            </div>

            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    transform: translateX(-100%);
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
};
