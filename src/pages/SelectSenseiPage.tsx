import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { MOCK_SENSEIS } from '@/data/mockData';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';

export const SelectSenseiPage = () => {
    const setSensei = useStore((state) => state.setSensei);
    const navigate = useNavigate();

    const handleSelect = (id: string) => {
        setSensei(id);
        navigate('/dashboard');
    };

    // Staggered animation wrapper
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
    };

    return (
        <div className="min-h-screen bg-bg-dark pt-20 pb-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl font-extrabold text-white mb-4 tracking-tight"
                    >
                        CHOOSE YOUR SENSEI
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-zinc-400 text-lg max-w-2xl mx-auto"
                    >
                        Your master will guide your progression, provide your quests, and push you past your limits.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {MOCK_SENSEIS.map((sensei) => (
                        <motion.div
                            key={sensei.id}
                            variants={item}
                            whileHover={{ scale: 1.05, y: -10 }}
                            className="relative group cursor-pointer"
                            onClick={() => handleSelect(sensei.id)}
                        >
                            {/* Glow backdrop that activates on hover */}
                            <div className={clsx("absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl", sensei.glowColor.split(' ')[0])}></div>

                            <div className="relative h-full glass-panel overflow-hidden border-2 border-transparent group-hover:border-white/20 flex flex-col pt-10 px-8 pb-8 transition-all bg-zinc-900/80">
                                {/* Placeholders for characters until SVGs are ready */}
                                <div className="flex-1 flex items-center justify-center mb-8">
                                    <div className={clsx("w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold border-4",
                                        sensei.glowColor.includes('blue') ? 'border-neon-blue text-neon-blue shadow-[0_0_30px_rgba(0,240,255,0.4)]' :
                                            sensei.glowColor.includes('pink') ? 'border-neon-pink text-neon-pink shadow-[0_0_30px_rgba(255,0,85,0.4)]' :
                                                'border-neon-gold text-neon-gold shadow-[0_0_30px_rgba(255,207,0,0.4)]'
                                    )}>
                                        {sensei.name[0]}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className={clsx("text-2xl font-bold mb-1", sensei.glowColor.split(' ')[1])}>
                                        {sensei.name}
                                    </h3>
                                    <p className="text-sm text-zinc-400 uppercase tracking-widest font-bold mb-6">
                                        {sensei.title}
                                    </p>
                                    <p className="text-zinc-300 italic mb-8 h-16 flex items-center justify-center">
                                        {sensei.quote}
                                    </p>

                                    <div className="flex items-center justify-center space-x-2 text-white font-bold uppercase tracking-wider group-hover:text-neon-gold transition-colors">
                                        <span>Select Master</span>
                                        <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};
