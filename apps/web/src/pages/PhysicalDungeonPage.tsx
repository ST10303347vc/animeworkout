import { useNavigate } from 'react-router-dom';
import { Dumbbell, Plus, History, Activity, Zap } from 'lucide-react';

export const PhysicalDungeonPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-dark pt-12 pb-24 px-6 md:px-12 max-w-5xl mx-auto text-white">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-neon-pink tracking-widest uppercase flex items-center drop-shadow-[0_0_10px_#ff0055]">
                    <Dumbbell className="mr-3" size={32} />
                    Physical Dungeon
                </h1>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mt-2">The Vanguard's Domain</p>
            </header>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                <button
                    onClick={() => navigate('/workout')}
                    className="glass-panel p-6 flex flex-col items-center justify-center space-y-3 hover:border-white/20 hover:bg-zinc-800/80 transition-all border border-neon-pink/30 group"
                >
                    <div className="p-4 rounded-full bg-neon-pink/10 text-neon-pink group-hover:bg-neon-pink group-hover:text-bg-dark transition-colors shadow-[0_0_15px_rgba(255,0,85,0.4)]">
                        <Zap size={32} />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-sm text-zinc-200">Start Session</span>
                </button>

                <button
                    onClick={() => navigate('/build')}
                    className="glass-panel p-6 flex flex-col items-center justify-center space-y-3 hover:border-white/20 hover:bg-zinc-800/80 transition-all border border-white/5"
                >
                    <div className="p-4 rounded-full bg-zinc-800 text-zinc-300">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-sm text-zinc-400">Forge Routine</span>
                </button>

                <button
                    onClick={() => navigate('/history')}
                    className="glass-panel p-6 flex flex-col items-center justify-center space-y-3 hover:border-white/20 hover:bg-zinc-800/80 transition-all border border-white/5"
                >
                    <div className="p-4 rounded-full bg-zinc-800 text-zinc-300">
                        <History size={32} />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-sm text-zinc-400">Battle Log</span>
                </button>

                <button
                    onClick={() => navigate('/analytics')}
                    className="glass-panel p-6 flex flex-col items-center justify-center space-y-3 hover:border-white/20 hover:bg-zinc-800/80 transition-all border border-white/5"
                >
                    <div className="p-4 rounded-full bg-zinc-800 text-neon-blue">
                        <Activity size={32} />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-sm text-zinc-400">Combat Scouter</span>
                </button>
            </div>

            {/* Skill Tree Link */}
            <button
                onClick={() => navigate('/skills')}
                className="w-full glass-panel p-6 text-center border border-white/5 hover:border-neon-purple/50 transition-all rounded-2xl group"
            >
                <Dumbbell className="mx-auto text-neon-purple mb-3 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-lg font-bold text-zinc-200 uppercase tracking-widest">View Skill Trees</h3>
                <p className="text-zinc-500 text-sm mt-1">Unlock new abilities as you level up</p>
            </button>
        </div>
    );
};
