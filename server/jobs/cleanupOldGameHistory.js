module.exports = (container) => {

    /*
        Delete game history for games that completed more than 1 month ago.
    */
    const months = 1;

    return {

        async handler(job, done) {
            let games = await container.gameListService.listOldCompletedGames(months);

            for (let i = 0; i < games.length; i++) {
                let game = games[i];

                try {
                    await container.historyService.deleteByGameId(game._id);
                } catch (e) {
                    console.error(e);
                }
            }

            done();
        }

    };
    
};
