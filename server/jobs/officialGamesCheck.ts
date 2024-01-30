import {DependencyContainer} from "../services/types/DependencyContainer";
import {GameSettings} from "../services/types/Game";
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

export default (container: DependencyContainer) => {
    return {
        async handler(job, done) {
            // Check if there is an official game with the settings game name which
            // is currently waiting for players.
            const games = await container.gameListService.listOfficialGames();

            const settings = container.gameTypeService.getOfficialGameSettings();

            for (const setting of settings) {
                let existing;
                if (setting.kind === OfficialGameKind.Standard) {
                    existing = games.find(x => x.settings.general.type === setting.settings.general.type);
                } else if (setting.kind === OfficialGameKind.Carousel) {
                    const types = setting.rotation.map(x => x.general.type);
                    existing = games.find(x => types.includes(x.settings.general.type));
                }

                if (!existing) {
                    console.log(`Could not find game [${container.gameTypeService.getOfficialGameCategoryName(setting)}], creating it now...`);

                    try {
                        const newGame = await container.gameCreateService.create(chooseSetting(container, setting));

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
