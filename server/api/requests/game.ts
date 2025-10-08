import {customGalaxyValidator, ValidationError} from "solaris-common";
import { DBObjectId } from "../../services/types/DBObjectId";
import {
    object,
    Validator,
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
    withDefault,
    numberAdv, maybeNull, maybeUndefined, numberEnumeration, map
} from "../../../common/src/validation/validate";
import { keyHasBooleanValue, keyHasStringValue } from "./helpers";
import {
    GAME_ALLIANCE_UPKEEP_COST,
    GAME_AWARD_RANK_TO, GAME_BANKING_REWARDS,
    GAME_CARRIER_COST,
    GAME_CARRIER_UPKEEP_COST,
    GAME_DARK_GALAXY_MODES, GAME_EXPERIMENTATION_DISTRIBUTIONS, GAME_EXPERIMENTATION_REWARDS,
    GAME_GALAXY_TYPE,
    GAME_INFRUSTRUCTURE_COSTS,
    GAME_MODES,
    GAME_PLAYER_DISTRIBUTIONS, GAME_RESEARCH_COSTS,
    GAME_RESOURCE_DISTRIBUTIONS,
    GAME_SPECIALIST_COST,
    GAME_SPECIALIST_CURRENCY, GAME_SPECIALIST_TOKEN_REWARDS, GAME_TIME_MAX_TURN_WAITS,
    GAME_TIME_SPEEDS, GAME_TIME_START_DELAYS, GAME_TIME_TYPES, GAME_TRADE_COSTS, GAME_TRADE_SCANNING,
    GAME_TYPES,
    GAME_VICTORY_CONDITIONS,
    GAME_VICTORY_PERCENTAGES,
    GAME_WARPGATE_COST, GameAllianceUpkeepCost,
    GameAwardRankTo, GameBankingReward,
    GameCarrierCost,
    GameCarrierUpkeepCost,
    GameDarkGalaxyMode, GameExperimentationDistribution, GameExperimentationReward,
    GameGalaxyType,
    GameInfrastructureCost,
    GameMode,
    GamePlayerAnonymity,
    GamePlayerDistribution,
    GamePlayerOnlineStatus,
    GamePlayerType, GameResearchCost, GameResearchProgression,
    GameResourceDistribution,
    GameSettingEnabledDisabled,
    GameSettingsGalaxyBase, GameSettingsGameTime,
    GameSettingsGeneralBase,
    GameSettingsPlayer,
    GameSettingsSpecialGalaxyBase, GameSettingsTechnology,
    GameSpecialistCost,
    GameSpecialistCurrency, GameSpecialistTokenReward, GameTimeMaxTurnWait, GameTimeSpeed,
    GameTimeStartDelay, GameTimeType, GameTradeCost, GameTradeScanning,
    GameType,
    GameVictoryCondition,
    GameVictoryPercentage,
    GameWarpgateCost,
    READY_TO_QUIT_FRACTIONS,
    READY_TO_QUIT_TIMER_CYCLES,
    READY_TO_QUIT_VISIBILITY,
    ReadyToQuitFraction,
    ReadyToQuitTimerCycles,
    ReadyToQuitVisibility,
    GameJoinGameRequest,
} from "solaris-common";
import type {GameSettingsReq} from "../../services/gameCreate";
import {objectId} from "../../utils/validation";

const enabledDisabled = stringEnumeration<GameSettingEnabledDisabled, GameSettingEnabledDisabled[]>(['enabled', 'disabled']);

const parseGameSettingsGeneral: Validator<GameSettingsGeneralBase> = object({
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
    awardRankTo: withDefault('all', stringEnumeration<GameAwardRankTo, GameAwardRankTo[]>(GAME_AWARD_RANK_TO)),
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
    readyToQuitVisibility: withDefault('visible', stringEnumeration<ReadyToQuitVisibility, ReadyToQuitVisibility[]>(READY_TO_QUIT_VISIBILITY)),
    joinRandomSlot: withDefault('disabled', enabledDisabled),
});

