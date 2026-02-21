import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, DailyQuest, Pillar, PillarTask } from '@/types';
import { calculateGlobalLevel } from '@/lib/xp';
import { MOCK_QUESTS } from '@/data/mockData';
import { ACHIEVEMENTS } from '@/data/achievements';

interface AppState {
    // Auth & Profile
    user: UserProfile | null;
    login: (username: string) => void;
    logout: () => void;
    setSensei: (senseiId: string) => void;

    // Progression
    addPillarXp: (pillar: Pillar, amount: number) => void;

    // Legacy mapping support for components still calling addXp
    addXp: (amount: number) => void;

    logWorkout: (workoutName: string, xpEarned: number) => void;
    addWorkout: (name: string, isCustom: boolean, exercises: { id: string; exerciseId: string; sets: number; reps: number; order: number }[]) => void;
    logTask: (task: Omit<PillarTask, 'id' | 'completedAt'>) => void;

    // Onboarding
    completeTutorial: () => void;

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
                    pillarXp: { physical: 0, mental: 0, wealth: 0, vitality: 0 },
                    globalLevel: 1,
                    currentStreak: 1
                }
            }),
            logout: () => set({ user: null }),
            setSensei: (senseiId: string) => set((state) => ({
                user: state.user ? { ...state.user, senseiId } : null
            })),

            // Progression
            addPillarXp: (pillar: Pillar, amount: number) => set((state) => {
                if (!state.user) return state;

                // Handle legacy state migration seamlessly if needed
                const currentPillarXp = state.user.pillarXp || {
                    physical: state.user.totalXp || 0,
                    mental: 0,
                    wealth: 0,
                    vitality: 0
                };

                const updatedPillarXp = {
                    ...currentPillarXp,
                    [pillar]: currentPillarXp[pillar] + amount
                };

                const newGlobalLevel = calculateGlobalLevel(updatedPillarXp);

                const newState = {
                    user: {
                        ...state.user,
                        pillarXp: updatedPillarXp,
                        globalLevel: Math.max(state.user.globalLevel || state.user.level || 1, newGlobalLevel)
                    }
                };

                setTimeout(() => get().checkAchievements(), 0);
                return newState;
            }),

            completeTutorial: () => set((state) => {
                if (!state.user) return state;
                return {
                    user: {
                        ...state.user,
                        hasSeenTutorial: true
                    }
                };
            }),

            addXp: (amount: number) => get().addPillarXp('physical', amount), // Shim for older components

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

            logTask: (task: Omit<PillarTask, 'id' | 'completedAt'>) => set((state) => {
                if (!state.user) return state;
                const newTask: PillarTask = {
                    ...task,
                    id: `task-${Date.now()}`,
                    completedAt: new Date().toISOString()
                };

                // Grant XP
                get().addPillarXp(newTask.pillar, newTask.xpReward);

                const newState = {
                    user: {
                        ...state.user,
                        taskLog: [newTask, ...(state.user.taskLog || [])]
                    }
                };
                return newState;
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

                // Add XP reward to the specific pillar
                get().addPillarXp(quest.pillar, quest.xpReward);

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
