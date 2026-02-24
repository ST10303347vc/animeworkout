/**
 * V1 Migration — Initial SQLite schema for Limit Break mobile app.
 * Maps 1:1 with the web app's data model (UserProfile, CustomTask, etc.)
 */

export const V1_MIGRATION = `
-- User profile (single row, local-only)
CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    sensei_id TEXT,
    global_xp INTEGER DEFAULT 0,
    global_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    has_seen_tutorial INTEGER DEFAULT 0,
    app_mode TEXT DEFAULT 'full',
    enabled_pillars TEXT DEFAULT '["physical","mental","wealth","vitality"]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Pillar XP (one row per pillar)
CREATE TABLE IF NOT EXISTS pillar_xp (
    pillar TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0
);

-- Seed default pillar rows
INSERT OR IGNORE INTO pillar_xp (pillar, xp) VALUES ('physical', 0);
INSERT OR IGNORE INTO pillar_xp (pillar, xp) VALUES ('mental', 0);
INSERT OR IGNORE INTO pillar_xp (pillar, xp) VALUES ('wealth', 0);
INSERT OR IGNORE INTO pillar_xp (pillar, xp) VALUES ('vitality', 0);

-- Custom tasks
CREATE TABLE IF NOT EXISTS custom_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    pillar TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    chapters TEXT,
    notes TEXT,
    tags TEXT,
    timer_duration INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    synced INTEGER DEFAULT 0
);

-- Daily habits
CREATE TABLE IF NOT EXISTS daily_habits (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    pillar TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL,
    last_completed_date TEXT,
    synced INTEGER DEFAULT 0
);

-- Battle log (workout history)
CREATE TABLE IF NOT EXISTS battle_log (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    workout_name TEXT NOT NULL,
    xp_earned INTEGER NOT NULL,
    synced INTEGER DEFAULT 0
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    achievement_id TEXT PRIMARY KEY,
    unlocked_at TEXT DEFAULT (datetime('now'))
);

-- Custom workouts
CREATE TABLE IF NOT EXISTS custom_workouts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_custom INTEGER DEFAULT 1,
    exercises TEXT NOT NULL,
    synced INTEGER DEFAULT 0
);

-- Daily quests
CREATE TABLE IF NOT EXISTS daily_quests (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    pillar TEXT NOT NULL,
    quest_description TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    xp_reward INTEGER NOT NULL
);

-- Sync queue (offline-first → PocketBase)
CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    payload TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    retries INTEGER DEFAULT 0
);

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY
);

INSERT OR IGNORE INTO schema_version (version) VALUES (1);
`;
