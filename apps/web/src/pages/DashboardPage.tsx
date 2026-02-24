import { useStore } from '@/stores/useStore';
import { MOCK_SENSEIS } from '@/data/mockData';
import { PowerLevelRing } from '@/components/hud/PowerLevelRing';
import { DailyQuestCard } from '@/components/hud/DailyQuestCard';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, Zap, Hammer, GitMerge, History, BarChart2, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { soundFx } from '@/utils/sound';
import { shareElementAsImage } from '@/utils/shareImage';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const quests = useStore(state => state.quests);
    const completeQuest = useStore(state => state.completeQuest);

    if (!user || !user.senseiId) return null;

    const sensei = MOCK_SENSEIS.find(s => s.id === user.senseiId)!;

    // Calculate level curve thresholds based on Physical Pillar for now (pre-HubDashboard refactor)
    const nextLevelXp = 100 * Math.pow(user.globalLevel || 1, 1.5);

    return (
        <div className="min-h-screen bg-bg-dark pt-12 pb-24 px-6 md:px-12">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Top Header Section */}
                <header className="flex items-center justify-between">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            <span>WELCOME BACK,</span>
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${sensei.glowColor === 'bg-neon-blue text-glow-blue' ? 'from-neon-blue to-white' : sensei.glowColor === 'bg-neon-pink text-glow-pink' ? 'from-neon-pink to-white' : 'from-neon-gold to-white'}`}>
                                {user.displayName}
                            </span>
                        </h1>
                        <p className="text-zinc-500 font-bold tracking-widest uppercase text-sm mt-1">
                            {sensei.name}'s Disciple
                        </p>
                    </motion.div>

                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Streak</span>
                            <div className="flex items-center text-neon-gold glow-gold font-bold">
                                {user.currentStreak} Days <Flame size={16} className="ml-1" />
                            </div>
                        </div>
                        {/* Minimal Avatar */}
                        <div className={`w-12 h-12 rounded-full border-2 bg-surface flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(255,255,255,0.1)] ${sensei.glowColor.split(' ')[1]}`}>
                            {sensei.name[0]}
                        </div>
                        <button
                            onClick={() => {
                                soundFx.playClick();
                                shareElementAsImage('share-card');
                            }}
                            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors border border-white/10"
                        >
                            <Share2 size={20} className="text-zinc-300" />
                        </button>
                    </div>
                </header>

                {/* HUD Layout */}
                <div id="share-card" className="grid grid-cols-1 lg:grid-cols-3 gap-8 rounded-xl bg-bg-dark">

                    {/* Column 1: Power Level */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 glass-panel p-8 flex flex-col items-center justify-center"
                    >
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Current Power Level</h2>
                        <PowerLevelRing
                            level={user.globalLevel || 1}
                            xp={user.pillarXp?.physical || 0}
                            nextLevelXp={nextLevelXp}
                            glowColor={
                                sensei.glowColor.includes('blue') ? '#00f0ff' :
                                    sensei.glowColor.includes('pink') ? '#ff0055' : '#ffcf00'
                            }
                        />
                    </motion.div>

                    {/* Column 2: Dashboard Actions & Quests */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <button
                                onClick={() => navigate('/workout')}
                                className="relative group overflow-hidden rounded-2xl glass-panel p-6 text-left hover:border-white/20 transition-all border-white/5 lg:col-span-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="p-3 rounded-xl bg-neon-blue/10 text-neon-blue">
                                        <Zap size={28} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="p-3 rounded-xl bg-neon-pink/10 text-neon-pink">
                                        <Dumbbell size={28} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Start Training</h3>
                                <p className="text-zinc-500 text-sm">Select a pre-made routine</p>
                            </button>

                            <button
                                onClick={() => navigate('/build')}
                                className="relative group overflow-hidden rounded-2xl glass-panel p-6 text-left hover:border-white/20 transition-all border-white/5 lg:col-span-2 border-dashed border-zinc-700 bg-black/40 hover:bg-zinc-900/80"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-neon-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Hammer className="text-neon-gold mb-4 group-hover:rotate-12 group-hover:scale-110 transition-transform" size={32} />
                                <h3 className="text-xl font-bold text-white mb-1">Forge Routine</h3>
                                <p className="text-zinc-500 text-sm">Create a custom workout plan</p>
                            </button>
                        </motion.div>

                        {/* Daily Quests */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-neon-gold mr-2 glow-gold"></span>
                                Daily Quests
                            </h2>
                            <div className="space-y-3">
                                {quests.map(q => (
                                    <DailyQuestCard
                                        key={q.id}
                                        quest={q}
                                        onComplete={() => {
                                            soundFx.playClick();
                                            completeQuest(q.id);
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Secondary Links */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-2 gap-4 mt-8"
                        >
                            <button
                                onClick={() => navigate('/history')}
                                className="w-full relative overflow-hidden rounded-2xl glass-panel p-4 flex flex-col items-start hover:bg-zinc-800/80 transition-colors border border-white/5"
                            >
                                <History className="text-zinc-400 mb-2" size={24} />
                                <span className="text-zinc-300 font-bold tracking-widest uppercase text-xs">Battle Log</span>
                                <span className="text-zinc-600 font-mono text-[10px] mt-1">{user.battleLog?.length || 0} Records</span>
                            </button>

                            <button
                                onClick={() => navigate('/skills')}
                                className="w-full relative overflow-hidden rounded-2xl glass-panel p-4 flex flex-col items-start hover:bg-zinc-800/80 transition-colors border border-white/5"
                            >
                                <GitMerge className="text-neon-purple mb-2" size={24} />
                                <span className="text-zinc-300 font-bold tracking-widest uppercase text-xs">Skill Tree</span>
                                <span className="text-zinc-600 font-mono text-[10px] mt-1">Calisthenics</span>
                            </button>

                            <button
                                onClick={() => navigate('/analytics')}
                                className="w-full lg:col-span-2 relative overflow-hidden rounded-2xl glass-panel p-4 flex items-center justify-center hover:bg-zinc-800/80 transition-colors border border-white/5 space-x-2"
                            >
                                <BarChart2 className="text-neon-blue" size={20} />
                                <span className="text-zinc-300 font-bold tracking-widest uppercase text-xs">Combat Analytics</span>
                            </button>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
};
