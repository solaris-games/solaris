const officialGameSettings = [
    require('../config/game/settings/official/newPlayer'),
    require('../config/game/settings/official/standard'),
    // require('../config/game/settings/official/standard32player'), // 32 player games are reserved only for official games.
    require('../config/game/settings/official/dark'),
    require('../config/game/settings/official/turnBased'),
    require('../config/game/settings/official/1v1'),
    require('../config/game/settings/official/1v1turnBased'),
];

module.exports = (container) => {

    return {

        async handler(job, done) {
            // Check if there is an official game with the settings game name which
            // is currently waiting for players.
            let games = await container.gameListService.listOfficialGames();

            for (let i = 0; i < officialGameSettings.length; i++) {
                let settings = officialGameSettings[i];
                let existing = games.find(x => x.settings.general.description === settings.general.description);

                if (!existing) {
                    console.log(`Could not find game [${settings.general.description}], creating it now...`);
            
                    try {
                        let newGame = await container.gameCreateService.create(settings);
        
                        console.log(`[${newGame.settings.general.name}] game created.`);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            done();
        }

    };

};
