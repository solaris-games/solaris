module.exports = (container) => {

    return {

        async handler(job, done) {
            let games = await container.gameListService.listOldCompletedGames();

            for (let i = 0; i < games.length; i++) {
                let game = games[i];

                try {
                    await container.gameService.delete(game);
                } catch (e) {
                    console.error(e);
                }
            }

            done();
        }

    };
    
};
