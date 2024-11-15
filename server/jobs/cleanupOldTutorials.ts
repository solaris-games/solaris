import { DependencyContainer } from "../services/types/DependencyContainer";
import {logger} from "../utils/logging";

const log = logger("Cleanup Old Tutorials Job");

export default (container: DependencyContainer) => {

    return {

        async handler(job, done) {
            try {
                let games = await container.gameListService.listCompletedTutorials();

                for (let i = 0; i < games.length; i++) {
                    let game = games[i];

                    try {
                        await container.gameService.delete(game);
                    } catch (e) {
                        log.error(e);
                    }
                }

                done();
            } catch (e) {
                log.error("CleanupOldTutorials job threw unhandled: " + e, e);
            }
        }
    };
    
};
