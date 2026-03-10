import { create } from 'zustand';
import type {
    UserProfile, Pillar, PillarXP, AppMode, CustomTask,
    DailyHabit, DailyQuest, PillarTask,
} from '@limit-break/core';
import { calcXpFromDifficulty, calculateGlobalXpLevel, ALL_PILLARS, MOCK_QUESTS, ACHIEVEMENTS, getLevelProgress } from '@limit-break/core';
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
    showLevelUpModal: boolean;
    lastSeenLevel: number | null;
    levelUpQueue: number[];

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
    addCustomTaskWithChapters: (title: string, pillar: Pillar | 'general', difficulty: number, chapters: { title: string; id: string; xpReward?: number; pdfFile?: string }[], tags?: string[]) => Promise<void>;
    completeCustomTask: (taskId: string, notes?: string) => Promise<void>;
    completeTaskChapter: (taskId: string, chapterId: string, notes?: string) => Promise<void>;
    deleteCustomTask: (taskId: string) => Promise<void>;

    addDailyHabit: (title: string, pillar: Pillar | 'general', difficulty: number) => Promise<void>;
    completeDailyHabit: (habitId: string) => Promise<void>;
    failDailyHabit: (habitId: string) => Promise<void>;
    deleteDailyHabit: (habitId: string) => Promise<void>;

    completeMainTask: (pillar: Pillar) => Promise<void>;

    addWorkout: (name: string, isCustom: boolean, exercises: any[]) => Promise<void>;
    logWorkout: (workoutName: string, xpEarned: number) => Promise<void>;
    deleteWorkout: (id: string) => Promise<void>;

    completeTutorial: () => Promise<void>;
    completeQuest: (questId: string) => void;
    clearNewlyUnlocked: () => void;
    checkAchievements: () => void;
    toggleSound: () => void;
    setChallengeStartDate: (date: string) => Promise<void>;
    closeLevelUpModal: () => void;
    setShowLevelUpModal: (show: boolean) => void;
}

