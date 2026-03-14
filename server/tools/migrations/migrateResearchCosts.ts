import {JobParameters} from "../tool";
import {GameResearchProgression, GameSettingsTechnology} from "@solaris-common";
import {Game} from "../../services/types/Game";
import { Logger } from "pino";

type OldGameSettingsTechnology = {
    researchCostProgression: GameResearchProgression,
};

const migrateGame = (log: Logger, game: Game) => {
    if (game.settings.technology.researchCostProgressions) {
        log.info(`Game ${game._id} already has research cost progressions, skipping migration.`);
        return null;
    }

    const oldTechSettings = game.settings.technology as unknown as OldGameSettingsTechnology;

    const progression = { ...oldTechSettings.researchCostProgression };

    const newProgressions: GameSettingsTechnology['researchCostProgressions'] = {
        terraforming: progression,
        experimentation: progression,
        banking: progression,
        scanning: progression,
        hyperspace: progression,
        weapons: progression,
        manufacturing: progression,
        specialists: progression,
    };

    return {
        updateOne: {
            filter: { _id: game._id },
            update: {
                $set: {
                    'settings.technology.researchCostProgressions': newProgressions,
                }
            }
        }
    }
};

export const migrateResearchCosts = async (ctx: JobParameters) => {
    const gameRepository = ctx.container.gameService.gameRepo;
    const log = ctx.log;

    let page = 0;
    const pageSize = 10;

    const total = await gameRepository.countAll();
    const totalPages = Math.ceil(total / pageSize);

    do {
        const games: Game[] = await gameRepository.find({}, {
            'settings': 1,
        }, { _id: 1 }, pageSize, page * pageSize, false);

        const writes = games.map((game) => migrateGame(log, game)).filter(Boolean);

        await gameRepository.bulkWrite(writes);

        log.info(`Page ${page}/${totalPages}`);

        page++;
    } while (page <= totalPages)
}