const parseGameSettingsGalaxy: Validator<GameSettingsGalaxyBase> = object({
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

const specialStarNumber = numberAdv({
    integer: true,
    range: {
        from: 0,
        to: 100,
    }
});

const parseGameSettingsSpecialGalaxy: Validator<GameSettingsSpecialGalaxyBase> = object({
    carrierCost: stringEnumeration<GameCarrierCost, GameCarrierCost[]>(GAME_CARRIER_COST),
    carrierUpkeepCost: stringEnumeration<GameCarrierUpkeepCost, GameCarrierUpkeepCost[]>(GAME_CARRIER_UPKEEP_COST),
    warpgateCost: stringEnumeration<GameWarpgateCost, GameWarpgateCost[]>(GAME_WARPGATE_COST),
    specialistCost: stringEnumeration<GameSpecialistCost, GameSpecialistCost[]>(GAME_SPECIALIST_COST),
    specialistsCurrency: stringEnumeration<GameSpecialistCurrency, GameSpecialistCurrency[]>(GAME_SPECIALIST_CURRENCY),
    randomWarpGates: specialStarNumber,
    randomWormHoles: specialStarNumber,
    randomNebulas: specialStarNumber,
    randomAsteroidFields: specialStarNumber,
    randomBlackHoles: specialStarNumber,
    randomBinaryStars: specialStarNumber,
    randomPulsars: specialStarNumber,
    darkGalaxy: stringEnumeration<GameDarkGalaxyMode, GameDarkGalaxyMode[]>(GAME_DARK_GALAXY_MODES),
    giftCarriers: enabledDisabled,
    defenderBonus: enabledDisabled,
    carrierToCarrierCombat: enabledDisabled,
    splitResources: enabledDisabled,
    resourceDistribution: stringEnumeration<GameResourceDistribution, GameResourceDistribution[]>(GAME_RESOURCE_DISTRIBUTIONS),
    playerDistribution: stringEnumeration<GamePlayerDistribution, GamePlayerDistribution[]>(GAME_PLAYER_DISTRIBUTIONS),
    carrierSpeed: numberAdv({
        integer: true,
        range: {
            from: 1,
            to: 25,
        },
    }),
    starCaptureReward: enabledDisabled,
    specialistBans: object({
        star: array(number),
        carrier: array(number),
    }),
});

const parseGameSettingsConquest = object({
    victoryCondition: stringEnumeration<GameVictoryCondition, GameVictoryCondition[]>(GAME_VICTORY_CONDITIONS),
    victoryPercentage: numberEnumeration<GameVictoryPercentage, GameVictoryPercentage[]>(GAME_VICTORY_PERCENTAGES),
    capitalStarElimination: enabledDisabled,
    teamsCount: maybeUndefined(numberAdv({
        integer: true,
        range: {
            from: 2,
            to: 32,
        },
    })),
});

const parseDevelopmentCost: Validator<GameInfrastructureCost> = stringEnumeration<GameInfrastructureCost, GameInfrastructureCost[]>(GAME_INFRUSTRUCTURE_COSTS)

const parseGameSettingsPlayer: Validator<GameSettingsPlayer> = object({
    startingStars: numberAdv({
        integer: true,
        range: {
            from: 1,
            to: 30,
        },
    }),
    startingCredits: numberAdv({
        integer: true,
        range: {
            from: 25,
            to: 3000,
        },
    }),
    startingCreditsSpecialists: numberAdv({
        integer: true,
        range: {
            from: 0,
            to: 100,
        },
    }),
    startingShips: numberAdv({
        integer: true,
        range: {
            from: 0,
            to: 100,
        },
    }),
    startingInfrastructure: object({
        economy: numberAdv({
            integer: true,
            range: {
                from: 0,
                to: 30,
            },
        }),
        industry: numberAdv({
            integer: true,
            range: {
                from: 0,
                to: 30,
            },
        }),
        science: numberAdv({
            integer: true,
            range: {
                from: 0,
                to: 5,
            },
        }),
    }),
    developmentCost: object({
        economy: parseDevelopmentCost,
        industry: parseDevelopmentCost,
        science: parseDevelopmentCost,
    }),
    tradeCredits: boolean,
    tradeCreditsSpecialists: boolean,
    tradeCost: numberEnumeration<GameTradeCost, GameTradeCost[]>(GAME_TRADE_COSTS),
    tradeScanning: stringEnumeration<GameTradeScanning, GameTradeScanning[]>(GAME_TRADE_SCANNING),
    populationCap: object({
        enabled: enabledDisabled,
        shipsPerStar: numberAdv({
            integer: true,
            range: {
                from: 50,
                to: 1000,
            },
        }),
    }),
    allowAbandonStars: enabledDisabled,
});

const researchCosts: Validator<GameResearchCost> = stringEnumeration<GameResearchCost, GameResearchCost[]>(GAME_RESEARCH_COSTS);

const researchCostProgression: Validator<GameResearchProgression> = or(object({
    progression: just('standard'),
}), object({
    progression: just('exponential'),
    growthFactor: stringEnumeration<'soft'|'medium'|'hard', ('soft'|'medium'|'hard')[]>(['soft', 'medium', 'hard']),
}));

const parseGameSettingsTechnology: Validator<GameSettingsTechnology> = object({
    startingTechnologyLevel: object({
        terraforming: numberAdv({
            integer: true,
            range: {
                from: 1,
                to: 16,
            },
        }),
        experimentation: numberAdv({
            integer: true,
            range: {
                from: 0,
                to: 16,
            },
        }),
        scanning: numberAdv({
            integer: true,
            range: {
                from: 1,
                to: 16,
            }
        }),
        hyperspace: numberAdv({
            integer: true,
            range: {
                from: 1,
                to: 16,
            }
        }),
        manufacturing: numberAdv({
            integer: true,
            range: {
                from: 1,
                to: 16,
            }
        }),
        banking: numberAdv({
            integer: true,
            range: {
                from: 0,
                to: 16,
            },
        }),
        weapons: numberAdv({
            integer: true,
            range: {
                from: 1,
                to: 16,
            }
        }),
        specialists: numberAdv({
            integer: true,
            range: {
                from: 0,
                to: 16,
            },
        }),
    }),
    researchCosts: object({
        terraforming: researchCosts,
        experimentation: researchCosts,
        scanning: researchCosts,
        hyperspace: researchCosts,
        manufacturing: researchCosts,
        banking: researchCosts,
        weapons: researchCosts,
        specialists: researchCosts,
    }),
    researchCostProgression: researchCostProgression,
    bankingReward: stringEnumeration<GameBankingReward, GameBankingReward[]>(GAME_BANKING_REWARDS),
    experimentationDistribution: stringEnumeration<GameExperimentationDistribution, GameExperimentationDistribution[]>(GAME_EXPERIMENTATION_DISTRIBUTIONS),
    experimentationReward: stringEnumeration<GameExperimentationReward, GameExperimentationReward[]>(GAME_EXPERIMENTATION_REWARDS),
    specialistTokenReward: stringEnumeration<GameSpecialistTokenReward, GameSpecialistTokenReward[]>(GAME_SPECIALIST_TOKEN_REWARDS),
});

const parseGameSettingsGameTime: Validator<GameSettingsGameTime> = object({
    gameType: stringEnumeration<GameTimeType, GameTimeType[]>(GAME_TIME_TYPES),
    speed: withDefault(1800, numberEnumeration<GameTimeSpeed, GameTimeSpeed[]>(GAME_TIME_SPEEDS)),
    isTickLimited: withDefault('disabled', enabledDisabled),
    tickLimit: maybeNull(numberAdv({
        integer: true,
        range: {
            from: 100,
            to: 2000,
        },
    })),
    startDelay: withDefault(240, numberEnumeration<GameTimeStartDelay, GameTimeStartDelay[]>(GAME_TIME_START_DELAYS)),
    turnJumps: withDefault(8, numberAdv({
        integer: true,
        range: {
            from: 1,
            to: 24,
        },
    })),
    maxTurnWait: withDefault(1440, numberEnumeration<GameTimeMaxTurnWait, GameTimeMaxTurnWait[]>(GAME_TIME_MAX_TURN_WAITS)),
    afk: object({
        lastSeenTimeout: withDefault(2, numberAdv({
            integer: true,
            range: {
                from: 1,
                to: 7,
            },
        })),
        cycleTimeout: withDefault(3, numberAdv({
            integer: true,
            range: {
                from: 3,
                to: 25,
            },
        })),
        turnTimeout: withDefault(3, numberAdv({
            integer: true,
            range: {
                from: 1,
                to: 60,
            },
        })),
    }),
});

export const parseGameSettingsReq: Validator<GameSettingsReq> = object({
    general: parseGameSettingsGeneral,
    galaxy: parseGameSettingsGalaxy,
    specialGalaxy: parseGameSettingsSpecialGalaxy,
    conquest: parseGameSettingsConquest,
    kingOfTheHill: maybeUndefined(object({
        productionCycles: numberAdv({
            integer: true,
            range: {
                from: 1,
                to: 25,
            },
        }),
    })),
    orbitalMechanics: object({
        enabled: enabledDisabled,
        orbitSpeed: numberAdv({
            integer: true,
            range: {
                from: 1,
                to: 5,
            },
        }),
    }),
    player: parseGameSettingsPlayer,
    diplomacy: object({
        enabled: withDefault('enabled', enabledDisabled),
        tradeRestricted: withDefault('disabled', enabledDisabled),
        maxAlliances: withDefault(63, numberAdv({
            integer: true,
            range: {
                from: 1,
                to: 63,
            },
        })),
        upkeepCost: withDefault('none', stringEnumeration<GameAllianceUpkeepCost, GameAllianceUpkeepCost[]>(GAME_ALLIANCE_UPKEEP_COST)),
        globalEvents: withDefault('disabled', enabledDisabled),
        lockedAlliances: withDefault('disabled', enabledDisabled),
    }),
    technology: parseGameSettingsTechnology,
    gameTime: parseGameSettingsGameTime,
});

export const parseGameJoinGameRequest: Validator<GameJoinGameRequest<DBObjectId>> = object({
    playerId: maybeUndefined(objectId),
    alias: stringValue({
        trim: true,
        minLength: 1,
        maxLength: 24,
        matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
        ignoreForLengthCheck: UNICODE_INVISIBLE_CHARACTERS,
    }),
    avatar: number,
    password: maybeUndefined(string),
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
        openSlot: body.openSlot,
    }
}

export type KickPlayerRequest = {
    playerId: DBObjectId,
}

export const parseKickPlayerRequest: Validator<KickPlayerRequest> = object({
    playerId: objectId,
});
