import {JobParameters} from "../tool";
import {Game} from "../../services/types/Game";
import { Logger } from "pino";

const migrateGame = (log: Logger, game: Game) => {
    if (!game.settings.specialGalaxy.combatResolutionMalusStrategy) {
        return {
            updateOne: {
                filter: { _id: game._id },
                update: {
                    $set: {
                        'settings.specialGalaxy.combatResolutionMalusStrategy': 'anyCarrier',
                    }
                }
            }
        }
    } else {
        return null;
    }
};

export const migrateCombatResolution = async (ctx: JobParameters) => {
    const gameRepository = ctx.container.gameService.gameRepo;
    const log = ctx.log;

    let page = 0;
    const pageSize = 10;

    const total = await gameRepository.countAll();
    const totalPages = Math.ceil(total / pageSize);

    do {
        const games = await gameRepository.find({}, {
            'settings': 1,
        }, { _id: 1 }, pageSize, page * pageSize, false);

        const writes = games.map((game) => migrateGame(log, game)).filter(Boolean);

        console.log(JSON.stringify(writes));

        await gameRepository.bulkWrite(writes);

        log.info(`Page ${page}/${totalPages}`);

        page++;
    } while (page <= totalPages)
}