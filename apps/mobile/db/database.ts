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
    // if (currentVersion < 2) { await db.execAsync(V2_MIGRATION); }
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
