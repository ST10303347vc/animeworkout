import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
    durationSec: number;
    onComplete: () => void;
}

export const RestTimer = ({ durationSec, onComplete }: Props) => {
    const [timeLeft, setTimeLeft] = useState(durationSec);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    const size = 280;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useEffect(() => {
        if (timeLeft <= 0) {
            onCompleteRef.current();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const progress = timeLeft / durationSec;
    const offset = circumference - progress * circumference;

    const isIntense = timeLeft <= 10;
    const timerColor = isIntense ? '#ff0055' : '#00f0ff';
    const timerGlowStyle = isIntense ? 'glow-pink text-neon-pink' : 'glow-blue text-neon-blue';

    const addTime = (seconds: number) => {
        setTimeLeft(prev => Math.max(0, prev + seconds));
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : String(s);
    };

    return (
        <div className="relative flex flex-col items-center justify-center p-4">
            {/* Background Aura Pulse */}
            <motion.div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{ backgroundColor: timerColor }}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.05, 0.2, 0.05]
                }}
                transition={{
                    duration: isIntense ? 0.5 : 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* SVG Ring */}
            <div className="relative">
                <svg width={size} height={size} className="transform -rotate-90 relative z-10">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
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

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <span className={`text-6xl font-black tracking-tighter transition-colors duration-500 ${timerGlowStyle}`}>
                        {formatTime(timeLeft)}
                    </span>
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2">
                        {isIntense ? 'GET READY' : 'REST'}
                    </span>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-4 mt-8 z-20 relative">
                <button
                    onClick={() => addTime(-15)}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 font-bold text-sm uppercase tracking-widest transition-all"
                >
                    −15s
                </button>
                <button
                    onClick={() => onCompleteRef.current()}
                    className="px-8 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 font-black uppercase tracking-widest transition-all"
                >
                    Skip
                </button>
                <button
                    onClick={() => addTime(15)}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 font-bold text-sm uppercase tracking-widest transition-all"
                >
                    +15s
                </button>
            </div>
        </div>
    );
};
