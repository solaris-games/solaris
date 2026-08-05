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

interface ParsedArgs {
    migrationName?: string;
    yes: boolean;
    remove?: string;
    add?: string;
    force: boolean;
}

function parseArgs(args: string[]): ParsedArgs {
    const result: ParsedArgs = { yes: false, force: false };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--yes" || arg === "-y") {
            result.yes = true;
        } else if (arg === "--force") {
            result.force = true;
        } else if (arg === "--remove") {
            const value = args[i + 1];
            if (!value || value.startsWith("--")) {
                throw new Error("--remove requires a migration name");
            }
            result.remove = value;
            i++;
        } else if (arg === "--add") {
            const value = args[i + 1];
            if (!value || value.startsWith("--")) {
                throw new Error("--add requires a migration name");
            }
            result.add = value;
            i++;
        } else {
            result.migrationName = arg;
        }
    }

    return result;
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

const availableNames = () => MIGRATIONS.map((m) => m.name).join(", ");

const job = makeJob("Migration", async (ctx) => {
    const log = ctx.log;
    const args = parseArgs(process.argv.slice(2));
    const { migrationName, yes, remove, add, force } = args;

    if (remove && add) {
        throw new Error("--remove and --add are mutually exclusive");
    }

    if (remove) {
        const existing = await MigrationModel.findOne({ name: remove });
        if (!existing) {
            log.info(
                `Migration "${remove}" is not recorded, nothing to remove.`,
            );
            return;
        }

        if (!yes) {
            const proceed = await prompt(
                `Remove migration "${remove}" from the applied list? [y/N] `,
            );
            if (!proceed) {
                log.info("Remove cancelled.");
                return;
            }
        }

        await MigrationModel.deleteOne({ name: remove });
        log.info(`Migration "${remove}" removed from applied list.`);
        return;
    }

    if (add) {
        if (!MIGRATIONS.find((m) => m.name === add)) {
            log.error(
                `Unknown migration "${add}". Available: ${availableNames()}`,
            );
            throw new Error(`Unknown migration: ${add}`);
        }

        const existing = await MigrationModel.findOne({ name: add });
        if (existing) {
            log.info(`Migration "${add}" is already recorded.`);
            return;
        }

        if (!yes) {
            const proceed = await prompt(
                `Add migration "${add}" to the applied list? [y/N] `,
            );
            if (!proceed) {
                log.info("Add cancelled.");
                return;
            }
        }

        await MigrationModel.create({ name: add });
        log.info(`Migration "${add}" added to applied list.`);
        return;
    }

    if (force && !migrationName) {
        throw new Error(
            "--force requires a named migration (e.g. 2025-06-26-stats)",
        );
    }

    if ((remove || add) && migrationName) {
        throw new Error(
            `Cannot combine --${remove ? "remove" : "add"} with a migration name`,
        );
    }

    if (migrationName) {
        const migration = MIGRATIONS.find((m) => m.name === migrationName);
        if (!migration) {
            log.error(
                `Unknown migration "${migrationName}". Available: ${availableNames()}`,
            );
            throw new Error(`Unknown migration: ${migrationName}`);
        }

        const alreadyApplied = await MigrationModel.findOne({
            name: migrationName,
        });

        if (alreadyApplied && !force) {
            log.info(
                `Migration "${migrationName}" is already applied. Use --force to re-run.`,
            );
            return;
        }

        if (force && alreadyApplied) {
            if (!yes) {
                const proceed = await prompt(
                    `Migration "${migrationName}" was already applied at ${alreadyApplied.appliedAt.toISOString()}. Force re-run? [y/N] `,
                );
                if (!proceed) {
                    log.info("Force re-run cancelled.");
                    return;
                }
            }
        }

        log.info(`Running migration "${migrationName}"...`);
        await migration.fn(ctx);
        await MigrationModel.updateOne(
            { name: migrationName },
            { $set: { appliedAt: new Date() } },
            { upsert: true },
        );
        log.info(`Migration "${migrationName}" completed and recorded.`);
        return;
    }

    const appliedDocs = await MigrationModel.find({}).lean();
    const appliedNames = new Set(appliedDocs.map((d) => d.name));

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
