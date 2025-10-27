import {gameSettings, OfficialGameCategory, OfficialGameKind, specialGameTypes} from "../config/officialGames";
import {Game} from "./types/Game";

export const getOfficialGameCategoryName = (officialGame: OfficialGameCategory) => {
    if (officialGame.kind === OfficialGameKind.Standard) {
        return officialGame.settings.general.type;
    } else if (officialGame.kind === OfficialGameKind.Carousel) {
        return officialGame.name;
    }
}

export const getOfficialGameSettings = (): OfficialGameCategory[] => {
    return gameSettings;
}

export const isSpecialGameMode = (game: Game) => {
    return Boolean(specialGameTypes.includes(game.settings.general.type));
}