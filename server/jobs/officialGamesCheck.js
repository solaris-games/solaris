const container = require('../api/container');

const officialGameSettings = [
    require('../config/game/settings/official/newPlayer'),
    require('../config/game/settings/official/standard'),
    require('../config/game/settings/official/dark'),
    require('../config/game/settings/official/1v1'),
];

module.exports = {

    async handler(job, done) {
        // Check if there is an official game with the settings game name which
        // is currently waiting for players.
        let games = await container.gameListService.listOfficialGames();

        for (let i = 0; i < officialGameSettings.length; i++) {
            let settings = officialGameSettings[i];
            let existing = games.find(x => x.settings.general.name === settings.general.name);

            if (!existing) {
                console.log(`Could not find game [${settings.general.name}], creating it now...`);
        
                try {
                    await container.gameCreateService.create(settings);
    
                    console.log(`[${settings.general.name}] game created.`);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        done();
    }

};
