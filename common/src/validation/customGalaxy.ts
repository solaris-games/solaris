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
    type Validator
} from "./validate";
import type {CustomGalaxy} from "../api/types/common/customGalaxy";
import { type CarrierWaypointActionType, CarrierWaypointActionTypes} from "../api/types/common/carrierWaypoint";

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