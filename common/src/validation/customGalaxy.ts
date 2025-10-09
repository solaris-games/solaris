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
    type Validator, named, maybeNull, maybeUndefined
} from "./validate";
import type {CustomGalaxy} from "../types/common/customGalaxy";
import { type CarrierWaypointActionType, CarrierWaypointActionTypes} from "../types/common/carrierWaypoint";

const starId = named("Star ID", stringValue({ minLength: 1 }));
const carrierId = named("Carrier ID", stringValue({ minLength: 1 }));
const playerId = named("Player ID", stringValue({ minLength: 1 }));

export const customGalaxyValidator: Validator<CustomGalaxy> = object({
    stars: array(object({
        id: starId,
        location: object({
            x: number,
            y: number
        }),
        playerId: maybeNull(playerId),
        naturalResources: object({
            economy: positiveInteger,
            industry: positiveInteger,
            science: positiveInteger
        }),
        shipsActual: or(numberAdv({ sign: 'positive' }), just(undefined)),
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
            economy: positiveInteger,
            industry: positiveInteger,
            science: positiveInteger
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
    players: or(array(object({
        id: playerId,
        homeStarId: starId,
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
        id: carrierId,
        playerId: playerId,
        orbiting: or(starId, just(null)),
        waypointsLooped: boolean,
        ships: numberAdv({ integer: true, sign: 'positive', range: { from: 1 } }),
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