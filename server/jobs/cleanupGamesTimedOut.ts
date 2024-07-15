import { DependencyContainer } from "../services/types/DependencyContainer";

export default (container: DependencyContainer) => {

    return {
        async handler(job, done) {
            try {
                let games = await container.gameListService.listGamesTimedOutWaitingForPlayers();

                for (let i = 0; i < games.length; i++) {
                    let game = games[i];

                    // Do not delete featured games.
                    if (container.gameTypeService.isFeaturedGame(game)) {
                        continue;
                    }

                    try {
                        await container.emailService.sendGameTimedOutEmail(game._id);
                        await container.gameService.delete(game);
                    } catch (e) {
                        console.error(e);
                    }
                }

                done();
            } catch (e) {
                console.error("CleanupGamesTimedOut job threw unhandled: " + e, e);
            }
        }
    };
    
};
