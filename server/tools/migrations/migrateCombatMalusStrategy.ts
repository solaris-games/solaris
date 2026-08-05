import { JobParameters } from "../tool";
import { cursorMigrateBulk } from "../cursorMigration";
import { Game } from "@solaris/common";
import { DBObjectId } from "../../services/types/DBObjectId";

const migrateGame = (g: Game<DBObjectId>) => {
    return {
        updateOne: {
            filter: { _id: g._id },
            update: {
                $unset: {
                    "settings.specialGalaxy.combatResolutionMalusStrategy": "",
                },
            },
        },
    };
};

export const migrateCombatMalusStrategy = async (ctx: JobParameters) => {
    const log = ctx.log;

    const gameRepository = ctx.container.gameService.gameRepo;

    await cursorMigrateBulk(
        gameRepository,
        {
            "settings.specialGalaxy.combatResolutionMalusStrategy": {
                $ne: null,
            },
        },
        migrateGame,
        { name: "combatMalusStrategy" },
        log,
    );
};
