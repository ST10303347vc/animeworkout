import { Trophy, Flame, Star, Zap, Target, Scale } from 'lucide-react';
import { calculatePillarLevel } from '@/lib/xp';

export interface AchievementDef {
    id: string;
    title: string;
    description: string;
    icon: any; // Lucide icon
    color: string;
    condition: (state: any) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
    {
        id: 'a_first_blood',
        title: 'First Blood',
        description: 'Complete your first Daily Quest.',
        icon: Target,
        color: 'text-neon-pink glow-pink',
        condition: (state) => (state.user?.pillarXp?.physical || 0) > 0
    },
    {
        id: 'a_dedication',
        title: 'Iron Discipline',
        description: 'Reach a 3-day training streak.',
        icon: Flame,
        color: 'text-neon-gold glow-gold',
        condition: (state) => (state.user?.currentStreak || 0) >= 3
    },
    {
        id: 'a_power_over 9000',
        title: 'It\'s Over 9000!',
        description: 'Reach Power Level 5.',
        icon: Zap,
        color: 'text-neon-blue glow-blue',
        condition: (state) => (state.user?.globalLevel || 0) >= 5
    },
    {
        id: 'a_creator',
        title: 'The Architect',
        description: 'Forge your first custom workout routine.',
        icon: Star,
        color: 'text-neon-purple glow-purple',
        condition: (state) => (state.user?.customWorkouts?.length || 0) > 0
    },
    {
        id: 'a_mastery',
        title: 'Limit Breaker',
        description: 'Accumulate 10,000 Total XP.',
        icon: Trophy,
        color: 'text-white glow-white',
        condition: (state) => (state.user?.pillarXp?.physical || 0) >= 10000
    },
    {
        id: 'a_balanced_warrior',
        title: 'Balanced Warrior',
        description: 'Reach Level 5 in all Four Pillars.',
        icon: Scale,
        color: 'text-emerald-400 glow-green',
        condition: (state) => {
            const xp = state.user?.pillarXp;
            if (!xp) return false;
            return calculatePillarLevel(xp.physical) >= 5 &&
                calculatePillarLevel(xp.mental) >= 5 &&
                calculatePillarLevel(xp.wealth) >= 5 &&
                calculatePillarLevel(xp.vitality) >= 5;
        }
    }
];
