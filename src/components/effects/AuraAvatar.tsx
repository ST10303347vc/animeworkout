import React from 'react';
import { motion } from 'framer-motion';
import { ParticleAura } from './ParticleAura';
import { UserProfile, Sensei, AuraConfig } from '@/types';
import clsx from 'clsx';

interface AuraAvatarProps {
    user: UserProfile;
    sensei: Sensei;
    dominantAura: AuraConfig;
    size?: 'sm' | 'md' | 'lg';
}

export const AuraAvatar: React.FC<AuraAvatarProps> = ({ user, sensei, dominantAura, size = 'md' }) => {

    const sizeClasses = {
        sm: 'w-16 h-16 text-2xl',
        md: 'w-32 h-32 text-5xl',
        lg: 'w-48 h-48 text-7xl'
    };

    // Determine visual evolution based on global level
    const level = user.globalLevel;
    const hasParticles = level >= 10;
    const hasIntenseAura = level >= 25;
    const hasAscendantAura = level >= 50;

    // Core glow style based on dominant pillar
    const auraStyle = {
        boxShadow: hasAscendantAura
            ? `0 0 100px ${dominantAura.glowHex}80, inset 0 0 40px ${dominantAura.glowHex}40`
            : hasIntenseAura
                ? `0 0 60px ${dominantAura.glowHex}40, inset 0 0 20px ${dominantAura.glowHex}20`
                : `0 0 30px ${dominantAura.glowHex}40, inset 0 0 10px ${dominantAura.glowHex}10`,
        borderColor: hasAscendantAura ? `${dominantAura.glowHex}` : `${dominantAura.glowHex}80`
    };

    return (
        <div className="relative flex items-center justify-center">

            {/* The Particle Aura Ring (behind avatar) */}
            {hasParticles && (
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                    <div className={clsx("absolute", hasAscendantAura ? "w-[200%] h-[200%]" : "w-[150%] h-[150%]")}>
                        <ParticleAura color={dominantAura.color.replace('bg-', '')} count={hasAscendantAura ? 50 : hasIntenseAura ? 30 : 15} />
                    </div>
                </div>
            )}

            {/* Main Avatar Container */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={clsx(
                    "relative z-10 rounded-full bg-surface flex items-center justify-center font-black border-4",
                    sizeClasses[size],
                    dominantAura.color.replace('bg-', 'text-glow-')
                )}
                style={auraStyle}
            >
                {/* Fallback to initials if no image */}
                {sensei.imagePath ? (
                    // We don't have real images yet, just using initials for now to keep the aesthetic clean
                    <span>{sensei.name[0]}</span>
                ) : (
                    <span>{user.displayName[0].toUpperCase()}</span>
                )}

                {/* Evolution Badge */}
                {hasIntenseAura && (
                    <div className={clsx("absolute -bottom-2 -right-2 bg-bg-dark rounded-full border border-white/20", hasAscendantAura ? "p-2" : "p-1")}>
                        <div className={clsx("rounded-full shadow-[0_0_10px_currentColor]",
                            hasAscendantAura ? "w-6 h-6 animate-pulse" : "w-4 h-4",
                            dominantAura.color
                        )} />
                    </div>
                )}
            </motion.div>
        </div>
    );
};
