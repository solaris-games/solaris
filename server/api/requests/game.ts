import ValidationError from "../../errors/validation";
import { CarrierWaypointActionType, CarrierWaypointActionTypes } from "../../services/types/CarrierWaypoint";
import {CustomGalaxy, CustomGalaxyCarrier} from "../../../common/src/api/types/common/customGalaxy";
import { DBObjectId } from "../../services/types/DBObjectId";
import {
    object,
    Validator,
    objectId,
    stringValue,
    number,
    string,
    or,
    just,
    UNICODE_INVISIBLE_CHARACTERS,
    UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
    array,
    boolean,
    stringEnumeration,
    positiveInteger,
    withDefault,
    numberAdv, maybeNull, maybeUndefined, numberEnumeration, map
} from "../validate";
import { keyHasBooleanValue, keyHasStringValue } from "./helpers";
import {
    GAME_AWARD_RANK_TO, GAME_GALAXY_TYPE,
    GAME_MODES,
    GAME_TYPES,
    GameAwardRankTo,
    GameGalaxyType, GameMode, GamePlayerAnonymity, GamePlayerOnlineStatus, GamePlayerType, GameSettingEnabledDisabled,
    GameSettingsGalaxy,
    GameSettingsGeneralSpec, GameSettingsSpecialGalaxy,
    GameType, READY_TO_QUIT_FRACTIONS,
    READY_TO_QUIT_TIMER_CYCLES, READY_TO_QUIT_VISIBILITY, ReadyToQuitFraction,
    ReadyToQuitTimerCycles, ReadyToQuitVisibility
} from "@solaris-common";
import type {GameSettingsReq} from "../../services/gameCreate";

export const customGalaxyValidator: Validator<CustomGalaxy> = object({
    stars: array(object({
        id: stringValue({ minLength: 1 }),
        location: object({
            x: number,
            y: number
        }),
        playerId: or(stringValue({ minLength: 1 }), just(null)),
        naturalResources: object({
            economy: positiveInteger,
            industry: positiveInteger,
            science: positiveInteger
        }),
        shipsActual: or(numberAdv({ sign: 'positive' }), just(undefined)),
        specialistId: or(positiveInteger, just(null)),
        specialistExpireTick: or(positiveInteger, just(null)),
        homeStar: boolean,
        warpGate: boolean,
        isNebula: boolean,
        isAsteroidField: boolean,
        isBinaryStar: boolean,
        isBlackHole: boolean,
        isPulsar: boolean,
        wormHoleToStarId: or(stringValue({ minLength: 1 }), just(null)),
        infrastructure: object({
            economy: positiveInteger,
            industry: positiveInteger,
            science: positiveInteger
        }),
        isKingOfTheHillStar: or(boolean, just(undefined)),
        name: or(stringValue({
            minLength: 3,
            maxLength: 30,
            trim: true,
            matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
            ignoreForLengthCheck: UNICODE_INVISIBLE_CHARACTERS,
        }), just(undefined))
    })),
    players: or(array(object({
        id: stringValue({ minLength: 1 }),
        homeStarId: stringValue({ minLength: 1 }),
        credits: positiveInteger,
        creditsSpecialists: positiveInteger,
        technologies: object({
            scanning: positiveInteger,
            hyperspace: positiveInteger,
            terraforming: positiveInteger,
            experimentation: positiveInteger,
            weapons: positiveInteger,
            banking: positiveInteger,
            manufacturing: positiveInteger,
            specialists: positiveInteger
        })
    })), just(undefined)),
    carriers: or(array(object({
        id: stringValue({ minLength: 1 }),
        playerId: stringValue({ minLength: 1 }),
        orbiting: or(stringValue({ minLength: 1 }), just(null)),
        waypointsLooped: boolean,
        ships: numberAdv({ integer: true, sign: 'positive', range: { from: 1 } }),
        specialistId: or(positiveInteger, just(null)),
        specialistExpireTick: or(positiveInteger, just(null)),
        isGift: boolean,
        waypoints: array(object({
            source: stringValue({ minLength: 1 }),
            destination: stringValue({ minLength: 1 }),
            action: stringEnumeration<CarrierWaypointActionType, CarrierWaypointActionType[]>(CarrierWaypointActionTypes),
            actionShips: withDefault(0, positiveInteger),
            delayTicks: withDefault(0, positiveInteger)
        })),
        progress: or(numberAdv({ sign: 'positive', range: { from: 0, to: 1 } }), just(undefined)),
        name: or(stringValue({
            minLength: 1,
            maxLength: 30,
            trim: true,
            matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
            ignoreForLengthCheck: UNICODE_INVISIBLE_CHARACTERS,
        }), just(undefined))
    })), just(undefined)),
    teams: or(array(object({
        id: stringValue({ minLength: 1 }),
        players: array(stringValue({ minLength: 1 })),
        name: or(stringValue({
            minLength: 1,
            maxLength: 30,
            trim: true,
            matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
            ignoreForLengthCheck: UNICODE_INVISIBLE_CHARACTERS,
        }), just(undefined))
    })), just(undefined))
});

