import * as SQLite from 'expo-sqlite';

interface BattleLogRow {
    id: string;
    date: string;
    workout_name: string;
    xp_earned: number;
    synced: number;
}

export interface BattleLogEntry {
    id: string;
    date: string;
    workoutName: string;
    xpEarned: number;
}

export class BattleLogRepo {
    constructor(private db: SQLite.SQLiteDatabase) { }

    /** Get all battle log entries, newest first */
    async getAll(): Promise<BattleLogEntry[]> {
        const rows = await this.db.getAllAsync<BattleLogRow>(
            'SELECT * FROM battle_log ORDER BY date DESC'
        );
        return rows.map(this.rowToEntry);
    }

    /** Get recent entries (paginated) */
    async getRecent(limit: number = 20, offset: number = 0): Promise<BattleLogEntry[]> {
        const rows = await this.db.getAllAsync<BattleLogRow>(
            'SELECT * FROM battle_log ORDER BY date DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows.map(this.rowToEntry);
    }

    /** Log a new workout */
    async create(workoutName: string, xpEarned: number): Promise<BattleLogEntry> {
        const id = `log-${Date.now()}`;
        const date = new Date().toISOString();
        await this.db.runAsync(
            'INSERT INTO battle_log (id, date, workout_name, xp_earned) VALUES (?, ?, ?, ?)',
            [id, date, workoutName, xpEarned]
        );
        return { id, date, workoutName, xpEarned };
    }

    /** Get total XP earned from all workouts */
    async getTotalXp(): Promise<number> {
        const row = await this.db.getFirstAsync<{ total: number }>(
            'SELECT COALESCE(SUM(xp_earned), 0) as total FROM battle_log'
        );
        return row?.total || 0;
    }

    /** Get count of workouts */
    async getCount(): Promise<number> {
        const row = await this.db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM battle_log'
        );
        return row?.count || 0;
    }

    private rowToEntry(row: BattleLogRow): BattleLogEntry {
        return {
            id: row.id,
            date: row.date,
            workoutName: row.workout_name,
            xpEarned: row.xp_earned,
        };
    }
}
