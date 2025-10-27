import {DBObjectId} from "./DBObjectId";
import {Infrastructure, NaturalResources} from "./Star";
import {PlayerDiplomaticState, PlayerResearch, ResearchType, ResearchTypeNotRandom} from "./Player";
import {Location} from "./Location";
import {CarrierWaypoint} from "@solaris-common";

export type InitialStar = {
    starId: DBObjectId,
    name: string,
    naturalResources: NaturalResources,
    infrastructure: Infrastructure,
    ships: number | null,
    ownedByPlayerId: DBObjectId | null,
    warpGate: boolean,
    isNebula: boolean;
    isAsteroidField: boolean;
    isBinaryStar: boolean;
    isBlackHole: boolean;
    isPulsar: boolean;
    wormHoleToStarId: DBObjectId | null;
    specialistId: number | null;
    specialistExpireTick: number | null;
}

export type InitialPlayer = {
    playerId: DBObjectId,
    researchingNow: ResearchTypeNotRandom;
    researchingNext: ResearchType;
    credits: number;
    creditsSpecialists: number;
    research: PlayerResearch,
    diplomacy: PlayerDiplomaticState[],
}

export type InitialCarrier = {
    carrierId: DBObjectId,
    orbiting: DBObjectId | null,
    name: string,
    ownedByPlayerId: DBObjectId,
    ships: number,
    specialistId: number | null,
    specialistExpireTick: number | null,
    isGift: boolean,
    location: Location,
    waypoints: CarrierWaypoint<DBObjectId>[];
}

export type InitialGameState = {
    _id: DBObjectId;
    gameId: DBObjectId;
    galaxy: {
        stars: InitialStar[],
        players: InitialPlayer[],
        carriers: InitialCarrier[],
    },
};
