import {GameSettingsReq} from "../services/gameCreate";
import {parseGameSettingsReq} from "../api/requests/game";

export enum OfficialGameKind {
    Standard = 'Standard',
    Carousel = 'Carousel',
}

export type StandardGame = {
    kind: OfficialGameKind.Standard;
    settings: GameSettingsReq;
}

export type CarouselGame = {
    kind: OfficialGameKind.Carousel;
    rotation: GameSettingsReq[];
    distribution: 'random' | 'sequential';
    name: string;
}

export type OfficialGameCategory =
    | StandardGame
    | CarouselGame

export const loadGameSettings = (path: string): GameSettingsReq => {
    const raw = require(path);

    return parseGameSettingsReq(raw);
}

const standardGame = (configPath: string): StandardGame => {
    const settings = loadGameSettings(configPath);

    return {
        kind: OfficialGameKind.Standard,
        settings,
    };
}

const carouselGames = (name: string, distribution: 'random' | 'sequential', configPaths: string[]): CarouselGame => {
    const rotation = configPaths.map(loadGameSettings);

    return {
        kind: OfficialGameKind.Carousel,
        rotation,
        name,
        distribution,
    };
}

const officialTeamGames = carouselGames('Team Games', 'sequential', [
    './game/settings/official/10team/10player_5v5_team_rt',
]);

const officialGameSettings = [
    standardGame('./game/settings/official/newPlayer'),
    standardGame('./game/settings/official/standard'),
    carouselGames('turnBased', 'sequential', [
        './game/settings/official/10tb/turnBased.json',
        './game/settings/official/10tb/turnBased_ultraDark.json',
    ]),
    standardGame('./game/settings/official/1v1'),
    standardGame('./game/settings/official/1v1turnBased'),
    officialTeamGames,
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