module.exports = (container) => {

    return {

        async handler(job, done) {
            let games = await container.gameListService.listCustomGamesTimedOut();

            for (let i = 0; i < games.length; i++) {
                let game = games[i];

                // Do not delete featured games.
                if (game.settings.general.featured) {
                    continue;
                }

                try {
                    await container.emailService.sendCustomGameRemovedEmail(game);
                    await container.gameService.delete(game);
                } catch (e) {
                    console.error(e);
                }
            }

            done();
        }

    };
    
};
