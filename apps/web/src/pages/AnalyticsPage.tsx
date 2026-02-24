import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { motion } from 'framer-motion';
import { ChevronLeft, BarChart2, TrendingUp, Activity } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useMemo } from 'react';

export const AnalyticsPage = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);

    // Mock data based on battle log, or generate if empty to show the charts working
    const logs = user?.battleLog || [];

    const xpHistoryData = useMemo(() => {
        if (logs.length > 0) {
            // Group by date
            const grouped = logs.reduce((acc, log) => {
                const day = new Date(log.date).toLocaleDateString();
                acc[day] = (acc[day] || 0) + log.xpEarned;
                return acc;
            }, {} as Record<string, number>);

            return Object.entries(grouped).map(([date, xp]) => ({
                name: date,
                XP: xp
            })).reverse(); // Oldest to newest
        }

        // Fallback demo data
        return [
            { name: 'Mon', XP: 150 },
            { name: 'Tue', XP: 230 },
            { name: 'Wed', XP: 0 },
            { name: 'Thu', XP: 340 },
            { name: 'Fri', XP: 400 },
            { name: 'Sat', XP: 200 },
            { name: 'Sun', XP: 500 },
        ];
    }, [logs]);

    const pillarBalanceData = useMemo(() => {
        const xp = user?.pillarXp || { physical: 0, mental: 0, wealth: 0, vitality: 0 };
        const maxExpectedXp = Math.max(100, xp.physical, xp.mental, xp.wealth, xp.vitality) * 1.1; // 10% headroom

        return [
            { subject: 'Physical', A: xp.physical, fullMark: maxExpectedXp },
            { subject: 'Mental', A: xp.mental, fullMark: maxExpectedXp },
            { subject: 'Wealth', A: xp.wealth, fullMark: maxExpectedXp },
            { subject: 'Vitality', A: xp.vitality, fullMark: maxExpectedXp },
        ];
    }, [user?.pillarXp]);

    const totalXp = useMemo(() => {
        if (!user?.pillarXp) return 0;
        return Object.values(user.pillarXp).reduce((sum, val) => sum + val, 0);
    }, [user?.pillarXp]);

    return (
        <div className="min-h-screen bg-bg-dark pt-12 pb-24 text-white">
            <header className="px-6 md:px-12 mb-8 flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white transition-colors">
                    <ChevronLeft size={28} />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase flex items-center">
                        <BarChart2 className="mr-3 text-neon-blue" />
                        Analytics
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-1">Combat Data & Trends</p>
                </div>
            </header>

            <main className="px-6 md:px-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 flex items-center justify-between border-b-4 border-neon-gold">
                        <div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-1">Total Lifetime XP</p>
                            <h3 className="text-3xl font-black text-neon-gold glow-gold tracking-tighter">{totalXp.toLocaleString()}</h3>
                        </div>
                        <TrendingUp size={32} className="text-neon-gold opacity-50" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-panel p-6 flex items-center justify-between border-b-4 border-neon-pink">
                        <div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-1">Battles Fought</p>
                            <h3 className="text-3xl font-black text-neon-pink glow-pink tracking-tighter">{user?.battleLog?.length || 0}</h3>
                        </div>
                        <Activity size={32} className="text-neon-pink opacity-50" />
                    </motion.div>
                </div>

                {/* Left Chart: XP Over Time */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass-panel p-6 h-[400px] flex flex-col"
                >
                    <h2 className="text-lg font-bold mb-6 tracking-widest uppercase flex items-center">
                        <span className="w-2 h-2 rounded-full bg-neon-blue mr-3 shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
                        Power Output History
                    </h2>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={xpHistoryData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff60" tick={{ fill: '#ffffff60', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#ffffff60" tick={{ fill: '#ffffff60', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff20', borderRadius: '8px' }}
                                    itemStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="XP"
                                    stroke="#00f0ff"
                                    strokeWidth={4}
                                    dot={{ fill: '#00f0ff', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 8, fill: '#fff', stroke: '#00f0ff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Right Chart: Pillar Balance (Radar) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-panel p-6 h-[400px] flex flex-col items-center"
                >
                    <div className="w-full flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold tracking-widest uppercase flex items-center">
                            <span className="w-2 h-2 rounded-full bg-neon-purple mr-3 shadow-[0_0_8px_rgba(188,19,254,0.8)]"></span>
                            Pillar Balance
                        </h2>
                    </div>
                    <div className="flex-1 w-full relative -mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={pillarBalanceData}>
                                <PolarGrid stroke="#ffffff20" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff80', fontSize: 12, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                <Radar name="XP" dataKey="A" stroke="#bc13fe" fill="#bc13fe" fillOpacity={0.4} strokeWidth={2} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #bc13fe', borderRadius: '8px' }}
                                    itemStyle={{ color: '#bc13fe', fontWeight: 'bold' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

            </main>
        </div>
    );
};
