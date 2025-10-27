import {logger} from "../../utils/logging";
import {DependencyContainer} from "../../services/types/DependencyContainer";
import {StatsSlice} from "solaris-common";
import {DBObjectId, objectIdFromString} from "../../services/types/DBObjectId";
import {groupBy} from "solaris-common";

const log = logger("Sum game statistics Job");

export const sumGameStatisticsJob = (container: DependencyContainer) => async () => {
    try {
        log.info("Starting sumGameStatistics job...");

        const statisticsService = container.statisticsService;
        const gameService = container.gameService;

        const slices = await statisticsService.getClosedUnprocessedSlicesActive();

        const gamesToSlices = groupBy(slices, (slice: StatsSlice<DBObjectId>) => slice.gameId.toString());

        for (let [gameId, slicesForGame] of gamesToSlices) {
            const game = await gameService.getByIdLean(objectIdFromString(gameId), {
                'galaxy.players': 1,
                'settings': 1,
                'state': 1,
            });

            if (!game) {
                log.warn(`Game with ID ${gameId} not found, skipping...`);
                continue;
            }

            if (!game.state.endDate) {
                log.warn(`Game with ID ${gameId} is not finished, skipping...`);
                continue;
            }

            for (let slice of slicesForGame) {
                await statisticsService.processSlice(game, slice);

                // @ts-ignore
                await slice.save();
            }

            log.info(`Processed ${slicesForGame.length} slices for game ${gameId}`);
        }

        log.info("Finished sumGameStatistics job.");
    } catch (e) {
        log.error(e, "SumGameStatistics job threw unhandled: " + e);
    }
}