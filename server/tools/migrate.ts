import readline from "readline";
import { makeJob } from "./tool";
import { migrateStats } from "./migrations/migrateStats";
import { migrateInitialGameState } from "./migrations/migrateInitialGameState";
import { migrateWormholesHistory } from "./migrations/migrateWormholesHistory";
import { migrateResearchCosts } from "./migrations/migrateResearchCosts";
import { migrateCombatEvents } from "./migrations/migrateCombatEvents";
import { migrateSignupDate } from "./migrations/migrateSignupDate";
import { migrateCombatMalusStrategy } from "./migrations/migrateCombatMalusStrategy";
import MigrationModel from "../db/models/Migration";

const MIGRATIONS = [
    { name: "2025-06-26-stats", fn: migrateStats },
    { name: "2025-10-19-initial-game-state", fn: migrateInitialGameState },
    { name: "2025-11-08-wormholes-history", fn: migrateWormholesHistory },
    { name: "2026-03-11-research-costs", fn: migrateResearchCosts },
    { name: "2026-04-22-combat-events", fn: migrateCombatEvents },
    { name: "2026-05-01-signup-date", fn: migrateSignupDate },
    {
        name: "2026-08-04-combat-malus-strategy",
        fn: migrateCombatMalusStrategy,
    },
];

function parseArgs(args: string[]): { migrationName?: string; yes: boolean } {
    const flags = args.filter((a) => a === "--yes" || a === "-y");
    const positional = args.filter((a) => a !== "--yes" && a !== "-y");
    return {
        migrationName: positional[0],
        yes: flags.length > 0,
    };
}

function prompt(question: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(
                answer.toLowerCase() === "y" || answer.toLowerCase() === "yes",
            );
        });
    });
}

const job = makeJob("Migration", async (ctx) => {
    const log = ctx.log;
    const { migrationName, yes } = parseArgs(process.argv.slice(2));

    const appliedDocs = await MigrationModel.find({}).lean();
    const appliedNames = new Set(appliedDocs.map((d) => d.name));

    if (migrationName) {
        const migration = MIGRATIONS.find((m) => m.name === migrationName);
        if (!migration) {
            log.error(
                `Unknown migration "${migrationName}". Available: ${MIGRATIONS.map((m) => m.name).join(", ")}`,
            );
            throw new Error(`Unknown migration: ${migrationName}`);
        }

        if (appliedNames.has(migrationName)) {
            log.info(`Migration "${migrationName}" is already applied.`);
            return;
        }

        log.info(`Running migration "${migrationName}"...`);
        await migration.fn(ctx);
        await MigrationModel.create({ name: migrationName });
        log.info(`Migration "${migrationName}" completed and recorded.`);
        return;
    }

    const outstanding = MIGRATIONS.filter((m) => !appliedNames.has(m.name));

    if (outstanding.length === 0) {
        log.info("All migrations are already applied.");
        return;
    }

    log.info(
        `Outstanding migrations (${outstanding.length}): ${outstanding.map((m) => m.name).join(", ")}`,
    );

    if (!yes) {
        const proceed = await prompt(
            `Run ${outstanding.length} outstanding migration(s)? [y/N] `,
        );
        if (!proceed) {
            log.info("Migration run cancelled.");
            return;
        }
    }

    for (const migration of outstanding) {
        log.info(`Running migration "${migration.name}"...`);
        await migration.fn(ctx);
        await MigrationModel.create({ name: migration.name });
        log.info(`Migration "${migration.name}" completed and recorded.`);
    }

    log.info("All outstanding migrations applied.");
});

job();

export {};
