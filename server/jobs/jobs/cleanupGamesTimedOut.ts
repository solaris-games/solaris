import { DependencyContainer } from "../../services/types/DependencyContainer";
import {logger} from "../../utils/logging";

const log = logger("Cleanup Games Timed Out Job");

export const cleanupGamesTimedOutJob = (container: DependencyContainer) => async () => {
    try {
        const games = await container.gameListService.listGamesTimedOutWaitingForPlayers();

        for (let i = 0; i < games.length; i++) {
            const game = games[i];

            // Do not delete featured games.
            if (container.gameTypeService.isFeaturedGame(game)) {
                continue;
            }

            try {
                await container.emailService.sendGameTimedOutEmail(game._id);
                await container.gameService.delete(game);
            } catch (e) {
                log.error(e);
            }
        }
    } catch (e) {
        log.error(e, "CleanupGamesTimedOut job threw unhandled: " + e);
    }
}
