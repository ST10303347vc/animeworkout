import { motion } from 'framer-motion';
import { ParticleAura } from '../effects/ParticleAura';

interface Props {
    level: number;
    xp: number;
    nextLevelXp: number;
    glowColor: string; // e.g. "rgba(0, 240, 255, 0.5)"
}

export const PowerLevelRing: React.FC<Props> = ({ level, xp, nextLevelXp, glowColor }) => {
    const size = 180;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Calculate previous level XP to get relative progress for this level
    const prevLevelXp = level > 1 ? 100 * Math.pow(level - 1, 1.5) : 0;
    const xpNeededForThisLevel = nextLevelXp - prevLevelXp;
    const xpGainedThisLevel = Math.max(0, xp - prevLevelXp);
    const percent = Math.min(100, Math.max(0, (xpGainedThisLevel / xpNeededForThisLevel) * 100));

    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center p-4">
            <ParticleAura color={glowColor || '#fff'} />
            <svg width={size} height={size} className="transform -rotate-90 relative z-10">
                {/* Background Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="text-white drop-shadow-md"
                    style={{
                        color: glowColor || '#fff',
                        filter: `drop-shadow(0 0 10px ${glowColor})`
                    }}
                />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Level</span>
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {level}
                </span>
                <span className="text-xs text-zinc-400 mt-2 font-mono">
                    {Math.floor(xpGainedThisLevel)} / {Math.floor(xpNeededForThisLevel)} XP
                </span>
            </div>
        </div>
    );
};
