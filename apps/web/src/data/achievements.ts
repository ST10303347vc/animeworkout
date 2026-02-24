import { Trophy, Flame, Star, Zap, Target, Scale } from 'lucide-react';
import { ACHIEVEMENTS as CORE_ACHIEVEMENTS, AchievementDef as CoreAchievementDef } from '@limit-break/core';

// Map iconName strings from core to actual lucide-react components for web
const ICON_MAP: Record<string, any> = {
    target: Target,
    flame: Flame,
    zap: Zap,
    star: Star,
    trophy: Trophy,
    scale: Scale,
};

export interface AchievementDef extends CoreAchievementDef {
    icon: any; // Lucide icon component (web-specific)
}

/**
 * Web-specific achievements with lucide-react icon components.
 * Core defines iconName (string), web maps it to the actual React component.
 */
export const ACHIEVEMENTS: AchievementDef[] = CORE_ACHIEVEMENTS.map(a => ({
    ...a,
    icon: ICON_MAP[a.iconName] || Target,
}));
