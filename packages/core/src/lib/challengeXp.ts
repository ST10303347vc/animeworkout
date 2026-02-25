// ── 15-Day Challenge XP System ─────────────────────────────────────
// Progressive difficulty: easy early, hard late.
// Formula: cumulative XP = floor(1.25 * level^3)

export interface AvatarLevel {
    level: number;
    xpRequired: number;
    imageFile: string;
}

export const TOTAL_AVATAR_LEVELS = 16;

export const AVATAR_LEVELS: AvatarLevel[] = Array.from({ length: TOTAL_AVATAR_LEVELS }, (_, i) => {
    const level = i + 1;
    let required = 0;

    if (level === 2) {
        required = 10;
    } else if (level > 2) {
        // Tuned to require exactly 4710 XP for Level 16 (5 days of perfect completion)
        required = Math.floor(1.15 * Math.pow(level, 3));
    }

    let mappedLevel = level;
    let imageSuffix = 'png';

    if (level === 1) imageSuffix = 'jpeg';
    if (level === 16) {
        mappedLevel = 17;
        imageSuffix = 'jpeg';
    }

    return {
        level,
        xpRequired: required,
        imageFile: `${mappedLevel}.${imageSuffix}`,

    };
});

export const CHALLENGE_DURATION_DAYS = 15;

/**
 * Get the current avatar level based on total XP.
 * Returns the highest level whose xpRequired <= totalXp.
 */
export function getAvatarLevel(totalXp: number): number {
    let currentLevel = 1;
    for (const lvl of AVATAR_LEVELS) {
        if (totalXp >= lvl.xpRequired) {
            currentLevel = lvl.level;
        } else {
            break;
        }
    }
    return currentLevel;
}

/**
 * Get detailed progress info for the current level.
 */
export function getLevelProgress(totalXp: number) {
    const currentLevel = getAvatarLevel(totalXp);
    const current = AVATAR_LEVELS[currentLevel - 1];
    const next = currentLevel < TOTAL_AVATAR_LEVELS ? AVATAR_LEVELS[currentLevel] : null;

    const xpInLevel = totalXp - current.xpRequired;
    const xpToNextLevel = next ? next.xpRequired - current.xpRequired : 0;
    const progressPercent = next
        ? Math.min(100, Math.max(0, (xpInLevel / xpToNextLevel) * 100))
        : 100;

    return {
        currentLevel,
        nextLevel: next ? next.level : null,
        xpInLevel,
        xpToNextLevel,
        progressPercent,
        currentImage: current.imageFile,
        nextImage: next?.imageFile || null,
        isMaxLevel: currentLevel === TOTAL_AVATAR_LEVELS,
    };
}

/**
 * Calculate which day of the challenge the user is on (1-indexed).
 * Returns 0 if challenge hasn't started.
 */
export function getChallengeDay(startDate: string | null): number {
    if (!startDate) return 0;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1); // Day 1 starts on start date
}

/**
 * Check if the 15-day challenge period is complete.
 */
export function isChallengeComplete(startDate: string | null): boolean {
    return getChallengeDay(startDate) > CHALLENGE_DURATION_DAYS;
}

/**
 * Get a motivational message based on current level.
 */
export function getLevelMessage(level: number): string {
    if (level <= 3) return 'Your journey begins... Keep pushing!';
    if (level <= 6) return 'You\'re building momentum!';
    if (level <= 9) return 'Halfway there — stay disciplined!';
    if (level <= 12) return 'The real challenge starts now!';
    if (level <= 14) return 'You\'re in the final stretch!';
    return '🏆 MAXIMUM EVOLUTION ACHIEVED!';
}
