import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { UserProfile, DailyQuest, Pillar, PillarTask, AppMode, CustomTask, DailyHabit, calcXpFromDifficulty, ALL_PILLARS } from '@/types';
import { calculateGlobalLevel } from '@/lib/xp';
import { MOCK_QUESTS } from '@/data/mockData';
import { ACHIEVEMENTS } from '@/data/achievements';

// ── Helpers ────────────────────────────────────────────────────────
function getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
}

/** Ensure user has all required fields (migration from old localStorage) */
function migrateProfile(user: UserProfile): UserProfile {
    let needsMigration = false;
    const migrated = { ...user };

    if (!migrated.settings) {
        migrated.settings = { appMode: 'full', enabledPillars: [...ALL_PILLARS] };
        needsMigration = true;
    }

    if (!migrated.pillarXp) {
        const base = Math.floor((migrated.totalXp || 0) / 4);
        migrated.pillarXp = { physical: base, mental: base, wealth: base, vitality: base };
        needsMigration = true;
    }

    if (!migrated.customTasks) {
        migrated.customTasks = [];
        needsMigration = true;
    }

    if (!migrated.dailyHabits) {
        migrated.dailyHabits = [];
        needsMigration = true;
    }

    return needsMigration ? migrated : user;
}

// ── Store Interface ────────────────────────────────────────────────
interface AppState {
    user: UserProfile | null;
    login: (username: string) => void;
    logout: () => void;
    setSensei: (senseiId: string) => void;

    setAppMode: (mode: AppMode, enabledPillars?: Pillar[]) => void;
    togglePillar: (pillar: Pillar) => void;

    addPillarXp: (pillar: Pillar, amount: number) => void;
    addXp: (amount: number) => void;
    logWorkout: (workoutName: string, xpEarned: number) => void;
    addWorkout: (name: string, isCustom: boolean, exercises: { id: string; exerciseId: string; sets: number; reps: number; order: number }[]) => void;
    logTask: (task: Omit<PillarTask, 'id' | 'completedAt'>) => void;

    addCustomTask: (title: string, pillar: Pillar | 'general', difficulty: number) => void;
    completeCustomTask: (taskId: string) => void;
    deleteCustomTask: (taskId: string) => void;

    addDailyHabit: (title: string, pillar: Pillar | 'general', difficulty: number) => void;
    completeDailyHabit: (habitId: string) => void;
    deleteDailyHabit: (habitId: string) => void;

    completeTutorial: () => void;

    quests: DailyQuest[];
    completeQuest: (questId: string) => void;
    newlyUnlocked: string[];
    clearNewlyUnlocked: () => void;
    checkAchievements: () => void;

    soundEnabled: boolean;
    toggleSound: () => void;
}

// ── Stable constants to prevent infinite re-renders ────────────────
const EMPTY_PILLARS: Pillar[] = [];

// ── Selector hooks ─────────────────────────────────────────────────
export function useEnabledPillars(): Pillar[] {
    return useStore(
        useShallow((state: AppState) => {
            const user = state.user;
            if (!user?.settings) return ALL_PILLARS;
            if (user.settings.appMode === 'tasks-only') return EMPTY_PILLARS;
            return user.settings.enabledPillars || ALL_PILLARS;
        })
    );
}

export function useAppMode(): AppMode {
    return useStore(state => state.user?.settings?.appMode || 'full');
}

