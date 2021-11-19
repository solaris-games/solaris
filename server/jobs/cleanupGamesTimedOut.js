module.exports = (container) => {

    return {

        async handler(job, done) {
            let games = await container.gameListService.listGamesTimedOutWaitingForPlayers();

            for (let i = 0; i < games.length; i++) {
                let game = games[i];

                // Do not delete featured games.
                if (container.gameTypeService.isFeaturedGame(game)) {
                    continue;
                }

                try {
                    await container.emailService.sendGameTimedOutEmail(game);
                    await container.gameService.delete(game);
                } catch (e) {
                    console.error(e);
                }
            }

            done();
        }

    };
    
};
