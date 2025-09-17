import {DependencyContainer} from "../../services/types/DependencyContainer";
import {Game} from "../../services/types/Game";
import {OfficialGameCategory, OfficialGameKind} from "../../config/officialGames";
import {logger} from "../../utils/logging";
import {GameSettings} from "solaris-common";
import {DBObjectId} from "../../services/types/DBObjectId";

const log = logger("Official Games Check Job");

const chooseSetting = (container: DependencyContainer, category: OfficialGameCategory): GameSettings<DBObjectId> => {
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

export const officialGamesCheckJob = (container: DependencyContainer) => async () => {
    try {
        // Check if there is an official game with the settings game name which
        // is currently waiting for players.
        const openGames = await container.gameListService.listOfficialGames();
        const runningGames = await container.gameListService.listInProgressGames();

        const settings = container.gameTypeService.getOfficialGameSettings();

        for (const category of settings) {
            const existingOpen = findExistingGame(category, openGames);

            if (!existingOpen) {
                log.info(`Could not find game [${container.gameTypeService.getOfficialGameCategoryName(category)}], creating it now...`);

                const existingRunning = findExistingGame(category, runningGames);
                const existingTemplate = existingRunning?.settings.general.createdFromTemplate;

                let newSetting: GameSettings<DBObjectId>;
                if (existingRunning && existingTemplate && category.kind === OfficialGameKind.Carousel && category.distribution === 'sequential') {
                    const index = category.rotation.findIndex(x => x.general.createdFromTemplate && x.general.createdFromTemplate === existingTemplate);
                    const nextIndex = (index + 1) % category.rotation.length;
                    newSetting = category.rotation[nextIndex];
                } else {
                    newSetting = chooseSetting(container, category);
                }

                try {
                    const newGame = await container.gameCreateService.create(newSetting, null);

                    log.info(`${newGame.settings.general.type} game created: ${newGame.settings.general.name}`);
                } catch (e) {
                    log.error(e);
                }
            }
        }
    } catch (e) {
        log.error(e, "OfficialGamesCheck job threw unhandled: " + e);
    }
}
