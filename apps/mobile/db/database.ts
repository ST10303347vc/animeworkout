import * as SQLite from 'expo-sqlite';
import { V1_MIGRATION } from './migrations/v1';

// ── Database Singleton ─────────────────────────────────────────────
let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Opens (or returns the existing) database connection.
 * Runs all pending migrations on first open.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (_db) return _db;

    _db = await SQLite.openDatabaseAsync('limitbreak.db');

    // Enable WAL mode for better concurrent read/write performance
    await _db.execAsync('PRAGMA journal_mode = WAL;');

    // Run migrations
    await runMigrations(_db);

    return _db;
}

/**
 * Migration runner — checks current schema version and applies pending migrations.
 */
async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
    // Check if schema_version table exists
    const tableCheck = await db.getFirstAsync<{ count: number }>(
        `SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='schema_version'`
    );

    let currentVersion = 0;
    if (tableCheck && tableCheck.count > 0) {
        const row = await db.getFirstAsync<{ version: number }>('SELECT MAX(version) as version FROM schema_version');
        currentVersion = row?.version || 0;
    }

    // Apply V1 if not yet applied
    if (currentVersion < 1) {
        console.log('[DB] Applying migration V1...');
        await db.execAsync(V1_MIGRATION);
        console.log('[DB] Migration V1 applied successfully.');
    }

    // Future migrations go here:
    if (currentVersion < 2) {
        console.log('[DB] Applying migration V2...');
        try {
            await db.execAsync(`ALTER TABLE user_profile ADD COLUMN challenge_start_date TEXT;`);
        } catch (e) {
            console.log('[DB] Column challenge_start_date might already exist.', e);
        }
        await db.execAsync(`INSERT OR REPLACE INTO schema_version (version) VALUES (2);`);
        console.log('[DB] Migration V2 applied successfully.');
    }

    if (currentVersion < 3) {
        console.log('[DB] Applying migration V3...');
        try {
            await db.execAsync(`ALTER TABLE daily_habits ADD COLUMN streak INTEGER DEFAULT 0;`);
        } catch (e) {
            console.log('[DB] Column streak might already exist in daily_habits.', e);
        }
        await db.execAsync(`INSERT OR REPLACE INTO schema_version (version) VALUES (3);`);
        console.log('[DB] Migration V3 applied successfully.');
    }

    if (currentVersion < 4) {
        console.log('[DB] Applying migration V4...');
        try {
            await db.execAsync(`ALTER TABLE user_profile ADD COLUMN main_task_progress TEXT DEFAULT '{}';`);
        } catch (e) {
            console.log('[DB] Column main_task_progress might already exist in user_profile.', e);
        }
        await db.execAsync(`INSERT OR REPLACE INTO schema_version (version) VALUES (4);`);
        console.log('[DB] Migration V4 applied successfully.');
    }
}

/**
 * Closes the database connection (for testing or cleanup).
 */
export async function closeDatabase(): Promise<void> {
    if (_db) {
        await _db.closeAsync();
        _db = null;
    }
}
