import * as SQLite from 'expo-sqlite';
import type { UserProfile, Pillar, AppMode } from '@limit-break/core';

/** Raw row from user_profile table */
interface ProfileRow {
    id: string;
    display_name: string;
    avatar_url: string | null;
    sensei_id: string | null;
    global_xp: number;
    global_level: number;
    current_streak: number;
    has_seen_tutorial: number;
    app_mode: string;
    enabled_pillars: string;
    challenge_start_date: string | null;
    main_task_progress: string;
    created_at: string;
    updated_at: string;
}

export class ProfileRepo {
    constructor(private db: SQLite.SQLiteDatabase) { }

    /** Get the current user profile, or null if none exists */
    async get(): Promise<UserProfile | null> {
        const row = await this.db.getFirstAsync<ProfileRow>('SELECT * FROM user_profile LIMIT 1');
        if (!row) return null;
        return this.rowToProfile(row);
    }

    /** Create a new profile */
    async create(id: string, displayName: string): Promise<UserProfile> {
        await this.db.runAsync(
            `INSERT INTO user_profile (id, display_name) VALUES (?, ?)`,
            [id, displayName]
        );
        return (await this.get())!;
    }

    /** Update specific profile fields */
    async update(fields: Partial<{
        displayName: string;
        avatarUrl: string;
        senseiId: string;
        globalXp: number;
        globalLevel: number;
        currentStreak: number;
        hasSeenTutorial: boolean;
        appMode: AppMode;
        enabledPillars: Pillar[];
        challengeStartDate: string;
        mainTaskProgress: Record<Pillar, number>;
    }>): Promise<void> {
        const sets: string[] = [];
        const values: any[] = [];

        if (fields.displayName !== undefined) { sets.push('display_name = ?'); values.push(fields.displayName); }
        if (fields.avatarUrl !== undefined) { sets.push('avatar_url = ?'); values.push(fields.avatarUrl); }
        if (fields.senseiId !== undefined) { sets.push('sensei_id = ?'); values.push(fields.senseiId); }
        if (fields.globalXp !== undefined) { sets.push('global_xp = ?'); values.push(fields.globalXp); }
        if (fields.globalLevel !== undefined) { sets.push('global_level = ?'); values.push(fields.globalLevel); }
        if (fields.currentStreak !== undefined) { sets.push('current_streak = ?'); values.push(fields.currentStreak); }
        if (fields.hasSeenTutorial !== undefined) { sets.push('has_seen_tutorial = ?'); values.push(fields.hasSeenTutorial ? 1 : 0); }
        if (fields.appMode !== undefined) { sets.push('app_mode = ?'); values.push(fields.appMode); }
        if (fields.enabledPillars !== undefined) { sets.push('enabled_pillars = ?'); values.push(JSON.stringify(fields.enabledPillars)); }
        if (fields.challengeStartDate !== undefined) { sets.push('challenge_start_date = ?'); values.push(fields.challengeStartDate); }
        if (fields.mainTaskProgress !== undefined) { sets.push('main_task_progress = ?'); values.push(JSON.stringify(fields.mainTaskProgress)); }

        if (sets.length === 0) return;
        sets.push("updated_at = datetime('now')");

        await this.db.runAsync(
            `UPDATE user_profile SET ${sets.join(', ')}`,
            values
        );
    }

    /** Delete all profile data (for logout) */
    async clear(): Promise<void> {
        await this.db.runAsync('DELETE FROM user_profile');
    }

    private rowToProfile(row: ProfileRow): UserProfile {
        let parsedProgress = { physical: 0, mental: 0, wealth: 0, vitality: 0 };
        try { if (row.main_task_progress) parsedProgress = JSON.parse(row.main_task_progress); } catch (e) { }

        return {
            id: row.id,
            displayName: row.display_name,
            avatarUrl: row.avatar_url || undefined,
            senseiId: row.sensei_id || undefined,
            globalXp: row.global_xp,
            globalLevel: row.global_level,
            currentStreak: row.current_streak,
            hasSeenTutorial: row.has_seen_tutorial === 1,
            pillarXp: { physical: 0, mental: 0, wealth: 0, vitality: 0 }, // Loaded separately from pillar_xp table
            settings: {
                appMode: row.app_mode as AppMode,
                enabledPillars: JSON.parse(row.enabled_pillars) as Pillar[],
            },
            challengeStartDate: row.challenge_start_date || undefined,
            mainTaskProgress: parsedProgress,
        };
    }
}
