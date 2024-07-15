import { DependencyContainer } from "../services/types/DependencyContainer";

export default (container: DependencyContainer) => {
    return {
        async handler(job, done) {
            try {
                let games = await container.gameListService.listInProgressGamesGameTick();

                for (let i = 0; i < games.length; i++) {
                    let game = games[i];

                    if (container.gameTickService.canTick(game)) {
                        try {
                            await container.gameLockService.lock(game._id, true);
                            await container.gameTickService.tick(game._id);
                        } catch (e) {
                            console.error(`Error in game ${game.settings.general.name} (${game._id})`, e);
                        } finally {
                            await container.gameLockService.lock(game._id, false);
                        }
                    }
                }

                done();
            } catch (e) {
                console.error("GameTick job threw unhandled: " + e, e);
            }
        }
    };
    
};
