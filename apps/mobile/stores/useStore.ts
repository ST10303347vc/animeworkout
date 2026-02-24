import { create } from 'zustand';
import type {
    UserProfile, Pillar, PillarXP, AppMode, CustomTask,
    DailyHabit, DailyQuest, PillarTask,
} from '@limit-break/core';
import { calcXpFromDifficulty, calculateGlobalXpLevel, ALL_PILLARS, MOCK_QUESTS, ACHIEVEMENTS } from '@limit-break/core';
import { getDatabase, ProfileRepo, XpRepo, TaskRepo, HabitRepo, BattleLogRepo, SyncRepo, WorkoutRepo } from '../db';

// ── Helpers ────────────────────────────────────────────────────────
function getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
}

// ── Store Interface ────────────────────────────────────────────────
interface AppState {
    // ── State ──────────────────────────────────────────────────────
    user: UserProfile | null;
    isHydrated: boolean;
    quests: DailyQuest[];
    newlyUnlocked: string[];
    soundEnabled: boolean;

    // ── Actions ────────────────────────────────────────────────────
    hydrate: () => Promise<void>;
    login: (username: string) => Promise<void>;
    logout: () => Promise<void>;
    setSensei: (senseiId: string) => Promise<void>;

    setAppMode: (mode: AppMode, enabledPillars?: Pillar[]) => Promise<void>;
    togglePillar: (pillar: Pillar) => Promise<void>;

    addPillarXp: (pillar: Pillar, amount: number) => Promise<void>;
    addXp: (amount: number) => Promise<void>;

    addCustomTask: (title: string, pillar: Pillar | 'general', difficulty: number) => Promise<void>;
    addCustomTaskWithChapters: (title: string, pillar: Pillar | 'general', difficulty: number, chapters: { title: string; id: string }[], tags?: string[]) => Promise<void>;
    completeCustomTask: (taskId: string, notes?: string) => Promise<void>;
    completeTaskChapter: (taskId: string, chapterId: string, notes?: string) => Promise<void>;
    deleteCustomTask: (taskId: string) => Promise<void>;

    addDailyHabit: (title: string, pillar: Pillar | 'general', difficulty: number) => Promise<void>;
    completeDailyHabit: (habitId: string) => Promise<void>;
    deleteDailyHabit: (habitId: string) => Promise<void>;

    addWorkout: (name: string, isCustom: boolean, exercises: any[]) => Promise<void>;
    logWorkout: (workoutName: string, xpEarned: number) => Promise<void>;
    deleteWorkout: (id: string) => Promise<void>;

    completeTutorial: () => Promise<void>;
    completeQuest: (questId: string) => void;
    clearNewlyUnlocked: () => void;
    checkAchievements: () => void;
    toggleSound: () => void;
}

