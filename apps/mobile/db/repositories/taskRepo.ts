import * as SQLite from 'expo-sqlite';
import type { CustomTask, TaskChapter } from '@limit-break/core';

interface TaskRow {
    id: string;
    title: string;
    pillar: string;
    difficulty: number;
    xp_reward: number;
    status: string;
    chapters: string | null;
    notes: string | null;
    tags: string | null;
    timer_duration: number | null;
    created_at: string;
    completed_at: string | null;
    synced: number;
}

export class TaskRepo {
    constructor(private db: SQLite.SQLiteDatabase) { }

    /** Get all active (non-completed) tasks */
    async getActive(): Promise<CustomTask[]> {
        const rows = await this.db.getAllAsync<TaskRow>(
            'SELECT * FROM custom_tasks WHERE status = ? ORDER BY created_at DESC',
            ['active']
        );
        return rows.map(this.rowToTask);
    }

    /** Get all tasks (active + completed) */
    async getAll(): Promise<CustomTask[]> {
        const rows = await this.db.getAllAsync<TaskRow>(
            'SELECT * FROM custom_tasks ORDER BY created_at DESC'
        );
        return rows.map(this.rowToTask);
    }

    /** Get a single task by ID */
    async getById(id: string): Promise<CustomTask | null> {
        const row = await this.db.getFirstAsync<TaskRow>(
            'SELECT * FROM custom_tasks WHERE id = ?', [id]
        );
        return row ? this.rowToTask(row) : null;
    }

    /** Create a new task */
    async create(task: {
        title: string;
        pillar: string;
        difficulty: number;
        xpReward: number;
        chapters?: { id: string; title: string; isCompleted: boolean; xpReward?: number; pdfFile?: string; isSection?: boolean }[];
        tags?: string[];
    }): Promise<CustomTask> {
        const id = `task-${Date.now()}`;
        await this.db.runAsync(
            `INSERT INTO custom_tasks (id, title, pillar, difficulty, xp_reward, status, chapters, tags)
             VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
            [
                id, task.title, task.pillar, task.difficulty, task.xpReward,
                task.chapters ? JSON.stringify(task.chapters) : null,
                task.tags ? JSON.stringify(task.tags) : null,
            ]
        );

        // Queue for sync
        await this.queueSync(id, 'create', task);

        return (await this.getById(id))!;
    }

    /** Update task chapters (e.g., completing a chapter) */
    async updateChapters(id: string, chapters: TaskChapter[]): Promise<void> {
        await this.db.runAsync(
            'UPDATE custom_tasks SET chapters = ? WHERE id = ?',
            [JSON.stringify(chapters), id]
        );
        await this.queueSync(id, 'update', { chapters });
    }

    /** Complete a task */
    async complete(id: string, notes?: string): Promise<void> {
        const completedAt = new Date().toISOString();
        await this.db.runAsync(
            `UPDATE custom_tasks SET status = 'completed', completed_at = ?, notes = COALESCE(?, notes) WHERE id = ?`,
            [completedAt, notes || null, id]
        );
        await this.queueSync(id, 'update', { status: 'completed', completedAt, notes });
    }

    /** Delete a task */
    async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM custom_tasks WHERE id = ?', [id]);
        await this.queueSync(id, 'delete', null);
    }

    private async queueSync(recordId: string, operation: string, payload: any): Promise<void> {
        await this.db.runAsync(
            `INSERT INTO sync_queue (table_name, record_id, operation, payload) VALUES ('custom_tasks', ?, ?, ?)`,
            [recordId, operation, payload ? JSON.stringify(payload) : null]
        );
    }

    private rowToTask(row: TaskRow): CustomTask {
        return {
            id: row.id,
            title: row.title,
            pillar: row.pillar as any,
            difficulty: row.difficulty,
            xpReward: row.xp_reward,
            status: row.status as 'active' | 'completed',
            chapters: row.chapters ? JSON.parse(row.chapters) : undefined,
            notes: row.notes || undefined,
            tags: row.tags ? JSON.parse(row.tags) : undefined,
            timerDuration: row.timer_duration || undefined,
            createdAt: row.created_at,
            completedAt: row.completed_at || undefined,
        };
    }
}
