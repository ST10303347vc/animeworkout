import * as SQLite from 'expo-sqlite';
import type { DailyHabit } from '@limit-break/core';

interface HabitRow {
    id: string;
    title: string;
    pillar: string;
    difficulty: number;
    xp_reward: number;
    last_completed_date: string | null;
    streak: number;
    synced: number;
}

export class HabitRepo {
    constructor(private db: SQLite.SQLiteDatabase) { }

    /** Get all habits */
    async getAll(): Promise<DailyHabit[]> {
        const rows = await this.db.getAllAsync<HabitRow>(
            'SELECT * FROM daily_habits ORDER BY rowid ASC'
        );
        return rows.map(this.rowToHabit);
    }

    /** Create a new daily habit */
    async create(habit: {
        title: string;
        pillar: string;
        difficulty: number;
        xpReward: number;
    }): Promise<DailyHabit> {
        const id = `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await this.db.runAsync(
            `INSERT INTO daily_habits (id, title, pillar, difficulty, xp_reward, streak)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [id, habit.title, habit.pillar, habit.difficulty, habit.xpReward]
        );
        await this.queueSync(id, 'create', { ...habit, streak: 0 });
        return { id, ...habit, pillar: habit.pillar as any, streak: 0 };
    }

    /** Mark a habit as completed today, incrementing the streak */
    async complete(id: string, date: string, newStreak: number): Promise<void> {
        await this.db.runAsync(
            'UPDATE daily_habits SET last_completed_date = ?, streak = ? WHERE id = ?',
            [date, newStreak, id]
        );
        await this.queueSync(id, 'update', { lastCompletedDate: date, streak: newStreak });
    }

    /** Mark a habit as failed today, resetting the streak to 0 */
    async fail(id: string, date: string): Promise<void> {
        await this.db.runAsync(
            'UPDATE daily_habits SET last_completed_date = ?, streak = 0 WHERE id = ?',
            [date, id]
        );
        await this.queueSync(id, 'update', { lastCompletedDate: date, streak: 0 });
    }

    /** Delete a habit */
    async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM daily_habits WHERE id = ?', [id]);
        await this.queueSync(id, 'delete', null);
    }

    private async queueSync(recordId: string, operation: string, payload: any): Promise<void> {
        await this.db.runAsync(
            `INSERT INTO sync_queue (table_name, record_id, operation, payload) VALUES ('daily_habits', ?, ?, ?)`,
            [recordId, operation, payload ? JSON.stringify(payload) : null]
        );
    }

    private rowToHabit(row: HabitRow): DailyHabit {
        return {
            id: row.id,
            title: row.title,
            pillar: row.pillar as any,
            difficulty: row.difficulty,
            xpReward: row.xp_reward,
            lastCompletedDate: row.last_completed_date || undefined,
            streak: row.streak || 0,
        };
    }
}
