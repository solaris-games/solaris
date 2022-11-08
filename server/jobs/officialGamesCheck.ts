import { DependencyContainer } from "../services/types/DependencyContainer";

const officialGameSettings = [
    require('../config/game/settings/official/newPlayer'),
    require('../config/game/settings/official/standard'),
    require('../config/game/settings/official/32player'), // 32 player games are reserved only for official games.
    require('../config/game/settings/official/turnBased'),
    require('../config/game/settings/official/1v1'),
    require('../config/game/settings/official/1v1turnBased'),
];

const specialGameSettings = [
    require('../config/game/settings/official/special_dark'),
    require('../config/game/settings/official/special_fog'),
    require('../config/game/settings/official/special_battleRoyale'),
    require('../config/game/settings/official/special_orbital'),
    require('../config/game/settings/official/special_ultraDark'),
    require('../config/game/settings/official/special_homeStar'),
    require('../config/game/settings/official/special_homeStarElimination'),
    require('../config/game/settings/official/special_anonymous'),
    require('../config/game/settings/official/special_kingOfTheHill'),
    require('../config/game/settings/official/special_tinyGalaxy'),
    require('../config/game/settings/official/special_freeForAll'),
    require('../config/game/settings/official/special_arcade')
];

export default (container: DependencyContainer) => {

    return {

        async handler(job, done) {
            // Check if there is an official game with the settings game name which
            // is currently waiting for players.
            let games = await container.gameListService.listOfficialGames();

            for (let i = 0; i < officialGameSettings.length; i++) {
                let settings = officialGameSettings[i];
                let existing = games.find(x => x.settings.general.type === settings.general.type);

                if (!existing) {
                    console.log(`Could not find game [${settings.general.type}], creating it now...`);
            
                    try {
                        let newGame = await container.gameCreateService.create(settings);
        
                        console.log(`[${newGame.settings.general.name}] game created.`);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            // Check to see if there is at least 1 special game.
            // If there isn't one active, then pick a random one and create it.
            const specialGameTypes = specialGameSettings.map(x => x.general.type);
            const hasSpecialGame = games.find(x => specialGameTypes.includes(x.settings.general.type)) != null;

            if (!hasSpecialGame) {
                console.log(`Could not find special game, creating one now...`);

                let settings = specialGameSettings[container.randomService.getRandomNumber(specialGameSettings.length - 1)];

                try {
                    let newGame = await container.gameCreateService.create(settings);
    
                    console.log(`[${newGame.settings.general.name}] special game created.`);
                } catch (e) {
                    console.error(e);
                }
            }

            done();
        }

    };

};
