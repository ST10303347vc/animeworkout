/**
 * Database barrel export — provides typed access to all repositories.
 */
export { getDatabase, closeDatabase } from './database';

export { ProfileRepo } from './repositories/profileRepo';
export { XpRepo } from './repositories/xpRepo';
export { TaskRepo } from './repositories/taskRepo';
export { HabitRepo } from './repositories/habitRepo';
export { BattleLogRepo } from './repositories/battleLogRepo';
export type { BattleLogEntry } from './repositories/battleLogRepo';
export { SyncRepo } from './repositories/syncRepo';
export type { SyncQueueItem } from './repositories/syncRepo';
export { WorkoutRepo } from './repositories/workoutRepo';