// ── Store ──────────────────────────────────────────────────────────
export const useStore = create<AppState>()((set, get) => ({
    user: null,
    isHydrated: false,
    quests: MOCK_QUESTS,
    newlyUnlocked: [],
    soundEnabled: true,
    showLevelUpModal: false,
    lastSeenLevel: null,
    levelUpQueue: [],

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

                // Refresh daily quests if the date has rolled over
                const today = getTodayStr();
                const currentQuests = get().quests;
                const requiresRefresh = currentQuests.some(q => q.date !== today);
                const updatedQuests = requiresRefresh
                    ? MOCK_QUESTS.map(q => ({ ...q, date: today, isCompleted: false }))
                    : currentQuests;

                set({
                    user: {
                        ...profile,
                        pillarXp,
                        customTasks: tasks,
                        dailyHabits: habits,
                        customWorkouts: workouts,
                        battleLog: battleLog
                    },
                    quests: updatedQuests,
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

        // Capture previous total XP to check stage progress later
        const previousTotalXp = state.user.globalXp || 0;
        const currentLevelObj = getLevelProgress(previousTotalXp);

        await xpRepo.addXp(pillar, amount);
        const updatedPillarXp = await xpRepo.getAll();
        const updatedGlobalXp = previousTotalXp + amount;
        const newGlobalLevel = calculateGlobalXpLevel(updatedGlobalXp);

        await profileRepo.update({ globalXp: updatedGlobalXp, globalLevel: Math.max(state.user.globalLevel || 1, newGlobalLevel) });

        // Calculate new level and check if we leveled up
        const newLevelObj = getLevelProgress(updatedGlobalXp);
        let leveledUp = false;
        let nextLastSeenLevel = state.lastSeenLevel || currentLevelObj.currentLevel;
        let nextQueue = [...(state.levelUpQueue || [])];

        if (newLevelObj.currentLevel > nextLastSeenLevel) {
            leveledUp = true;
            for (let l = nextLastSeenLevel + 1; l <= newLevelObj.currentLevel; l++) {
                if (!nextQueue.includes(l)) nextQueue.push(l);
            }
            nextLastSeenLevel = newLevelObj.currentLevel;
        }

        set({
            user: {
                ...state.user!,
                pillarXp: updatedPillarXp,
                globalXp: updatedGlobalXp,
                globalLevel: Math.max(state.user!.globalLevel || 1, newGlobalLevel),
            },
            ...(leveledUp ? { showLevelUpModal: true, levelUpQueue: nextQueue, lastSeenLevel: nextLastSeenLevel } : {}),
            ...(!state.lastSeenLevel ? { lastSeenLevel: newLevelObj.currentLevel } : {})
        });
        setTimeout(() => get().checkAchievements(), 0);
    },

    addXp: async (amount: number) => {
        const state = get();
        if (!state.user) return;
        const db = await getDatabase();
        const profileRepo = new ProfileRepo(db);

        const previousTotalXp = state.user.globalXp || 0;
        const currentLevelObj = getLevelProgress(previousTotalXp);

        const updatedGlobalXp = previousTotalXp + amount;
        const newGlobalLevel = calculateGlobalXpLevel(updatedGlobalXp);

        await profileRepo.update({ globalXp: updatedGlobalXp, globalLevel: Math.max(state.user.globalLevel || 1, newGlobalLevel) });

        const newLevelObj = getLevelProgress(updatedGlobalXp);
        let leveledUp = false;
        let nextLastSeenLevel = state.lastSeenLevel || currentLevelObj.currentLevel;
        let nextQueue = [...(state.levelUpQueue || [])];

        if (newLevelObj.currentLevel > nextLastSeenLevel) {
            leveledUp = true;
            for (let l = nextLastSeenLevel + 1; l <= newLevelObj.currentLevel; l++) {
                if (!nextQueue.includes(l)) nextQueue.push(l);
            }
            nextLastSeenLevel = newLevelObj.currentLevel;
        }

        set({
            user: { ...state.user, globalXp: updatedGlobalXp, globalLevel: Math.max(state.user!.globalLevel || 1, newGlobalLevel) },
            ...(leveledUp ? { showLevelUpModal: true, levelUpQueue: nextQueue, lastSeenLevel: nextLastSeenLevel } : {}),
            ...(!state.lastSeenLevel ? { lastSeenLevel: newLevelObj.currentLevel } : {})
        });
        setTimeout(() => get().checkAchievements(), 0);
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

        // If chapters have individual xpReward, sum them; otherwise use old formula
        const hasPerChapterXp = chapters.some(c => (c as any).xpReward != null);
        const totalXp = hasPerChapterXp
            ? chapters.reduce((sum, c) => sum + ((c as any).xpReward || 0), 0)
            : calcXpFromDifficulty(difficulty) + (chapters.length * 5);

        const taskChapters = chapters.map(c => ({
            id: c.id,
            title: c.title,
            isCompleted: false,
            ...(hasPerChapterXp ? { xpReward: (c as any).xpReward || 0 } : {}),
            ...((c as any).pdfFile ? { pdfFile: (c as any).pdfFile } : {}),
        }));

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

        // Use per-chapter XP if available, otherwise divide equally
        const xpForThisChapter = chapter.xpReward != null
            ? chapter.xpReward
            : Math.ceil(task.xpReward / task.chapters.length);

        const db = await getDatabase();
        const taskRepo = new TaskRepo(db);
        await taskRepo.updateChapters(taskId, updatedChapters);
        if (allDone) await taskRepo.complete(taskId);

        // Award XP
        if (xpForThisChapter > 0) {
            if (task.pillar !== 'general') {
                await get().addPillarXp(task.pillar, xpForThisChapter);
            } else {
                const perPillar = Math.ceil(xpForThisChapter / 4);
                for (const p of ALL_PILLARS) await get().addPillarXp(p, perPillar);
            }
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

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        let newStreak = 1;
        if (habit.lastCompletedDate === yesterday) {
            newStreak = (habit.streak || 0) + 1;
        }

        const db = await getDatabase();
        const habitRepo = new HabitRepo(db);
        await habitRepo.complete(habitId, today, newStreak);

        // Calculate XP reward: Exponential multiplier up to 2.5x base for a 5-day streak
        const streakBonusMultiplier = 1 + ((newStreak - 1) * 0.35); // Day 1: 1x, Day 2: 1.35x, Day 5: 2.4x
        const earnedXp = Math.floor(habit.xpReward * streakBonusMultiplier);

        if (habit.pillar !== 'general') {
            await get().addPillarXp(habit.pillar, earnedXp);
        } else {
            const perPillar = Math.ceil(earnedXp / 4);
            for (const p of ALL_PILLARS) await get().addPillarXp(p, perPillar);
        }

        set(s => ({
            user: s.user ? {
                ...s.user,
                dailyHabits: (s.user.dailyHabits || []).map(h =>
                    h.id === habitId ? { ...h, lastCompletedDate: today, streak: newStreak } : h
                ),
            } : null,
        }));
    },

    failDailyHabit: async (habitId) => {
        const state = get();
        if (!state.user) return;
        const habit = (state.user.dailyHabits || []).find(h => h.id === habitId);
        if (!habit) return;
        const today = getTodayStr();
        if (habit.lastCompletedDate === today) return; // already acted today

        const db = await getDatabase();
        const habitRepo = new HabitRepo(db);
        await habitRepo.fail(habitId, today);

        set(s => ({
            user: s.user ? {
                ...s.user,
                dailyHabits: (s.user.dailyHabits || []).map(h =>
                    h.id === habitId ? { ...h, lastCompletedDate: today, streak: 0 } : h
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

    completeMainTask: async (pillar: Pillar) => {
        const state = get();
        if (!state.user) return;

        const currentProgress = state.user.mainTaskProgress || { physical: 0, mental: 0, wealth: 0, vitality: 0 };
        const currentPillarIndex = currentProgress[pillar] || 0;
        if (currentPillarIndex >= 15) return; // Maxed out

        const newProgress = { ...currentProgress, [pillar]: currentPillarIndex + 1 };

        const db = await getDatabase();
        const profileRepo = new ProfileRepo(db);
        await profileRepo.update({ mainTaskProgress: newProgress });

        set({
            user: { ...state.user, mainTaskProgress: newProgress }
        });

        await get().addPillarXp(pillar, 50);
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

    setChallengeStartDate: async (date: string) => {
        const state = get();
        if (!state.user) return;
        const db = await getDatabase();
        const profileRepo = new ProfileRepo(db);
        await profileRepo.update({ challengeStartDate: date });
        set({ user: { ...state.user, challengeStartDate: date } });
    },

    closeLevelUpModal: () => set(state => {
        const nextQueue = (state.levelUpQueue || []).slice(1);
        if (nextQueue.length > 0) {
            setTimeout(() => get().setShowLevelUpModal(true), 300);
            return { showLevelUpModal: false, levelUpQueue: nextQueue };
        }
        return { showLevelUpModal: false, levelUpQueue: [] };
    }),

    setShowLevelUpModal: (show: boolean) => set({ showLevelUpModal: show }),
}));
