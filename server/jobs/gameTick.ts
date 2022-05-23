import { DependencyContainer } from "../services/types/DependencyContainer";

export default (container: DependencyContainer) => {

    return {

        async handler(job, done) {
            let games = await container.gameListService.listInProgressGamesGameTick();

            for (let i = 0; i < games.length; i++) {
                let game = games[i];

                if (container.gameTickService.canTick(game)) {
                    try {
                        await container.gameService.lock(game._id, true);
                        await container.gameTickService.tick(game._id);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        await container.gameService.lock(game._id, false);
                    }
                }
            }

            done();
        }

    };
    
};
