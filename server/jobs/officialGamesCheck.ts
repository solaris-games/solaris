import {DependencyContainer} from "../services/types/DependencyContainer";
import {Game, GameSettings} from "../services/types/Game";
import {OfficialGameCategory, OfficialGameKind} from "../config/officialGames";

const chooseSetting = (container: DependencyContainer, category: OfficialGameCategory): GameSettings => {
    if (category.kind === OfficialGameKind.Standard) {
        return category.settings;
    } else if (category.kind === OfficialGameKind.Carousel) {
        return category.rotation[container.randomService.getRandomNumber(category.rotation.length - 1)];
    } else {
        throw new Error(`Unknown official game kind`);
    }
}

const findExistingGame = (setting: OfficialGameCategory, games: Game[]) => {
    if (setting.kind === OfficialGameKind.Standard) {
        return games.find(x => x.settings.general.type === setting.settings.general.type);
    } else if (setting.kind === OfficialGameKind.Carousel) {
        const types = setting.rotation.map(x => x.general.type);
        return games.find(x => types.includes(x.settings.general.type));
    }
}

export default (container: DependencyContainer) => {
    return {
        async handler(job, done) {
            // Check if there is an official game with the settings game name which
            // is currently waiting for players.
            const openGames = await container.gameListService.listOfficialGames();
            const runningGames = await container.gameListService.listInProgressGames();

            const settings = container.gameTypeService.getOfficialGameSettings();

            for (const category of settings) {
                const existingOpen = findExistingGame(category, openGames);

                if (!existingOpen) {
                    console.log(`Could not find game [${container.gameTypeService.getOfficialGameCategoryName(category)}], creating it now...`);

                    let setting;
                    const existingRunning = findExistingGame(setting, runningGames);
                    const existingTemplate = existingRunning?.settings.general.createdFromTemplate;
                    
                    if (existingRunning && existingTemplate && category.kind === OfficialGameKind.Carousel && category.distribution === 'sequential') {
                        const index = category.rotation.findIndex(x => x.general.createdFromTemplate && x.general.createdFromTemplate === existingTemplate);
                        const nextIndex = (index + 1) % category.rotation.length;
                        setting = category.rotation[nextIndex];
                    } else {
                        setting = chooseSetting(container, setting);
                    }

                    try {
                        const newGame = await container.gameCreateService.create(setting);

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
