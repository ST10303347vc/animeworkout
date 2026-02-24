import { Pillar, PillarXP, AuraConfig } from '../types';

// XP = baseXP * difficultyMultiplier * (1 + streakBonus)
export const calculateTaskXp = (difficulty: number, currentStreak: number = 0): number => {
    const baseXP = 15;
    const difficultyMultiplier = Math.pow(Math.max(1, Math.min(10, difficulty)), 1.8);
    const streakBonus = Math.min(0.5, currentStreak * 0.05); // Max 50% bonus
    return Math.floor(baseXP * difficultyMultiplier * (1 + streakBonus));
};

export const calculatePillarLevel = (xp: number): number => {
    // XP to reach level N = 100 * N^1.5 => Level = floor((XP / 100)^(1/1.5))
    return Math.floor(Math.pow(Math.max(0, xp) / 100, 1 / 1.5)) || 1;
};

export const calculateGlobalXpLevel = (totalXp: number): number => {
    // Shared exponential leveling formula used globally
    return Math.floor(Math.pow(Math.max(0, totalXp) / 100, 1 / 1.5)) || 1;
};

export const getGlobalXpProgress = (totalXp: number) => {
    const currentLevel = calculateGlobalXpLevel(totalXp);

    // XP needed to reaching current level
    const xpForCurrentLevel = Math.floor(100 * Math.pow(currentLevel, 1.5));
    // XP needed to reaching next level
    const xpForNextLevel = Math.floor(100 * Math.pow(currentLevel + 1, 1.5));

    // How much XP we have accumulated *inside* this specific level
    const xpInCurrentLevel = totalXp - xpForCurrentLevel;
    // Total XP delta between current and next level
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;

    const progressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

    return {
        currentLevel,
        xpInCurrentLevel,
        xpNeededForNextLevel,
        progressPercentage
    };
};

export const getDominantAura = (pillarXp: PillarXP): AuraConfig => {
    if (!pillarXp) {
        return { name: 'Neutral', color: 'bg-zinc-500', glowHex: '#71717a', pillar: 'neutral' };
    }

    const entries = Object.entries(pillarXp) as [Pillar, number][];
    if (entries.length === 0) {
        return { name: 'Neutral', color: 'bg-zinc-500', glowHex: '#71717a', pillar: 'neutral' };
    }

    entries.sort((a, b) => b[1] - a[1]);
    const dominant = entries[0][0];

    switch (dominant) {
        case 'physical':
            return { name: 'Crimson', color: 'bg-neon-pink', glowHex: '#ff0055', pillar: 'physical' };
        case 'mental':
            return { name: 'Azure', color: 'bg-neon-blue', glowHex: '#00f0ff', pillar: 'mental' };
        case 'wealth':
            return { name: 'Radiant Gold', color: 'bg-neon-gold', glowHex: '#ffaa00', pillar: 'wealth' };
        case 'vitality':
            return { name: 'Emerald', color: 'bg-emerald-500', glowHex: '#10b981', pillar: 'vitality' };
        default:
            return { name: 'Neutral', color: 'bg-zinc-500', glowHex: '#71717a', pillar: 'neutral' };
    }
};
