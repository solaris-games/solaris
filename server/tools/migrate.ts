import { makeJob } from "./tool";
import { migrateStats } from "./migrations/migrateStats";
import { migrateInitialGameState } from "./migrations/migrateInitialGameState";
import { migrateWormholesHistory } from "./migrations/migrateWormholesHistory";
import { migrateResearchCosts } from "./migrations/migrateResearchCosts";
import { migrateCombatEvents } from "./migrations/migrateCombatEvents";
import { migrateSignupDate } from "./migrations/migrateSignupDate";
import { migrateCombatMalusStrategy } from "./migrations/migrateCombatMalusStrategy";

const MIGRATIONS = {
    "2025-06-26-stats": migrateStats,
    "2025-10-19-initial-game-state": migrateInitialGameState,
    "2025-11-08-wormholes-history": migrateWormholesHistory,
    "2026-03-11-research-costs": migrateResearchCosts,
    "2026-04-22-combat-events": migrateCombatEvents,
    "2026-05-01-signup-date": migrateSignupDate,
    "2026-08-04-combat-malus-strategy": migrateCombatMalusStrategy,
};

const job = makeJob("Migration", async (ctx) => {
    const migrationName = process.argv[2];

    if (!migrationName || !MIGRATIONS[migrationName]) {
        console.error(
            "No migration name provided. Valid names are:",
            Object.keys(MIGRATIONS).join(", "),
        );

        throw new Error("No migration name provided");
    }

    console.log(`Running migration ${migrationName}...`);

    const migration = MIGRATIONS[migrationName];

    await migration(ctx);

    console.log(`Migration ${migrationName} done.`);
});

job();

export {};
