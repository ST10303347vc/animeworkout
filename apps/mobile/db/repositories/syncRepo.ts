import * as SQLite from 'expo-sqlite';

interface SyncQueueRow {
    id: number;
    table_name: string;
    record_id: string;
    operation: string;
    payload: string | null;
    created_at: string;
    retries: number;
}

export interface SyncQueueItem {
    id: number;
    tableName: string;
    recordId: string;
    operation: 'create' | 'update' | 'delete';
    payload: any | null;
    createdAt: string;
    retries: number;
}

export class SyncRepo {
    constructor(private db: SQLite.SQLiteDatabase) { }

    /** Get all pending (unsynced) items, ordered by creation time */
    async getPending(limit: number = 50): Promise<SyncQueueItem[]> {
        const rows = await this.db.getAllAsync<SyncQueueRow>(
            'SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT ?',
            [limit]
        );
        return rows.map(this.rowToItem);
    }

    /** Get count of pending items */
    async getPendingCount(): Promise<number> {
        const row = await this.db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM sync_queue'
        );
        return row?.count || 0;
    }

    /** Remove a successfully synced item from the queue */
    async markSynced(id: number): Promise<void> {
        await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
    }

    /** Increment retry count for a failed sync item */
    async incrementRetry(id: number): Promise<void> {
        await this.db.runAsync(
            'UPDATE sync_queue SET retries = retries + 1 WHERE id = ?',
            [id]
        );
    }

    /** Remove items that have exceeded max retries */
    async purgeFailed(maxRetries: number = 10): Promise<number> {
        const result = await this.db.runAsync(
            'DELETE FROM sync_queue WHERE retries >= ?',
            [maxRetries]
        );
        return result.changes;
    }

    /** Clear the entire sync queue (e.g., on full resync) */
    async clearAll(): Promise<void> {
        await this.db.runAsync('DELETE FROM sync_queue');
    }

    private rowToItem(row: SyncQueueRow): SyncQueueItem {
        return {
            id: row.id,
            tableName: row.table_name,
            recordId: row.record_id,
            operation: row.operation as 'create' | 'update' | 'delete',
            payload: row.payload ? JSON.parse(row.payload) : null,
            createdAt: row.created_at,
            retries: row.retries,
        };
    }
}
