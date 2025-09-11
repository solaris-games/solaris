import {GameSettings} from "@solaris-common";
import {DBObjectId} from "../services/types/DBObjectId";

// TODO: Convert to use GameSettingSpec or something

export enum OfficialGameKind {
    Standard = 'Standard',
    Carousel = 'Carousel',
}

export type StandardGame = {
    kind: OfficialGameKind.Standard;
    settings: GameSettings<DBObjectId>;
}

export type CarouselGame = {
    kind: OfficialGameKind.Carousel;
    rotation: GameSettings<DBObjectId>[];
    distribution: 'random' | 'sequential';
    name: string;
}

export type OfficialGameCategory =
    | StandardGame
    | CarouselGame

const standardGame = (configPath: string): StandardGame => {
    const settings = require(configPath) as GameSettings<DBObjectId>;

    return {
        kind: OfficialGameKind.Standard,
        settings,
    };
}

const carouselGames = (name: string, distribution: 'random' | 'sequential', configPaths: string[]): CarouselGame => {
    const rotation = configPaths.map(path => require(path) as GameSettings<DBObjectId>);

    return {
        kind: OfficialGameKind.Carousel,
        rotation,
        name,
        distribution,
    };
}

const officialGameSettings = [
    standardGame('./game/settings/official/newPlayer'),
    standardGame('./game/settings/official/standard'),
    standardGame('./game/settings/official/turnBased'),
    standardGame('./game/settings/official/1v1'),
    standardGame('./game/settings/official/1v1turnBased'),
];

const largeGameSettings = carouselGames("32 Player", "sequential", [
    './game/settings/official/32player_experimental',
    './game/settings/official/32player_capital_elimination'
]);

const relaxedGameSettings = carouselGames("16 Player", "sequential", [
    './game/settings/official/16player/16player_realTime',
    './game/settings/official/16player/16player_turnBased',
]);

const specialGameSettings = carouselGames("Special", "sequential", [
    './game/settings/official/special_dark',
    './game/settings/official/special_fog',
    './game/settings/official/special_battleRoyale',
    './game/settings/official/special_orbital',
    './game/settings/official/special_ultraDark',
    './game/settings/official/special_homeStar',
    './game/settings/official/special_homeStarElimination',
    './game/settings/official/special_anonymous',
    './game/settings/official/special_kingOfTheHill',
    './game/settings/official/special_tinyGalaxy',
    './game/settings/official/special_freeForAll',
    './game/settings/official/special_arcade',
]);

export const specialGameTypes = specialGameSettings.rotation.map(settings => settings.general.type);

export const gameSettings: OfficialGameCategory[] = [
    specialGameSettings,
    largeGameSettings,
    relaxedGameSettings,
    ...officialGameSettings,
]