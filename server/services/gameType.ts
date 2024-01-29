import {Game, GameType} from "./types/Game";

import {GameSettings} from "./types/Game";

export enum OfficialGameKind {
    Standard = 'Standard',
    Carousel = 'Carousel',
}

export type StandardGame = {
    kind: OfficialGameKind.Standard;
    settings: GameSettings;
}

export type CarouselGame = {
    kind: OfficialGameKind.Carousel;
    rotation: GameSettings[];
    name: string;
}

export type OfficialGameCategory =
    | StandardGame
    | CarouselGame

const standardGame = (configPath: string): StandardGame => {
    const settings = require(configPath) as GameSettings;

    return {
        kind: OfficialGameKind.Standard,
        settings,
    };
}

const carouselGames = (name: string, configPaths: string[]): CarouselGame => {
    const rotation = configPaths.map(path => require(path) as GameSettings);

    return {
        kind: OfficialGameKind.Carousel,
        rotation,
        name
    };
}

const officialGameSettings = [
    standardGame('../config/game/settings/official/newPlayer'),
    standardGame('../config/game/settings/official/standard'),
    standardGame('../config/game/settings/official/32player'), // 32 player games are reserved only for official games.
    standardGame('../config/game/settings/official/turnBased'),
    standardGame('../config/game/settings/official/1v1'),
    standardGame('../config/game/settings/official/1v1turnBased'),
];

const specialGameSettings = carouselGames("Special", [
    '../config/game/settings/official/special_dark',
    '../config/game/settings/official/special_fog',
    '../config/game/settings/official/special_battleRoyale',
    '../config/game/settings/official/special_orbital',
    '../config/game/settings/official/special_ultraDark',
    '../config/game/settings/official/special_homeStar',
    '../config/game/settings/official/special_homeStarElimination',
    '../config/game/settings/official/special_anonymous',
    '../config/game/settings/official/special_kingOfTheHill',
    '../config/game/settings/official/special_tinyGalaxy',
    '../config/game/settings/official/special_freeForAll',
    '../config/game/settings/official/special_arcade',
]);


const gameSettings: OfficialGameCategory[] = [
    specialGameSettings,
    ...officialGameSettings,
]

export default class GameTypeService {
    getOfficialGameCategoryName(officialGame: OfficialGameCategory) {
        if (officialGame.kind === OfficialGameKind.Standard) {
            return officialGame.settings.general.name;
        } else if (officialGame.kind === OfficialGameKind.Carousel) {
            return officialGame.name;
        }
    }

    getOfficialGameSettings(): OfficialGameCategory[] {
        return gameSettings;
    }

    isNewPlayerGame(game: Game) {
        return ['new_player_rt', 'new_player_tb'].includes(game.settings.general.type);
    }

    isTutorialGame(game: Game) {
        return game.settings.general.type === 'tutorial';
    }

    isOfficialGame(game: Game) {
        return game.settings.general.createdByUserId == null;
    }

    isCustomGame(game: Game) {
        return game.settings.general.type === 'custom';
    }

    isFeaturedGame(game: Game) {
        return game.settings.general.featured;
    }

    isSpecialGameMode(game: Game) {
        return Boolean(specialGameSettings.rotation.find(settings => settings.general.type === game.settings.general.type));
    }

    is32PlayerGame(game: Game) {
        return game.settings.general.playerLimit === 32;
    }

    isConquestMode(game: Game) {
        return game.settings.general.mode === 'conquest';
    }

    isKingOfTheHillMode(game: Game) {
        return game.settings.general.mode === 'kingOfTheHill';
    }

    isAnonymousGame(game: Game) {
        return game.settings.general.anonymity === 'extra';
    }

    isForEstablishedPlayersOnly(game: Game) {
        return game.settings.general.playerType === 'establishedPlayers'
    }

    isOrbitalMode(game: Game) {
        return game.settings.orbitalMechanics.enabled === 'enabled';
    }

    isBattleRoyaleMode(game: Game) {
        return game.settings.general.mode === 'battleRoyale';
    }

    isDarkModeExtra(game: Game) {
        return game.settings.specialGalaxy.darkGalaxy === 'extra';
    }

    isDarkMode(game: Game) {
        return game.settings.specialGalaxy.darkGalaxy === 'standard'
            || game.settings.specialGalaxy.darkGalaxy === 'extra';
    }

    isDarkFogged(game: Game) {
        return game.settings.specialGalaxy.darkGalaxy === 'fog';
    }

    isDarkStart(game: Game) {
        return game.settings.specialGalaxy.darkGalaxy === 'start'
            || this.isDarkFogged(game);
    }

    isTurnBasedGame(game: Game) {
        return game.settings.gameTime.gameType === 'turnBased';
    }

    isRealTimeGame(game: Game) {
        return game.settings.gameTime.gameType === 'realTime';
    }

    isSplitResources(game: Game) {
        return game.settings.specialGalaxy.splitResources === 'enabled';
    }

    is1v1Game(game: Game) {
        return ['1v1_rt', '1v1_tb'].includes(game.settings.general.type);
    }

    isFluxGame(game: Game) {
        return game.settings.general.fluxEnabled === 'enabled'
    }

    isRankedGame(game: Game) {
        // Official games are either not user created or featured (featured games can be user created)
        return !this.isTutorialGame(game) &&
                !this.isNewPlayerGame(game) &&
                (!this.isCustomGame(game) || this.isFeaturedGame(game));
    }

    isCapitalStarEliminationMode(game: Game) {
        return this.isConquestMode(game) && game.settings.conquest.capitalStarElimination === 'enabled';
    }
}
