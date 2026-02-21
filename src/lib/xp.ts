import { Pillar, PillarXP, AuraConfig } from '@/types';

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

export const calculateGlobalLevel = (pillarXp: PillarXP): number => {
    const levels = [
        calculatePillarLevel(pillarXp.physical),
        calculatePillarLevel(pillarXp.mental),
        calculatePillarLevel(pillarXp.wealth),
        calculatePillarLevel(pillarXp.vitality)
    ];
    const sum = levels.reduce((a, b) => a + b, 0);
    return Math.floor(sum / levels.length) || 1;
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