// ── Store ──────────────────────────────────────────────────────────
export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            user: null,
            login: (username: string) => set({
                user: {
                    id: `u_${Date.now()}`,
                    displayName: username,
                    pillarXp: { physical: 0, mental: 0, wealth: 0, vitality: 0 },
                    globalLevel: 1,
                    currentStreak: 1,
                    settings: { appMode: 'full', enabledPillars: [...ALL_PILLARS] },
                    customTasks: [],
                    dailyHabits: []
                }
            }),
            logout: () => set({ user: null }),
            setSensei: (senseiId: string) => set((state) => ({
                user: state.user ? { ...state.user, senseiId } : null
            })),

            setAppMode: (mode: AppMode, enabledPillars?: Pillar[]) => set((state) => {
                if (!state.user) return state;
                let pillars: Pillar[];
                if (mode === 'tasks-only') pillars = [];
                else if (mode === 'full') pillars = [...ALL_PILLARS];
                else pillars = enabledPillars || state.user.settings?.enabledPillars || [];
                return { user: { ...state.user, settings: { appMode: mode, enabledPillars: pillars } } };
            }),

            togglePillar: (pillar: Pillar) => set((state) => {
                if (!state.user) return state;
                const current = state.user.settings?.enabledPillars || [];
                const next = current.includes(pillar) ? current.filter(p => p !== pillar) : [...current, pillar];
                return { user: { ...state.user, settings: { ...state.user.settings!, enabledPillars: next } } };
            }),

            addPillarXp: (pillar: Pillar, amount: number) => set((state) => {
                if (!state.user) return state;
                const currentPillarXp = state.user.pillarXp || { physical: 0, mental: 0, wealth: 0, vitality: 0 };
                const updatedPillarXp = { ...currentPillarXp, [pillar]: currentPillarXp[pillar] + amount };
                const newGlobalLevel = calculateGlobalLevel(updatedPillarXp);
                setTimeout(() => get().checkAchievements(), 0);
                return { user: { ...state.user, pillarXp: updatedPillarXp, globalLevel: Math.max(state.user.globalLevel || 1, newGlobalLevel) } };
            }),

            addXp: (amount: number) => get().addPillarXp('physical', amount),

            logWorkout: (workoutName, xpEarned) => set((state) => {
                if (!state.user) return state;
                return { user: { ...state.user, battleLog: [{ id: `log-${Date.now()}`, date: new Date().toISOString(), workoutName, xpEarned }, ...(state.user.battleLog || [])] } };
            }),

            logTask: (task: Omit<PillarTask, 'id' | 'completedAt'>) => set((state) => {
                if (!state.user) return state;
                const newTask: PillarTask = { ...task, id: `task-${Date.now()}`, completedAt: new Date().toISOString() };
                get().addPillarXp(newTask.pillar, newTask.xpReward);
                return { user: { ...state.user, taskLog: [newTask, ...(state.user.taskLog || [])] } };
            }),

            addWorkout: (name, isCustom, exercises) => set((state) => {
                if (!state.user) return state;
                setTimeout(() => get().checkAchievements(), 0);
                return { user: { ...state.user, customWorkouts: [...(state.user.customWorkouts || []), { id: `w-${Date.now()}`, name, isCustom, exercises }] } };
            }),

            // ── Custom Tasks ───────────────────────────────────────────
            addCustomTask: (title: string, pillar: Pillar | 'general', difficulty: number) => set((state) => {
                if (!state.user) return state;
                const task: CustomTask = {
                    id: `ct-${Date.now()}`, title, pillar, difficulty,
                    xpReward: calcXpFromDifficulty(difficulty),
                    status: 'active', createdAt: new Date().toISOString()
                };
                return { user: { ...state.user, customTasks: [task, ...(state.user.customTasks || [])] } };
            }),

            completeCustomTask: (taskId: string) => set((state) => {
                if (!state.user) return state;
                const tasks = state.user.customTasks || [];
                const task = tasks.find(t => t.id === taskId);
                if (!task || task.status === 'completed') return state;

                // Award XP — general tasks spread evenly for leveling
                if (task.pillar !== 'general') {
                    get().addPillarXp(task.pillar, task.xpReward);
                } else {
                    const perPillar = Math.ceil(task.xpReward / 4);
                    ALL_PILLARS.forEach(p => get().addPillarXp(p, perPillar));
                }

                return { user: { ...state.user, customTasks: tasks.map(t => t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() } : t) } };
            }),

            deleteCustomTask: (taskId: string) => set((state) => {
                if (!state.user) return state;
                return { user: { ...state.user, customTasks: (state.user.customTasks || []).filter(t => t.id !== taskId) } };
            }),

            // ── Daily Habits ───────────────────────────────────────────
            addDailyHabit: (title: string, pillar: Pillar | 'general', difficulty: number) => set((state) => {
                if (!state.user) return state;
                const habit: DailyHabit = { id: `dh-${Date.now()}`, title, pillar, difficulty, xpReward: calcXpFromDifficulty(difficulty) };
                return { user: { ...state.user, dailyHabits: [...(state.user.dailyHabits || []), habit] } };
            }),

            completeDailyHabit: (habitId: string) => set((state) => {
                if (!state.user) return state;
                const habits = state.user.dailyHabits || [];
                const habit = habits.find(h => h.id === habitId);
                if (!habit) return state;
                const today = getTodayStr();
                if (habit.lastCompletedDate === today) return state;

                if (habit.pillar !== 'general') {
                    get().addPillarXp(habit.pillar, habit.xpReward);
                } else {
                    const perPillar = Math.ceil(habit.xpReward / 4);
                    ALL_PILLARS.forEach(p => get().addPillarXp(p, perPillar));
                }

                return { user: { ...state.user, dailyHabits: habits.map(h => h.id === habitId ? { ...h, lastCompletedDate: today } : h) } };
            }),

            deleteDailyHabit: (habitId: string) => set((state) => {
                if (!state.user) return state;
                return { user: { ...state.user, dailyHabits: (state.user.dailyHabits || []).filter(h => h.id !== habitId) } };
            }),

            completeTutorial: () => set((state) => {
                if (!state.user) return state;
                return { user: { ...state.user, hasSeenTutorial: true } };
            }),

            quests: MOCK_QUESTS,
            completeQuest: (questId: string) => set((state) => {
                const quest = state.quests.find(q => q.id === questId);
                if (!quest || quest.isCompleted) return state;
                get().addPillarXp(quest.pillar, quest.xpReward);
                setTimeout(() => get().checkAchievements(), 0);
                return { quests: state.quests.map(q => q.id === questId ? { ...q, isCompleted: true } : q) };
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
                        user: { ...state.user, unlockedAchievements: [...currentUnlocked, ...newlyUnlockedIds] },
                        newlyUnlocked: [...state.newlyUnlocked, ...newlyUnlockedIds]
                    };
                }
                return state;
            }),

            soundEnabled: true,
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
        }),
        {
            name: 'animeworkout-storage',
            onRehydrateStorage: () => (state) => {
                if (state?.user) {
                    const migrated = migrateProfile(state.user);
                    if (migrated !== state.user) {
                        useStore.setState({ user: migrated });
                    }
                }
            }
        }
    )
);
