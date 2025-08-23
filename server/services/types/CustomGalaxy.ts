import { CarrierWaypointActionType } from "./CarrierWaypoint";
import { Location } from "./Location";
import { PlayerTechnologyLevels } from "./Player";
import { Infrastructure, NaturalResources } from "./Star";

export interface CustomGalaxy {
    players?: CustomGalaxyPlayer[];
    stars: CustomGalaxyStar[];
    carriers?: CustomGalaxyCarrier[];
    teams?: CustomGalaxyTeam[];
}

export interface CustomGalaxyPlayer {
    id: string;
    homeStarId: string;
    credits: number;
    creditsSpecialists: number;
    technologies: PlayerTechnologyLevels;
}

export interface CustomGalaxyStar {
    id: string;
    location: Location;
    playerId: string | null;
    naturalResources: NaturalResources;
    shipsActual?: number;
    specialistId: number | null;
    specialistExpireTick: number | null;
    homeStar: boolean;
    warpGate: boolean;
    isNebula: boolean;
    isAsteroidField: boolean;
    isBinaryStar: boolean;
    isBlackHole: boolean;
    isPulsar: boolean;
    wormHoleToStarId: string | null;
    infrastructure: Infrastructure;
    isKingOfTheHillStar?: boolean;
    name?: string;
}

export interface CustomGalaxyCarrier {
    id: string;
    playerId: string;
    orbiting: string | null;
    waypointsLooped: boolean;
    ships: number;
    specialistId: number | null;
    specialistExpireTick: number | null;
    isGift: boolean;
    waypoints: CustomGalaxyCarrierWaypoint[];
    progress?: number;
    name?: string;
}

export interface CustomGalaxyTeam {
    id: string;
    players: string[];
    name?: string;
}

export interface CustomGalaxyCarrierWaypoint {
    source: string;
    destination: string;
    action: CarrierWaypointActionType;
    actionShips: number;
    delayTicks: number;
}