// ── Store ──────────────────────────────────────────────────────────
export const useStore = create<AppState>()((set, get) => ({
    user: null,
    isHydrated: false,
    quests: MOCK_QUESTS,
    newlyUnlocked: [],
    soundEnabled: true,

    // ── Hydrate from SQLite on app start ───────────────────────────
    hydrate: async () => {
        try {
            const db = await getDatabase();
            const profileRepo = new ProfileRepo(db);
            const xpRepo = new XpRepo(db);
            const taskRepo = new TaskRepo(db);
            const habitRepo = new HabitRepo(db);
            const workoutRepo = new WorkoutRepo(db);
            const battleLogRepo = new BattleLogRepo(db);

            const profile = await profileRepo.get();
            if (profile) {
                const pillarXp = await xpRepo.getAll();
                const tasks = await taskRepo.getActive();
                const habits = await habitRepo.getAll();
                const workouts = await workoutRepo.getAll();
                const battleLog = await battleLogRepo.getAll();

                set({
                    user: {
                        ...profile,
                        pillarXp,
                        customTasks: tasks,
                        dailyHabits: habits,
                        customWorkouts: workouts,
                        battleLog: battleLog
                    },
                    isHydrated: true,
                });
            } else {
                set({ isHydrated: true });
            }
        } catch (e) {
            console.error('[Store] Hydration failed:', e);
            set({ isHydrated: true }); // Still mark as hydrated to unblock UI
        }
    },

    // ── Auth ───────────────────────────────────────────────────────
    login: async (username: string) => {
        const db = await getDatabase();
        const profileRepo = new ProfileRepo(db);
        const id = `u_${Date.now()}`;
        const profile = await profileRepo.create(id, username);
        const xpRepo = new XpRepo(db);
        const pillarXp = await xpRepo.getAll();

        set({
            user: {
                ...profile,
                pillarXp,
                customTasks: [],
                dailyHabits: [],
            },
        });
    },

    logout: async () => {
        try {
            const db = await getDatabase();
            // Delete ALL data from every table (using correct table names from migration)
            await db.execAsync(`
                DELETE FROM battle_log;
                DELETE FROM custom_workouts;
                DELETE FROM daily_habits;
                DELETE FROM custom_tasks;
                DELETE FROM user_achievements;
                DELETE FROM daily_quests;
                DELETE FROM sync_queue;
                DELETE FROM pillar_xp;
                DELETE FROM user_profile;
                INSERT OR IGNORE INTO pillar_xp (pillar, xp) VALUES ('physical', 0);
                INSERT OR IGNORE INTO pillar_xp (pillar, xp) VALUES ('mental', 0);
                INSERT OR IGNORE INTO pillar_xp (pillar, xp) VALUES ('wealth', 0);
                INSERT OR IGNORE INTO pillar_xp (pillar, xp) VALUES ('vitality', 0);
            `);
        } catch (e) {
            console.error('[Store] Logout cleanup failed:', e);
        }
        set({ user: null, quests: MOCK_QUESTS, newlyUnlocked: [] });
    },

    setSensei: async (senseiId: string) => {
        const db = await getDatabase();
        const profileRepo = new ProfileRepo(db);
        await profileRepo.update({ senseiId });
        set(state => ({
            user: state.user ? { ...state.user, senseiId } : null,
        }));
    },

    // ── App Mode ──────────────────────────────────────────────────
    setAppMode: async (mode: AppMode, enabledPillars?: Pillar[]) => {
        const state = get();
        if (!state.user) return;
        let pillars: Pillar[];
        if (mode === 'tasks-only') pillars = [];
        else if (mode === 'full') pillars = [...ALL_PILLARS];
        else pillars = enabledPillars || state.user.settings?.enabledPillars || [];

        const db = await getDatabase();
        const profileRepo = new ProfileRepo(db);
        await profileRepo.update({ appMode: mode, enabledPillars: pillars });

        set({
            user: { ...state.user, settings: { appMode: mode, enabledPillars: pillars } },
        });
    },

    togglePillar: async (pillar: Pillar) => {
        const state = get();
        if (!state.user) return;
        const current = state.user.settings?.enabledPillars || [];
        const next = current.includes(pillar) ? current.filter(p => p !== pillar) : [...current, pillar];

        const db = await getDatabase();
        const profileRepo = new ProfileRepo(db);
        await profileRepo.update({ enabledPillars: next });

        set({
            user: { ...state.user, settings: { ...state.user.settings!, enabledPillars: next } },
        });
    },

    // ── XP ─────────────────────────────────────────────────────────
    addPillarXp: async (pillar: Pillar, amount: number) => {
        const state = get();
        if (!state.user) return;

        const db = await getDatabase();
        const xpRepo = new XpRepo(db);
        const profileRepo = new ProfileRepo(db);

        await xpRepo.addXp(pillar, amount);
        const updatedPillarXp = await xpRepo.getAll();
        const updatedGlobalXp = (state.user.globalXp || 0) + amount;
        const newGlobalLevel = calculateGlobalXpLevel(updatedGlobalXp);

        await profileRepo.update({ globalXp: updatedGlobalXp, globalLevel: Math.max(state.user.globalLevel || 1, newGlobalLevel) });

        set({
            user: {
                ...state.user!,
                pillarXp: updatedPillarXp,
                globalXp: updatedGlobalXp,
                globalLevel: Math.max(state.user!.globalLevel || 1, newGlobalLevel),
            },
        });
        setTimeout(() => get().checkAchievements(), 0);
    },

    addXp: async (amount: number) => {
        await get().addPillarXp('physical', amount);
    },

    // ── Custom Tasks ──────────────────────────────────────────────
    addCustomTask: async (title, pillar, difficulty) => {
        const state = get();
        if (!state.user) return;
        const db = await getDatabase();
        const taskRepo = new TaskRepo(db);
        const task = await taskRepo.create({
            title, pillar, difficulty,
            xpReward: calcXpFromDifficulty(difficulty),
        });
        set({ user: { ...state.user, customTasks: [task, ...(state.user.customTasks || [])] } });
    },

    addCustomTaskWithChapters: async (title, pillar, difficulty, chapters, tags) => {
        const state = get();
        if (!state.user) return;
        const baseXp = calcXpFromDifficulty(difficulty);
        const totalXp = baseXp + (chapters.length * 5);
        const taskChapters = chapters.map(c => ({ id: c.id, title: c.title, isCompleted: false }));

        const db = await getDatabase();
        const taskRepo = new TaskRepo(db);
        const task = await taskRepo.create({
            title, pillar, difficulty,
            xpReward: totalXp,
            chapters: taskChapters,
            tags,
        });
        set({ user: { ...state.user, customTasks: [task, ...(state.user.customTasks || [])] } });
    },

    completeTaskChapter: async (taskId, chapterId, notes?) => {
        const state = get();
        if (!state.user) return;
        const task = (state.user.customTasks || []).find(t => t.id === taskId);
        if (!task || task.status === 'completed' || !task.chapters) return;

        const chapter = task.chapters.find(c => c.id === chapterId);
        if (!chapter || chapter.isCompleted) return;

        const updatedChapters = task.chapters.map(c => c.id === chapterId ? { ...c, isCompleted: true, notes } : c);
        const allDone = updatedChapters.every(c => c.isCompleted);
        const xpPerChapter = Math.ceil(task.xpReward / task.chapters.length);

        const db = await getDatabase();
        const taskRepo = new TaskRepo(db);
        await taskRepo.updateChapters(taskId, updatedChapters);
        if (allDone) await taskRepo.complete(taskId);

        // Award XP
        if (task.pillar !== 'general') {
            await get().addPillarXp(task.pillar, xpPerChapter);
        } else {
            const perPillar = Math.ceil(xpPerChapter / 4);
            for (const p of ALL_PILLARS) await get().addPillarXp(p, perPillar);
        }

        set(s => ({
            user: s.user ? {
                ...s.user,
                customTasks: (s.user.customTasks || []).map(t =>
                    t.id === taskId
                        ? { ...t, chapters: updatedChapters, ...(allDone ? { status: 'completed' as const, completedAt: new Date().toISOString() } : {}) }
                        : t
                ),
            } : null,
        }));
    },

    completeCustomTask: async (taskId, notes?) => {
        const state = get();
        if (!state.user) return;
        const task = (state.user.customTasks || []).find(t => t.id === taskId);
        if (!task || task.status === 'completed') return;

        const db = await getDatabase();
        const taskRepo = new TaskRepo(db);
        await taskRepo.complete(taskId, notes);

        // Calculate remaining XP
        let xpToPayout = task.xpReward;
        if (task.chapters) {
            const completedCount = task.chapters.filter(c => c.isCompleted).length;
            const xpPerChapter = Math.ceil(task.xpReward / task.chapters.length);
            xpToPayout = xpPerChapter * (task.chapters.length - completedCount);
        }

        if (xpToPayout > 0) {
            if (task.pillar !== 'general') {
                await get().addPillarXp(task.pillar, xpToPayout);
            } else {
                const perPillar = Math.ceil(xpToPayout / 4);
                for (const p of ALL_PILLARS) await get().addPillarXp(p, perPillar);
            }
        }

        set(s => ({
            user: s.user ? {
                ...s.user,
                customTasks: (s.user.customTasks || []).map(t =>
                    t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString(), notes: notes || t.notes } : t
                ),
            } : null,
        }));
    },

    deleteCustomTask: async (taskId) => {
        const state = get();
        if (!state.user) return;
        const db = await getDatabase();
        const taskRepo = new TaskRepo(db);
        await taskRepo.delete(taskId);
        set({ user: { ...state.user, customTasks: (state.user.customTasks || []).filter(t => t.id !== taskId) } });
    },

    // ── Daily Habits ──────────────────────────────────────────────
    addDailyHabit: async (title, pillar, difficulty) => {
        const state = get();
        if (!state.user) return;
        const db = await getDatabase();
        const habitRepo = new HabitRepo(db);
        const habit = await habitRepo.create({
            title, pillar, difficulty,
            xpReward: calcXpFromDifficulty(difficulty),
        });
        set({ user: { ...state.user, dailyHabits: [...(state.user.dailyHabits || []), habit] } });
    },

    completeDailyHabit: async (habitId) => {
        const state = get();
        if (!state.user) return;
        const habit = (state.user.dailyHabits || []).find(h => h.id === habitId);
        if (!habit) return;
        const today = getTodayStr();
        if (habit.lastCompletedDate === today) return;

        const db = await getDatabase();
        const habitRepo = new HabitRepo(db);
        await habitRepo.complete(habitId, today);

        if (habit.pillar !== 'general') {
            await get().addPillarXp(habit.pillar, habit.xpReward);
        } else {
            const perPillar = Math.ceil(habit.xpReward / 4);
            for (const p of ALL_PILLARS) await get().addPillarXp(p, perPillar);
        }

        set(s => ({
            user: s.user ? {
                ...s.user,
                dailyHabits: (s.user.dailyHabits || []).map(h =>
                    h.id === habitId ? { ...h, lastCompletedDate: today } : h
                ),
            } : null,
        }));
    },

    deleteDailyHabit: async (habitId) => {
        const state = get();
        if (!state.user) return;
        const db = await getDatabase();
        const habitRepo = new HabitRepo(db);
        await habitRepo.delete(habitId);
        set({ user: { ...state.user, dailyHabits: (state.user.dailyHabits || []).filter(h => h.id !== habitId) } });
    },

    // ── Workouts ──────────────────────────────────────────────────
    addWorkout: async (name, isCustom, exercises) => {
        const state = get();
        if (!state.user) return;
        const db = await getDatabase();
        const workoutRepo = new WorkoutRepo(db);
        const workout = await workoutRepo.create({
            id: `w_${Date.now()}`,
            name,
            isCustom,
            exercises
        });
        set({ user: { ...state.user, customWorkouts: [workout, ...(state.user.customWorkouts || [])] } });
    },

    logWorkout: async (workoutName, xpEarned) => {
        const state = get();
        if (!state.user) return;
        const db = await getDatabase();
        const logRepo = new BattleLogRepo(db);
        const entry = await logRepo.create(workoutName, xpEarned);

        set(s => ({
            user: s.user ? { ...s.user, battleLog: [entry, ...(s.user.battleLog || [])] } : null
        }));
    },

    deleteWorkout: async (id) => {
        const state = get();
        if (!state.user) return;
        const db = await getDatabase();
        const workoutRepo = new WorkoutRepo(db);
        await workoutRepo.delete(id);
        set({ user: { ...state.user, customWorkouts: (state.user.customWorkouts || []).filter(w => w.id !== id) } });
    },

    // ── Tutorial & Quests ─────────────────────────────────────────
    completeTutorial: async () => {
        const db = await getDatabase();
        const profileRepo = new ProfileRepo(db);
        await profileRepo.update({ hasSeenTutorial: true });
        set(s => ({
            user: s.user ? { ...s.user, hasSeenTutorial: true } : null,
        }));
    },

    completeQuest: (questId: string) => {
        const state = get();
        const quest = state.quests.find(q => q.id === questId);
        if (!quest || quest.isCompleted) return;
        get().addPillarXp(quest.pillar, quest.xpReward);
        setTimeout(() => get().checkAchievements(), 0);
        set({ quests: state.quests.map(q => q.id === questId ? { ...q, isCompleted: true } : q) });
    },

    clearNewlyUnlocked: () => set({ newlyUnlocked: [] }),

    checkAchievements: () => set(state => {
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
                newlyUnlocked: [...state.newlyUnlocked, ...newlyUnlockedIds],
            };
        }
        return state;
    }),

    toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
}));
