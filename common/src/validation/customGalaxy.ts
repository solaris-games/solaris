import {
    array,
    numberAdv,
    object,
    stringEnumeration,
    stringValue,
    positiveInteger,
    boolean,
    or,
    just,
    number,
    withDefault,
    UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
    UNICODE_INVISIBLE_CHARACTERS,
    type Validator, named, maybeNull, maybeUndefined, sizedArray
} from "./validate";
import type {CustomGalaxy} from "../types/common/customGalaxy";
import { type CarrierWaypointActionType, CarrierWaypointActionTypes} from "../types/common/carrierWaypoint";

const starId = named("Star ID", stringValue({ minLength: 1 }));
const carrierId = named("Carrier ID", stringValue({ minLength: 1 }));
const playerId = named("Player ID", stringValue({ minLength: 1 }));

const max200k = numberAdv({
    range: {
        from: 0,
        to: 200000,
    },
});

const max2000 = numberAdv({
    range: {
        from: 0,
        to: 2000,
    },
});


const max200 = numberAdv({
    range: {
        from: 0,
        to: 200,
    },
});

export const customGalaxyValidator: Validator<CustomGalaxy> = object({
    stars: sizedArray(1, 1500, object({
        id: starId,
        location: object({
            x: number,
            y: number
        }),
        playerId: maybeNull(playerId),
        naturalResources: object({
            economy: max2000,
            industry: max2000,
            science: max2000
        }),
        shipsActual: maybeUndefined(max200k),
        specialistId: maybeNull(positiveInteger),
        specialistExpireTick: maybeNull(positiveInteger),
        homeStar: boolean,
        warpGate: boolean,
        isNebula: boolean,
        isAsteroidField: boolean,
        isBinaryStar: boolean,
        isBlackHole: boolean,
        isPulsar: boolean,
        wormHoleToStarId: maybeNull(starId),
        infrastructure: object({
            economy: max200,
            industry: max200,
            science: max200,
        }),
        isKingOfTheHillStar: maybeUndefined(boolean),
        name: or(stringValue({
            minLength: 3,
            maxLength: 30,
            trim: true,
            matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
            ignoreForLengthCheck: UNICODE_INVISIBLE_CHARACTERS,
        }), just(undefined))
    })),
    players: or(sizedArray(2, 64, object({
        id: playerId,
        homeStarId: starId,
        credits: max200k,
        creditsSpecialists: max200k,
        technologies: object({
            scanning: max200,
            hyperspace: max200,
            terraforming: max200,
            experimentation: max200,
            weapons: max200,
            banking: max200,
            manufacturing: max200,
            specialists: max200,
        }),
        alias: or(stringValue({
            minLength: 1,
            maxLength: 30,
            trim: true,
            matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
            ignoreForLengthCheck: UNICODE_INVISIBLE_CHARACTERS,
        }), just(undefined)),
    })), just(undefined)),
    carriers: or(sizedArray(0, 500, object({
        id: carrierId,
        playerId: playerId,
        orbiting: or(starId, just(null)),
        waypointsLooped: boolean,
        ships: numberAdv({ integer: true, sign: 'positive', range: { from: 1, to: 20000 } }),
        specialistId: maybeNull(positiveInteger),
        specialistExpireTick: maybeNull(positiveInteger),
        isGift: boolean,
        waypoints: array(object({
            source: starId,
            destination: starId,
            action: stringEnumeration<CarrierWaypointActionType, CarrierWaypointActionType[]>(CarrierWaypointActionTypes),
            actionShips: withDefault(0, positiveInteger),
            delayTicks: withDefault(0, positiveInteger)
        })),
        progress: or(numberAdv({sign: 'positive', range: {from: 0, to: 1}}), just(undefined)),
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
        players: array(playerId),
        name: or(stringValue({
            minLength: 1,
            maxLength: 30,
            trim: true,
            matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
            ignoreForLengthCheck: UNICODE_INVISIBLE_CHARACTERS,
        }), just(undefined))
    })), just(undefined))
});