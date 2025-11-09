import {makeJob} from "./tool";
import {migrateBadges} from "./migrations/migrateBadges";
import {migrateCombatResolution} from "./migrations/migrateCombatResolution";
import {migrateStats} from "./migrations/migrateStats";
import { migrateInitialGameState } from "./migrations/migrateInitialGameState";
import {migrateWormholesHistory} from "./migrations/migrateWormholesHistory";

const MIGRATIONS = {
    "2025-02-05-badges": migrateBadges,
    "2025-03-29-combat-resolution": migrateCombatResolution,
    "2025-06-26-stats": migrateStats,
    "2025-10-19-initial-game-state": migrateInitialGameState,
    "2025-11-08-wormholes-history": migrateWormholesHistory,
};

const job = makeJob('Migration', async (ctx) => {
    const migrationName = process.argv[2];

    if (!migrationName || !MIGRATIONS[migrationName]) {
        console.error('No migration name provided. Valid names are:', Object.keys(MIGRATIONS).join(', '));

        throw new Error('No migration name provided');
    }

    console.log(`Running migration ${migrationName}...`);

    const migration = MIGRATIONS[migrationName];

    await migration(ctx);

    console.log(`Migration ${migrationName} done.`);
});

job();

export {};