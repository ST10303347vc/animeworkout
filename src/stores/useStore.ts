import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { UserProfile, DailyQuest, Pillar, PillarTask, AppMode, CustomTask, DailyHabit, calcXpFromDifficulty, ALL_PILLARS } from '@/types';
import { calculateGlobalXpLevel } from '@/lib/xp';
import { MOCK_QUESTS } from '@/data/mockData';
import { ACHIEVEMENTS } from '@/data/achievements';
import { pb } from '@/lib/pocketbase';

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

    if (migrated.globalXp === undefined) {
        migrated.globalXp = migrated.totalXp || 0;
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
    login: (username: string) => Promise<void>;
    logout: () => void;
    setSensei: (senseiId: string) => void;

    setAppMode: (mode: AppMode, enabledPillars?: Pillar[]) => void;
    togglePillar: (pillar: Pillar) => void;

    addPillarXp: (pillar: Pillar, amount: number) => void;
    addXp: (amount: number) => void;
    logWorkout: (workoutName: string, xpEarned: number) => void;
    addWorkout: (name: string, isCustom: boolean, exercises: { id: string; exerciseId: string; sets: number; reps: number; order: number }[]) => void;
    logTask: (task: Omit<PillarTask, 'id' | 'completedAt'>) => void;

    addCustomTask: (title: string, pillar: Pillar | 'general', difficulty: number) => Promise<void>;
    addCustomTaskWithChapters: (title: string, pillar: Pillar | 'general', difficulty: number, chapters: { title: string, id: string }[], tags?: string[]) => Promise<void>;
    completeCustomTask: (taskId: string, pbId?: string, notes?: string) => Promise<void>;
    completeTaskChapter: (taskId: string, chapterId: string, pbId?: string, notes?: string) => Promise<void>;
    deleteCustomTask: (taskId: string, pbId?: string) => Promise<void>;

    addDailyHabit: (title: string, pillar: Pillar | 'general', difficulty: number) => Promise<void>;
    completeDailyHabit: (habitId: string, pbId?: string) => Promise<void>;
    deleteDailyHabit: (habitId: string, pbId?: string) => Promise<void>;

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
            login: async (username: string) => {
                let customTasks: CustomTask[] = [];
                let dailyHabits: DailyHabit[] = [];
                try {
                    if (pb.authStore.isValid) {
                        const pbTasks = await pb.collection('custom_tasks').getFullList(200, { sort: '-created' });
                        customTasks = pbTasks.map((t: any) => ({
                            id: t.id, title: t.title, pillar: t.pillar, difficulty: t.difficulty,
                            xpReward: t.xpReward, status: t.status, createdAt: t.created,
                            chapters: t.chapters || undefined
                        }));

                        const pbHabits = await pb.collection('daily_habits').getFullList(200, { sort: '-created' });
                        dailyHabits = pbHabits.map((h: any) => ({
                            id: h.id, title: h.title, pillar: h.pillar, difficulty: h.difficulty,
                            xpReward: h.xpReward, lastCompletedDate: h.lastCompletedDate
                        }));
                    }
                } catch (e) { console.error("Could not fetch data from PB:", e); }

                set({
                    user: {
                        id: pb.authStore.record?.id || `u_${Date.now()}`,
                        displayName: username,
                        pillarXp: { physical: 0, mental: 0, wealth: 0, vitality: 0 },
                        globalLevel: 1,
                        globalXp: 0,
                        currentStreak: 1,
                        settings: { appMode: 'full', enabledPillars: [...ALL_PILLARS] },
                        customTasks,
                        dailyHabits
                    }
                });
            },
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
                const updatedGlobalXp = (state.user.globalXp || 0) + amount;
                const newGlobalLevel = calculateGlobalXpLevel(updatedGlobalXp);
                setTimeout(() => get().checkAchievements(), 0);
                return { user: { ...state.user, pillarXp: updatedPillarXp, globalXp: updatedGlobalXp, globalLevel: Math.max(state.user.globalLevel || 1, newGlobalLevel) } };
            }),

            addXp: (amount: number) => get().addPillarXp('physical', amount),

            logWorkout: (workoutName, xpEarned) => set((state) => {
                if (!state.user) return state;
                return { user: { ...state.user, battleLog: [{ id: `log-${Date.now()}`, date: new Date().toISOString(), workoutName, xpEarned }, ...(state.user.battleLog || [])] } };
            }),

            logTask: (task: Omit<PillarTask, 'id' | 'completedAt'>) => {
                const state = get();
                if (!state.user) return;
                const newTask: PillarTask = { ...task, id: `task-${Date.now()}`, completedAt: new Date().toISOString() };
                get().addPillarXp(newTask.pillar, newTask.xpReward);
                set((s) => {
                    if (!s.user) return s;
                    return { user: { ...s.user, taskLog: [newTask, ...(s.user.taskLog || [])] } };
                });
            },

            addWorkout: (name, isCustom, exercises) => set((state) => {
                if (!state.user) return state;
                setTimeout(() => get().checkAchievements(), 0);
                return { user: { ...state.user, customWorkouts: [...(state.user.customWorkouts || []), { id: `w-${Date.now()}`, name, isCustom, exercises }] } };
            }),

            // ── Custom Tasks ───────────────────────────────────────────
            addCustomTask: async (title: string, pillar: Pillar | 'general', difficulty: number) => {
                const state = get();
                if (!state.user) return;
                try {
                    const record = await pb.collection('custom_tasks').create({
                        user: pb.authStore.record?.id || state.user?.id,
                        title, pillar, difficulty,
                        xpReward: calcXpFromDifficulty(difficulty),
                        status: 'active'
                    });
                    const task: CustomTask = {
                        id: record.id, title, pillar, difficulty,
                        xpReward: calcXpFromDifficulty(difficulty),
                        status: 'active', createdAt: record.created
                    };
                    set({ user: { ...state.user, customTasks: [task, ...(state.user.customTasks || [])] } });
                } catch (e) { console.error(e); }
            },

            addCustomTaskWithChapters: async (title: string, pillar: Pillar | 'general', difficulty: number, chapters: { title: string, id: string }[], tags?: string[]) => {
                const state = get();
                if (!state.user) return;
                const totalChapters = chapters.length;
                const baseXp = calcXpFromDifficulty(difficulty);
                const totalXp = baseXp + (totalChapters * 5); // +5 per chapter
                const taskChapters = chapters.map(c => ({ id: c.id, title: c.title, isCompleted: false }));

                try {
                    const record = await pb.collection('custom_tasks').create({
                        user: pb.authStore.record?.id || state.user?.id,
                        title, pillar, difficulty,
                        xpReward: totalXp,
                        status: 'active',
                        chapters: taskChapters,
                        tags: tags || []
                    });
                    const task: CustomTask = {
                        id: record.id, title, pillar, difficulty,
                        xpReward: totalXp,
                        status: 'active', createdAt: record.created,
                        chapters: taskChapters,
                        tags: tags || []
                    };
                    set({ user: { ...state.user, customTasks: [task, ...(state.user.customTasks || [])] } });
                } catch (e) { console.error(e); }
            },

            completeTaskChapter: async (taskId: string, chapterId: string, pbId?: string, notes?: string) => {
                const initialState = get();
                if (!initialState.user) return;
                const tasks = initialState.user.customTasks || [];
                const task = tasks.find(t => t.id === taskId);
                if (!task || task.status === 'completed' || !task.chapters) return;

                const chapter = task.chapters.find(c => c.id === chapterId);
                if (!chapter || chapter.isCompleted) return;

                const updatedChapters = task.chapters.map(c => c.id === chapterId ? { ...c, isCompleted: true, notes } : c);
                const allDone = updatedChapters.every(c => c.isCompleted);

                // calculate XP slice
                const xpPerChapter = Math.ceil(task.xpReward / task.chapters.length);

                try {
                    if (allDone) {
                        const completedDate = new Date().toISOString();
                        await pb.collection('custom_tasks').update(pbId || taskId, { chapters: updatedChapters, status: 'completed', completedAt: completedDate });
                    } else {
                        await pb.collection('custom_tasks').update(pbId || taskId, { chapters: updatedChapters });
                    }
                } catch (e) { console.error(e); }

                // Award XP slice safely
                if (task.pillar !== 'general') {
                    get().addPillarXp(task.pillar, xpPerChapter);
                } else {
                    const perPillar = Math.ceil(xpPerChapter / 4);
                    ALL_PILLARS.forEach(p => get().addPillarXp(p, perPillar));
                }

                set((state) => {
                    if (!state.user) return state;
                    return {
                        user: {
                            ...state.user,
                            customTasks: (state.user.customTasks || []).map(t => {
                                if (t.id === taskId) {
                                    if (allDone) {
                                        return { ...t, chapters: updatedChapters, status: 'completed' as const, completedAt: new Date().toISOString() };
                                    }
                                    return { ...t, chapters: updatedChapters };
                                }
                                return t;
                            })
                        }
                    };
                });
            },

            completeCustomTask: async (taskId: string, pbId?: string, notes?: string) => {
                const initialState = get();
                if (!initialState.user) return;
                const tasks = initialState.user.customTasks || [];
                const task = tasks.find(t => t.id === taskId);
                if (!task || task.status === 'completed') return;

                const completedDate = new Date().toISOString();
                let updatedChapters = task.chapters;

                // Calculate remaining XP to payout if it has chapters
                let xpRemainingToPayout = task.xpReward;

                if (task.chapters) {
                    // Mark all remaining uncompleted chapters as complete
                    updatedChapters = task.chapters.map(c => ({ ...c, isCompleted: true }));
                    const completedCount = task.chapters.filter(c => c.isCompleted).length;
                    const totalCount = task.chapters.length;
                    const uncompletedCount = totalCount - completedCount;

                    // If there are chapters, payout only what wasn't already paid out
                    const xpPerChapter = Math.ceil(task.xpReward / totalCount);
                    xpRemainingToPayout = xpPerChapter * uncompletedCount;
                }

                try {
                    await pb.collection('custom_tasks').update(pbId || taskId, {
                        status: 'completed',
                        completedAt: completedDate,
                        notes,
                        ...(updatedChapters && { chapters: updatedChapters })
                    });
                } catch (e) { console.error(e); }

                // Award XP safely by updating state AFTER the await
                // First award XP internally using get() so leveling functions
                if (xpRemainingToPayout > 0) {
                    if (task.pillar !== 'general') {
                        get().addPillarXp(task.pillar, xpRemainingToPayout);
                    } else {
                        const perPillar = Math.ceil(xpRemainingToPayout / 4);
                        ALL_PILLARS.forEach(p => get().addPillarXp(p, perPillar));
                    }
                }

                // THEN modify the task list using the freshest state
                set((state) => {
                    if (!state.user) return state;
                    return {
                        user: {
                            ...state.user,
                            customTasks: (state.user.customTasks || []).map(t =>
                                t.id === taskId ? {
                                    ...t,
                                    status: 'completed' as const,
                                    completedAt: completedDate,
                                    notes: notes || t.notes,
                                    ...(updatedChapters && { chapters: updatedChapters })
                                } : t
                            )
                        }
                    };
                });
            },

            deleteCustomTask: async (taskId: string, pbId?: string) => {
                const state = get();
                if (!state.user) return;
                try {
                    await pb.collection('custom_tasks').delete(pbId || taskId);
                } catch (e) { console.error(e); }
                set({ user: { ...state.user, customTasks: (state.user.customTasks || []).filter(t => t.id !== taskId) } });
            },

            // ── Daily Habits ───────────────────────────────────────────
            addDailyHabit: async (title: string, pillar: Pillar | 'general', difficulty: number) => {
                const state = get();
                if (!state.user) return;
                try {
                    const record = await pb.collection('daily_habits').create({
                        user: pb.authStore.record?.id || state.user?.id,
                        title, pillar, difficulty,
                        xpReward: calcXpFromDifficulty(difficulty)
                    });
                    const habit: DailyHabit = { id: record.id, title, pillar, difficulty, xpReward: calcXpFromDifficulty(difficulty) };
                    set({ user: { ...state.user, dailyHabits: [...(state.user.dailyHabits || []), habit] } });
                } catch (e) { console.error(e); }
            },

            completeDailyHabit: async (habitId: string, pbId?: string) => {
                const initialState = get();
                if (!initialState.user) return;
                const habits = initialState.user.dailyHabits || [];
                const habit = habits.find(h => h.id === habitId);
                if (!habit) return;
                const today = getTodayStr();
                if (habit.lastCompletedDate === today) return;

                try {
                    await pb.collection('daily_habits').update(pbId || habitId, { lastCompletedDate: today });
                } catch (e) { console.error(e); }

                if (habit.pillar !== 'general') {
                    get().addPillarXp(habit.pillar, habit.xpReward);
                } else {
                    const perPillar = Math.ceil(habit.xpReward / 4);
                    ALL_PILLARS.forEach(p => get().addPillarXp(p, perPillar));
                }

                set((state) => {
                    if (!state.user) return state;
                    return {
                        user: {
                            ...state.user,
                            dailyHabits: (state.user.dailyHabits || []).map(h =>
                                h.id === habitId ? { ...h, lastCompletedDate: today } : h
                            )
                        }
                    };
                });
            },

            deleteDailyHabit: async (habitId: string, pbId?: string) => {
                const state = get();
                if (!state.user) return;
                try {
                    await pb.collection('daily_habits').delete(pbId || habitId);
                } catch (e) { console.error(e); }
                set({ user: { ...state.user, dailyHabits: (state.user.dailyHabits || []).filter(h => h.id !== habitId) } });
            },

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
