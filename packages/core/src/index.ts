// ── Types ──────────────────────────────────────────────────────────
export type {
    Rank,
    ExerciseType,
    Pillar,
    AppMode,
    PillarXP,
    PillarTask,
    TaskChapter,
    CustomTask,
    DailyHabit,
    UserSettings,
    AuraConfig,
    UserProfile,
    Exercise,
    Workout,
    WorkoutExercise,
    DailyQuest,
    Sensei,
} from './types';

export { ALL_PILLARS, calcXpFromDifficulty } from './types';

// ── XP & Leveling ─────────────────────────────────────────────────
export {
    calculateTaskXp,
    calculatePillarLevel,
    calculateGlobalXpLevel,
    getGlobalXpProgress,
    getDominantAura,
} from './lib/xp';

// ── Titles ────────────────────────────────────────────────────────
export { getUserTitle } from './lib/titles';

// ── Data ──────────────────────────────────────────────────────────
export { ACHIEVEMENTS } from './data/achievements';
export type { AchievementDef } from './data/achievements';

export {
    MOCK_SENSEIS,
    MOCK_EXERCISES,
    MOCK_WORKOUTS,
    MOCK_QUESTS,
} from './data/mockData';

export { MAIN_TASKS } from './data/mainTasks';

export { SKILL_TREES } from './data/skillTrees';
export type { SkillNode, SkillTreeDef } from './data/skillTrees';

// ── Challenge Mode ────────────────────────────────────────────────
export {
    AVATAR_LEVELS,
    CHALLENGE_DURATION_DAYS,
    TOTAL_AVATAR_LEVELS,
    getAvatarLevel,
    getLevelProgress,
    getChallengeDay,
    isChallengeComplete,
    getLevelMessage,
} from './lib/challengeXp';
export type { AvatarLevel } from './lib/challengeXp';
