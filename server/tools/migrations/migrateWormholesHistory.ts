import {JobParameters} from "../tool";
import {GameHistory} from "../../services/types/GameHistory";

export const migrateWormholesHistory = async (ctx: JobParameters) => {
    const gameRepository = ctx.container.gameService.gameRepo;
    const log = ctx.log;

    // do NOT load the full galaxies into memory
    const thinGames = await gameRepository.find({
        'state.cleaned': false,
        'settings.general.timeMachine': 'enabled',
    }, {
        _id: 1,
    });

    log.info(`Found ${thinGames.length} to update`);

    for (let thinGame of thinGames) {
        const game = (await gameRepository.findOne({
            _id: thinGame._id,
        }, {
            'settings': 1,
            'galaxy.stars': 1,
        }))!;

        // again, do not load the full history
        const thinHistories = await ctx.container.historyService.historyRepo.find({
            gameId: thinGame._id,
        }, {
            _id: 1,
        });

        log.info(`Found ${thinHistories.length} history entries for game ${game.settings.general.name} (${game._id.toString()})`);

        for (let thinHistory of thinHistories) {
            const fullHistory: GameHistory = await ctx.container.historyService.historyRepo.findByIdAsModel(thinHistory._id!, {
                stars: 1,
            });

            if (!fullHistory) {
                continue;
            }

            for (const historyStar of fullHistory.stars) {
                const currentStar = game.galaxy.stars.find(s => s._id.toString() === historyStar.starId.toString());

                if (!currentStar) {
                    continue;
                }

                historyStar.wormHoleToStarId = currentStar.wormHoleToStarId;
            }

            // @ts-ignore
            fullHistory.save();
        }
    }


    log.info(`Migration completed`);
};
