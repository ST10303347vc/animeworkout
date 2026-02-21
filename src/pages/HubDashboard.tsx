import { useState, useMemo } from 'react';
import { useStore } from '@/stores/useStore';
import { MOCK_SENSEIS } from '@/data/mockData';
import { getDominantAura } from '@/lib/xp';
import { getUserTitle } from '@/lib/titles';
import { AuraAvatar } from '@/components/effects/AuraAvatar';
import { PillarCard } from '@/components/hud/PillarCard';
import { Dumbbell, Brain, Wallet, Heart, Calendar } from 'lucide-react';
import { DailyQuestCard } from '@/components/hud/DailyQuestCard';
import { WeeklyRecapModal } from '@/components/hud/WeeklyRecapModal';
import { motion } from 'framer-motion';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    Tooltip, ResponsiveContainer
} from 'recharts';

export const HubDashboard = () => {
    const user = useStore(state => state.user);
    const quests = useStore(state => state.quests);
    const [isRecapOpen, setIsRecapOpen] = useState(false);

    if (!user) return null;

    const sensei = MOCK_SENSEIS.find(s => s.id === user.senseiId)!;
    const dominantAura = getDominantAura(user.pillarXp);

    const pillarBalanceData = useMemo(() => {
        const xp = user.pillarXp;
        const maxXp = Math.max(100, xp.physical, xp.mental, xp.wealth, xp.vitality) * 1.1;
        return [
            { subject: 'Physical', A: xp.physical, fullMark: maxXp },
            { subject: 'Mental', A: xp.mental, fullMark: maxXp },
            { subject: 'Wealth', A: xp.wealth, fullMark: maxXp },
            { subject: 'Vitality', A: xp.vitality, fullMark: maxXp },
        ];
    }, [user.pillarXp]);

    const pillars = [
        { id: 'physical', title: 'The Vanguard', icon: Dumbbell, color: 'text-neon-pink', bgGlow: 'bg-neon-pink text-glow-pink', xp: user.pillarXp.physical },
        { id: 'mental', title: 'The Sage', icon: Brain, color: 'text-neon-blue', bgGlow: 'bg-neon-blue text-glow-blue', xp: user.pillarXp.mental },
        { id: 'wealth', title: 'The Merchant', icon: Wallet, color: 'text-neon-gold', bgGlow: 'bg-neon-gold text-glow-gold', xp: user.pillarXp.wealth },
        { id: 'vitality', title: 'The Guardian', icon: Heart, color: 'text-emerald-400', bgGlow: 'bg-emerald-500 shadow-[0_0_10px_#10b981]', xp: user.pillarXp.vitality }
    ] as const;

    return (
        <div className="min-h-screen bg-bg-dark pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto">

            {/* Header / Avatar Section */}
            <header className="flex flex-col items-center justify-center mb-12 text-center">
                <AuraAvatar user={user} sensei={sensei} dominantAura={dominantAura} size="lg" />

                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="mt-6"
                >
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">
                        {user.displayName}
                    </h1>
                    <div className="flex items-center justify-center space-x-3 mt-2">
                        <span className="text-zinc-500 font-bold tracking-widest text-sm uppercase">Global Level</span>
                        <span className={`text-2xl font-black ${dominantAura.color.replace('bg-', 'text-')} drop-shadow-[0_0_10px_currentColor]`}>
                            {user.globalLevel}
                        </span>
                    </div>
                    {user.globalLevel >= 1 && (
                        <p className={`mt-2 text-sm font-mono font-black tracking-widest ${dominantAura.color.replace('bg-', 'text-')} opacity-90 uppercase`}>
                            {getUserTitle(user.globalLevel, dominantAura.pillar)}
                        </p>
                    )}

                    <button
                        onClick={() => setIsRecapOpen(true)}
                        className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-300 transition-colors flex items-center"
                    >
                        <Calendar className="mr-2" size={14} /> View Weekly Assessment
                    </button>
                </motion.div>
            </header>

            {/* The Four Pillars Grid */}
            <div className="mb-12">
                <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-white mr-3"></span>
                    The Four Pillars
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pillars.map((p, i) => {
                        // Level calculate per pillar
                        const pLevel = Math.floor(Math.pow(Math.max(0, p.xp) / 100, 1 / 1.5)) || 1;
                        return (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (i * 0.1) }}
                            >
                                <PillarCard
                                    title={p.title}
                                    level={pLevel}
                                    xp={p.xp}
                                    icon={p.icon}
                                    colorClass={p.color}
                                    bgGlowClass={p.bgGlow}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Pillar Balance Radar */}
            <div className="mb-12">
                <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-neon-purple mr-3 shadow-[0_0_10px_rgba(188,19,254,0.8)]"></span>
                    Pillar Balance
                </h2>
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="glass-panel p-4 h-[280px] mx-auto max-w-md"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={pillarBalanceData}>
                            <PolarGrid stroke="#ffffff20" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff80', fontSize: 11, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                            <Radar name="XP" dataKey="A" stroke="#bc13fe" fill="#bc13fe" fillOpacity={0.4} strokeWidth={2} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #bc13fe', borderRadius: '8px' }}
                                itemStyle={{ color: '#bc13fe', fontWeight: 'bold' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Daily Quests */}
            <div className="mb-12">
                <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-neon-gold mr-3 shadow-[0_0_10px_#ffaa00]"></span>
                    Daily Directives
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quests.map((quest, i) => (
                        <motion.div key={quest.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (i * 0.1) }}>
                            <DailyQuestCard quest={quest} onComplete={() => useStore.getState().completeQuest(quest.id)} />
                        </motion.div>
                    ))}
                </div>
            </div>

            <WeeklyRecapModal isOpen={isRecapOpen} onClose={() => setIsRecapOpen(false)} />
        </div>
    );
};
