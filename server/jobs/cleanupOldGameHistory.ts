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

                // TODO: This is a quick bodge to immortalise this game: https://solaris.games/#/game?id=63bcb3de8b616b3bbe0e084b
                // TODO: Add a new `immortal` property to games so that they are ignored by this cleanup job.
                if (game._id.toString() === '63bcb3de8b616b3bbe0e084b') {
                    continue
                }

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