const enabledDisabled = stringEnumeration<GameSettingEnabledDisabled, GameSettingEnabledDisabled[]>(['enabled', 'disabled']);

const parseGameSettingsGeneral: Validator<GameSettingsGeneralSpec> = object({
    name: stringValue({
        trim: true,
        minLength: 3,
        matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
    }),
    description: maybeNull(string),
    password: maybeNull(string),
    type: stringEnumeration<GameType, GameType[]>(GAME_TYPES),
    mode: stringEnumeration<GameMode, GameMode[]>(GAME_MODES),
    playerLimit: numberAdv({
        range: {
            from: 2,
            to: 64,
        },
        integer: true,
    }),
    playerType: stringEnumeration<GamePlayerType, GamePlayerType[]>(['all', 'establishedPlayers']),
    anonymity: stringEnumeration<GamePlayerAnonymity, GamePlayerAnonymity[]>(['normal', 'extra']),
    playerOnlineStatus: stringEnumeration<GamePlayerOnlineStatus, GamePlayerOnlineStatus[]>(['hidden', 'visible']),
    playerIPWarning: enabledDisabled,
    awardRankTo: stringEnumeration<GameAwardRankTo, GameAwardRankTo[]>(GAME_AWARD_RANK_TO),
    awardRankToTopN: maybeUndefined(numberAdv({
        integer: true,
        range: {
            from: 1,
        }
    })),
    fluxEnabled: enabledDisabled,
    advancedAI: enabledDisabled,
    afkSlotsOpen: enabledDisabled,
    spectators: enabledDisabled,
    readyToQuit: enabledDisabled,
    readyToQuitFraction: maybeUndefined(numberEnumeration<ReadyToQuitFraction, ReadyToQuitFraction[]>(READY_TO_QUIT_FRACTIONS)),
    readyToQuitTimerCycles: maybeUndefined(numberEnumeration<ReadyToQuitTimerCycles, ReadyToQuitTimerCycles[]>(READY_TO_QUIT_TIMER_CYCLES)),
    readyToQuitVisibility: stringEnumeration<ReadyToQuitVisibility, ReadyToQuitVisibility[]>(READY_TO_QUIT_VISIBILITY),
});

const parseGameSettingsGalaxy: Validator<GameSettingsGalaxy> = object({
    galaxyType: stringEnumeration<GameGalaxyType, GameGalaxyType[]>(GAME_GALAXY_TYPE),
    starsPerPlayer: numberAdv({
        integer: true,
        range: {
            from: 1,
            to: 50,
        },
    }),
    productionTicks: numberAdv({
        integer: true,
        range: {
            from: 6,
            to: 36,
        },
    }),
    advancedCustomGalaxyEnabled: maybeUndefined(enabledDisabled),
    customGalaxy: maybeUndefined(str => customGalaxyValidator(JSON.parse(str))),
});

const parseGameSettingsSpecialGalaxy: Validator<GameSettingsSpecialGalaxy> = object({

});

export const parseGameSettingsReq: Validator<GameSettingsReq> = object({
    general: parseGameSettingsGeneral,
    galaxy: parseGameSettingsGalaxy,
    specialGalaxy: parseGameSettingsSpecialGalaxy,
});

export interface GameJoinGameRequest {
    playerId: DBObjectId;
    alias: string;
    avatar: number;
    password: string | undefined;
};

export const parseGameJoinGameRequest: Validator<GameJoinGameRequest> = object({
    playerId: objectId,
    alias: stringValue({
        trim: true,
        minLength: 1,
        maxLength: 24,
        matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
        ignoreForLengthCheck: UNICODE_INVISIBLE_CHARACTERS,
    }),
    avatar: number,
    password: or(string, just(undefined)),
});

export interface GameSaveNotesRequest {
    notes: string;
};

export const mapToGameSaveNotesRequest = (body: any): GameSaveNotesRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'notes', 0, 2000)) {
        errors.push('Notes is required and must not be greater than 2000 characters.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        notes: body.notes
    }
};

export interface GameConcedeDefeatRequest {
    openSlot: boolean;
}

export const mapToGameConcedeDefeatRequest = (body: any): GameConcedeDefeatRequest => {
    let errors: string[] = [];

    if (!keyHasBooleanValue(body, 'openSlot')) {
        errors.push('Open Slot is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        openSlot: body.openSlot
    }
}

export type KickPlayerRequest = {
    playerId: DBObjectId,
}

export const parseKickPlayerRequest: Validator<KickPlayerRequest> = object({
    playerId: objectId
});
