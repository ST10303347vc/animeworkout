export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type ExerciseType = 'calisthenics' | 'gym';

export interface UserProfile {
    id: string;
    displayName: string;
    avatarUrl?: string;
    senseiId?: string;
    level: number;
    totalXp: number;
    currentStreak: number;
    customWorkouts?: Workout[];
    unlockedAchievements?: string[];
    battleLog?: Array<{
        id: string;
        date: string;
        workoutName: string;
        xpEarned: number;
    }>;
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
