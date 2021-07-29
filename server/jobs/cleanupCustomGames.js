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
                    await container.historyService.deleteByGameId(game._id);
                    await container.eventService.deleteByGameId(game._id);
                } catch (e) {
                    console.error(e);
                }
            }

            done();
        }

    };
    
};
