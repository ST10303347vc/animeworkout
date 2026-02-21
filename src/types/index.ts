export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type ExerciseType = 'calisthenics' | 'gym';
export type Pillar = 'physical' | 'mental' | 'wealth' | 'vitality';
export type AppMode = 'tasks-only' | 'custom' | 'full';

export interface PillarXP {
    physical: number;
    mental: number;
    wealth: number;
    vitality: number;
}

export interface PillarTask {
    id: string;
    pillar: Pillar;
    title: string;
    description: string;
    xpReward: number;
    completedAt?: string;
}

// ── Custom Task (new system) ───────────────────────────────────────
export interface CustomTask {
    id: string;
    title: string;
    pillar: Pillar | 'general';  // Can be assigned to a pillar or general
    difficulty: number;          // 1–10
    xpReward: number;            // Auto-calculated from difficulty
    status: 'active' | 'completed';
    timerDuration?: number;      // Optional countdown seconds (for timed tasks)
    createdAt: string;
    completedAt?: string;
}

// ── Daily Habit ────────────────────────────────────────────────────
export interface DailyHabit {
    id: string;
    title: string;
    pillar: Pillar | 'general';
    difficulty: number;          // 1–10
    xpReward: number;
    lastCompletedDate?: string;  // ISO date string (YYYY-MM-DD)
}

// ── User Settings ──────────────────────────────────────────────────
export interface UserSettings {
    appMode: AppMode;
    enabledPillars: Pillar[];    // Which pillars are active
}

export interface AuraConfig {
    color: string;
    glowHex: string;
    name: string;
    pillar: Pillar | 'neutral';
}

export interface UserProfile {
    id: string;
    displayName: string;
    avatarUrl?: string;
    senseiId?: string;

    pillarXp: PillarXP;
    globalLevel: number;

    // Legacy fields for migration
    level?: number;
    totalXp?: number;

    currentStreak: number;
    hasSeenTutorial?: boolean;
    settings: UserSettings;

    customWorkouts?: Workout[];
    unlockedAchievements?: string[];
    battleLog?: Array<{
        id: string;
        date: string;
        workoutName: string;
        xpEarned: number;
    }>;
    taskLog?: PillarTask[];
    customTasks?: CustomTask[];
    dailyHabits?: DailyHabit[];
}

export interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    type: ExerciseType;
    difficultyRank: Rank;
    description: string;
    demoUrl?: string;
}

export interface Workout {
    id: string;
    name: string;
    isCustom: boolean;
    exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
    id: string;
    exerciseId: string;
    sets: number;
    reps: number;
    order: number;
}

export interface DailyQuest {
    id: string;
    date: string;
    pillar: Pillar;
    questDescription: string;
    isCompleted: boolean;
    xpReward: number;
}

export interface Sensei {
    id: string;
    name: string;
    title: string;
    quote: string;
    imagePath: string;
    glowColor: string;
}

// ── Helpers ────────────────────────────────────────────────────────
export const ALL_PILLARS: Pillar[] = ['physical', 'mental', 'wealth', 'vitality'];

export function calcXpFromDifficulty(difficulty: number): number {
    return Math.round(5 + Math.max(1, Math.min(10, difficulty)) * 8);
}
