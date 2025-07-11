import { DependencyContainer } from "../../services/types/DependencyContainer";
import {logger} from "../../utils/logging";

const log = logger("Cleanup Old Game History Job");
const months = 6;

export const cleanupOldGameHistoryJob = (container: DependencyContainer) => async () => {
    try {
        const games = await container.gameListService.listOldCompletedGamesNotCleaned(months);

        for (let i = 0; i < games.length; i++) {
            let game = games[i];

            // TODO: This is a quick bodge to immortalise this game: https://solaris.games/#/game?id=63bcb3de8b616b3bbe0e084b
            // TODO: Add a new `immortal` property to games so that they are ignored by this cleanup job.
            if (game._id.toString() === '63bcb3de8b616b3bbe0e084b') {
                continue
            }

            log.info(`Deleting history for old game: ${game._id}`);

            try {
                await container.historyService.deleteByGameId(game._id);
                await container.eventService.deleteByGameId(game._id);
                await container.gameService.markAsCleaned(game._id);
            } catch (e) {
                log.error(e);
            }
        }

        log.info('Cleanup completed.');
    } catch (e) {
        log.error(e, "CleanupOldGameHistory job threw unhandled: " + e);
    }
}
