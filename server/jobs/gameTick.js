module.exports = (container) => {

    return {

        async handler(job, done) {
            let games = await container.gameListService.listInProgressGames();

            for (let i = 0; i < games.length; i++) {
                let game = games[i];

                try {
                    await container.gameTickService.tick(game._id);
                } catch (e) {
                    console.error(e);
                }
            }

            done();
        }

    };
    
};
