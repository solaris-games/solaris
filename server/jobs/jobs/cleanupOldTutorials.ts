import { DependencyContainer } from "../../services/types/DependencyContainer";
import {logger} from "../../utils/logging";

const log = logger("Cleanup Old Tutorials Job");

export const cleanupOldTutorialsJob = (container: DependencyContainer) => async () => {
    try {
        const games = await container.gameListService.listCompletedTutorials();

        for (let i = 0; i < games.length; i++) {
            const game = games[i];

            try {
                await container.gameService.delete(game);
            } catch (e) {
                log.error(e);
            }
        }
    } catch (e) {
        log.error(e, "CleanupOldTutorials job threw unhandled: " + e);
    }
}