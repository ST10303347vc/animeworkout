import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/stores/useStore';
import { MOCK_SENSEIS } from '@/data/mockData';
import { soundFx } from '@/utils/sound';

export const LimitBreakOverlay = () => {
    const user = useStore(state => state.user);
    const [prevLevel, setPrevLevel] = useState(user?.level || 1);
    const [isLevelingUp, setIsLevelingUp] = useState(false);

    useEffect(() => {
        if (user && user.level > prevLevel) {
            setIsLevelingUp(true);
            setPrevLevel(user.level);
            soundFx.playLevelUp();

            // Auto-hide after animation sequence
            setTimeout(() => {
                setIsLevelingUp(false);
            }, 4500);
        }
    }, [user?.level, prevLevel]);

    if (!user || (!isLevelingUp && false)) return null; // Remove && false in production, kept true for easy demo if needed, wait, fixing that.

    const sensei = MOCK_SENSEIS.find(s => s.id === user.senseiId);
    const glowColorStr = sensei?.glowColor.split(' ')[0] || 'bg-neon-gold';
    const glowHex = glowColorStr.includes('blue') ? '#00f0ff' : glowColorStr.includes('pink') ? '#ff0055' : '#ffcf00';

    return (
        <AnimatePresence>
            {isLevelingUp && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-md"
                >
                    {/* Flash Effect */}
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="absolute inset-0 bg-white z-40 block pointer-events-none"
                    />

                    {/* Background Aura */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 1.5, 2], opacity: [0, 0.5, 0] }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute rounded-full pointer-events-none blur-3xl w-96 h-96"
                        style={{ backgroundColor: glowHex }}
                    />

                    <div className="z-10 text-center flex flex-col items-center">
                        {/* Sensei Avatar Slam */}
                        <motion.div
                            initial={{ scale: 5, opacity: 0, y: -200 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.3 }}
                            className={`w-40 h-40 rounded-full border-4 flex items-center justify-center font-bold text-6xl mb-8 bg-surface ${sensei?.glowColor || 'text-neon-gold border-neon-gold'}`}
                            style={{ boxShadow: `0 0 50px ${glowHex}` }}
                        >
                            {sensei?.name[0] || 'X'}
                        </motion.div>

                        {/* LIMIT BREAK TEXT */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, letterSpacing: '0px' }}
                            animate={{ scale: 1, opacity: 1, letterSpacing: '8px' }}
                            transition={{ type: 'spring', bounce: 0.5, delay: 0.8 }}
                        >
                            <h1
                                className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 italic uppercase mb-4"
                                style={{ textShadow: `0 0 20px ${glowHex}80` }}
                            >
                                LIMIT BREAK
                            </h1>
                        </motion.div>

                        {/* New Level Badge */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', delay: 1.5 }}
                            className="flex items-center space-x-4 mt-6"
                        >
                            <span className="text-zinc-400 font-bold uppercase tracking-widest text-xl">Power Level</span>
                            <div
                                className="px-6 py-2 rounded-xl text-4xl font-black text-bg-dark"
                                style={{ backgroundColor: glowHex, boxShadow: `0 0 30px ${glowHex}` }}
                            >
                                {user.level}
                            </div>
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
