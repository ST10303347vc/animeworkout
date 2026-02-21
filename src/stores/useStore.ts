import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, DailyQuest } from '@/types';
import { MOCK_QUESTS } from '@/data/mockData';
import { ACHIEVEMENTS } from '@/data/achievements';

interface AppState {
    // Auth & Profile
    user: UserProfile | null;
    login: (username: string) => void;
    logout: () => void;
    setSensei: (senseiId: string) => void;

    // Progression
    addXp: (amount: number) => void;
    logWorkout: (workoutName: string, xpEarned: number) => void;
    addWorkout: (name: string, isCustom: boolean, exercises: { id: string; exerciseId: string; sets: number; reps: number; order: number }[]) => void;

    // Quests & Achievements
    quests: DailyQuest[];
    completeQuest: (questId: string) => void;
    newlyUnlocked: string[];
    clearNewlyUnlocked: () => void;
    checkAchievements: () => void;

    // App Settings
    soundEnabled: boolean;
    toggleSound: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Auth & Profile
            user: null,
            login: (username: string) => set({
                user: {
                    id: `u_${Date.now()}`,
                    displayName: username,
                    level: 1,
                    totalXp: 0,
                    currentStreak: 1
                }
            }),
            logout: () => set({ user: null }),
            setSensei: (senseiId: string) => set((state) => ({
                user: state.user ? { ...state.user, senseiId } : null
            })),

            // Progression
            addXp: (amount: number) => set((state) => {
                if (!state.user) return state;
                const newTotalXp = state.user.totalXp + amount;
                // Basic level formula: XP to reach level N = 100 * N^1.5
                // So Level = (XP / 100)^(1/1.5)
                const calculateLevel = (xp: number) => Math.floor(Math.pow(xp / 100, 1 / 1.5)) || 1;
                const newLevel = calculateLevel(newTotalXp);

                const newState = {
                    user: {
                        ...state.user,
                        totalXp: newTotalXp,
                        level: Math.max(state.user.level, newLevel)
                    }
                };
                setTimeout(() => get().checkAchievements(), 0);
                return newState;
            }),

            logWorkout: (workoutName, xpEarned) => set((state) => {
                if (!state.user) return state;
                const newLog = {
                    id: `log-${Date.now()}`,
                    date: new Date().toISOString(),
                    workoutName,
                    xpEarned
                };
                return {
                    user: {
                        ...state.user,
                        battleLog: [newLog, ...(state.user.battleLog || [])]
                    }
                };
            }),

            addWorkout: (name, isCustom, exercises) => set((state) => {
                if (!state.user) return state;
                const newWorkout = {
                    id: `w-${Date.now()}`,
                    name,
                    isCustom,
                    exercises
                };
                const newState = {
                    user: {
                        ...state.user,
                        customWorkouts: [...(state.user.customWorkouts || []), newWorkout]
                    }
                };
                setTimeout(() => get().checkAchievements(), 0);
                return newState;
            }),

            // Quests & Achievements
            quests: MOCK_QUESTS,
            completeQuest: (questId: string) => set((state) => {
                const quest = state.quests.find(q => q.id === questId);
                if (!quest || quest.isCompleted) return state;

                // Add XP reward directly here or trigger via side-effect. We'll do it together:
                get().addXp(quest.xpReward);

                const newState = {
                    quests: state.quests.map(q =>
                        q.id === questId ? { ...q, isCompleted: true } : q
                    )
                };
                setTimeout(() => get().checkAchievements(), 0);
                return newState;
            }),

            newlyUnlocked: [],
            clearNewlyUnlocked: () => set({ newlyUnlocked: [] }),
            checkAchievements: () => set((state) => {
                if (!state.user) return state;

                const currentUnlocked = state.user.unlockedAchievements || [];
                const newlyUnlockedIds: string[] = [];

                ACHIEVEMENTS.forEach(ach => {
                    if (!currentUnlocked.includes(ach.id) && ach.condition(state)) {
                        newlyUnlockedIds.push(ach.id);
                    }
                });

                if (newlyUnlockedIds.length > 0) {
                    return {
                        user: {
                            ...state.user,
                            unlockedAchievements: [...currentUnlocked, ...newlyUnlockedIds]
                        },
                        newlyUnlocked: [...state.newlyUnlocked, ...newlyUnlockedIds]
                    };
                }

                return state;
            }),

            // App Settings
            soundEnabled: true,
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
        }),
        {
            name: 'animeworkout-storage',
        }
    )
);
