import { DependencyContainer } from "../services/types/DependencyContainer";

export default (container: DependencyContainer) => {

    /*
        Delete game history for games that completed more than 3 months ago.
    */
    const months = 3;

    return {

        async handler(job, done) {
            let games = await container.gameListService.listOldCompletedGamesNotCleaned(months);

            for (let i = 0; i < games.length; i++) {
                let game = games[i];

                console.log(`Deleting history for old game: ${game._id}`);

                try {
                    await container.historyService.deleteByGameId(game._id);
                    await container.eventService.deleteByGameId(game._id);
                    await container.gameService.markAsCleaned(game._id);
                } catch (e) {
                    console.error(e);
                }
            }

            console.log('Cleanup completed.');

            done();
        }

    };
    
};
