import { Trophy, Flame, Star, Zap, Target } from 'lucide-react';

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
        condition: (state) => state.user?.totalXp > 0
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
        condition: (state) => (state.user?.level || 0) >= 5
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
        condition: (state) => (state.user?.totalXp || 0) >= 10000
    }
];
