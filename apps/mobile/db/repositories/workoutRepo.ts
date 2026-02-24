import * as SQLite from 'expo-sqlite';
import type { Workout, WorkoutExercise } from '@limit-break/core';

interface WorkoutRow {
    id: string;
    name: string;
    is_custom: number;
    exercises: string; // JSON string
    synced: number;
}

export class WorkoutRepo {
    constructor(private db: SQLite.SQLiteDatabase) { }

    async getAll(): Promise<Workout[]> {
        const rows = await this.db.getAllAsync<WorkoutRow>('SELECT * FROM custom_workouts');
        return rows.map(this.rowToWorkout);
    }

    async create(workout: Workout): Promise<Workout> {
        await this.db.runAsync(
            'INSERT INTO custom_workouts (id, name, is_custom, exercises) VALUES (?, ?, ?, ?)',
            [workout.id, workout.name, workout.isCustom ? 1 : 0, JSON.stringify(workout.exercises)]
        );
        return workout;
    }

    async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM custom_workouts WHERE id = ?', [id]);
    }

    private rowToWorkout(row: WorkoutRow): Workout {
        return {
            id: row.id,
            name: row.name,
            isCustom: row.is_custom === 1,
            exercises: JSON.parse(row.exercises) as WorkoutExercise[],
        };
    }
}
