import * as SQLite from 'expo-sqlite';
import type { Pillar, PillarXP } from '@limit-break/core';

interface PillarXpRow {
    pillar: string;
    xp: number;
}

export class XpRepo {
    constructor(private db: SQLite.SQLiteDatabase) { }

    /** Get all pillar XP as a PillarXP object */
    async getAll(): Promise<PillarXP> {
        const rows = await this.db.getAllAsync<PillarXpRow>('SELECT * FROM pillar_xp');
        const xp: PillarXP = { physical: 0, mental: 0, wealth: 0, vitality: 0 };
        for (const row of rows) {
            if (row.pillar in xp) {
                xp[row.pillar as Pillar] = row.xp;
            }
        }
        return xp;
    }

    /** Get XP for a single pillar */
    async get(pillar: Pillar): Promise<number> {
        const row = await this.db.getFirstAsync<PillarXpRow>(
            'SELECT xp FROM pillar_xp WHERE pillar = ?', [pillar]
        );
        return row?.xp || 0;
    }

    /** Add XP to a pillar (atomic increment) */
    async addXp(pillar: Pillar, amount: number): Promise<number> {
        await this.db.runAsync(
            'UPDATE pillar_xp SET xp = xp + ? WHERE pillar = ?',
            [amount, pillar]
        );
        return this.get(pillar);
    }

    /** Set XP for a pillar directly */
    async setXp(pillar: Pillar, xp: number): Promise<void> {
        await this.db.runAsync(
            'UPDATE pillar_xp SET xp = ? WHERE pillar = ?',
            [xp, pillar]
        );
    }

    /** Reset all pillar XP to 0 */
    async resetAll(): Promise<void> {
        await this.db.runAsync('UPDATE pillar_xp SET xp = 0');
    }
}
