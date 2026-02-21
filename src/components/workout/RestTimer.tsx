import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { soundFx } from '@/utils/sound';

interface Props {
    durationSec: number;
    onComplete: () => void;
}

export const RestTimer = ({ durationSec, onComplete }: Props) => {
    const [timeLeft, setTimeLeft] = useState(durationSec);
    const size = 300;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useEffect(() => {
        if (timeLeft <= 0) {
            soundFx.playHover(); // Use hover sound as a placeholder for a "sword shing" ping
            onComplete();
            return;
        }

        const timer = setInterval(() => {
            soundFx.playTimerTick();
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onComplete]);

    const progress = timeLeft / durationSec;
    const offset = circumference - progress * circumference;

    // Color shift logic: Start blue (calm), end red (intense) in the last 10 seconds.
    const isIntense = timeLeft <= 10;
    const timerColor = isIntense ? '#ff0055' : '#00f0ff';
    const timerGlowStyle = isIntense ? 'glow-pink text-neon-pink' : 'glow-blue text-neon-blue';

    return (
        <div className="relative flex flex-col items-center justify-center p-8">
            {/* Background Aura Pulse */}
            <motion.div
                className="absolute inset-0 rounded-full blur-2xl opacity-20"
                style={{ backgroundColor: timerColor }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                    duration: isIntense ? 0.5 : 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <svg width={size} height={size} className="transform -rotate-90 relative z-10">
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Remaining Line */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={timerColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 15px ${timerColor})` }}
                />
            </svg>

            {/* Time Text */}
            <div className="absolute flex flex-col items-center justify-center z-20">
                <span className={`text-7xl font-black tracking-tighter transition-colors duration-500 ${timerGlowStyle}`}>
                    {timeLeft}
                </span>
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-2">
                    Rest
                </span>
            </div>

            <button
                onClick={onComplete}
                className="mt-12 text-zinc-400 hover:text-white uppercase tracking-widest font-bold text-xs"
            >
                Skip Timer
            </button>
        </div>
    );
};
