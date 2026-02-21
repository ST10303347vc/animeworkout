export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type ExerciseType = 'calisthenics' | 'gym';
export type Pillar = 'physical' | 'mental' | 'wealth' | 'vitality';

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
    customWorkouts?: Workout[];
    unlockedAchievements?: string[];
    battleLog?: Array<{
        id: string;
        date: string;
        workoutName: string;
        xpEarned: number;
    }>;
    taskLog?: PillarTask[];
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
