import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { motion } from 'framer-motion';
import { ChevronLeft, History, Zap } from 'lucide-react';

export const BattleLogPage = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const logs = user?.battleLog || [];

    return (
        <div className="min-h-screen bg-bg-dark pt-12 pb-24 text-white">
            <header className="px-6 md:px-12 mb-12 flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white transition-colors">
                    <ChevronLeft size={28} />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase flex items-center">
                        <History className="mr-3 text-neon-blue" />
                        BATTLE LOG
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-1">Scroll of Past Victories</p>
                </div>
            </header>

            <main className="px-6 md:px-12 max-w-4xl mx-auto flex flex-col items-center">
                {logs.length === 0 ? (
                    <div className="glass-panel w-full p-12 text-center text-zinc-500 border-dashed border-white/10 mt-12">
                        <History size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold tracking-widest uppercase text-zinc-400">No Battles Fought</h3>
                        <p className="mt-2 text-sm italic">Return when you have completed your training, disciple.</p>
                    </div>
                ) : (
                    <div className="w-full space-y-6">
                        {logs.map((log, i) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative glass-panel overflow-hidden border border-white/10 group hover:border-white/30 transition-colors p-0"
                            >
                                {/* Manga Panel Border Style */}
                                <div className="absolute inset-0 border-4 border-black/50 pointer-events-none" style={{ mixBlendMode: 'overlay' }}></div>

                                <div className="p-6 md:p-8 flex items-center justify-between relative z-10 bg-zinc-900/40">
                                    <div>
                                        <p className="text-xs font-bold font-mono text-zinc-500 mb-2 uppercase tracking-widest">
                                            {new Date(log.date).toLocaleDateString()} • {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase" style={{ textShadow: '2px 2px 0 #000' }}>
                                            {log.workoutName}
                                        </h2>
                                    </div>
                                    <div className="flex flex-col items-end text-right">
                                        <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center">
                                            Power Gained <Zap size={12} className="ml-1 text-neon-gold" />
                                        </span>
                                        <span className="text-3xl font-black text-neon-gold glow-gold tracking-tighter">
                                            +{log.xpEarned} XP
                                        </span>
                                    </div>
                                </div>

                                {/* Diagonal Manga Speed lines (CSS simulation) */}
                                <div className="absolute top-0 right-0 w-1/3 h-full opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none overflow-hidden mix-blend-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] bg-repeat" style={{ maskImage: 'linear-gradient(to left, black, transparent)' }}></div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
