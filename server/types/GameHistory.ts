import { ObjectId } from "mongoose";
import { Location } from "./Location";
import { ResearchProgress } from "./Player";
import { IgnoreBulkUpgrade, Infrastructure, NaturalResources } from "./Star";

export interface GameHistoryPlayer {
    userId: ObjectId | null;
    playerId: ObjectId;
    statistics: {
        totalStars: number;
        totalHomeStars: number;
        totalEconomy: number;
        totalIndustry: number;
        totalScience: number;
        totalShips: number;
        totalCarriers: number;
        totalSpecialists: number;
        totalStarSpecialists: number;
        totalCarrierSpecialists: number;
        newShips: number;
        warpgates: number;
    },
    alias: string;
    avatar: string | null;
    researchingNow: string;
    researchingNext: string;
    credits: number;
    creditsSpecialists: number;
    defeated: boolean;
    defeatedDate: Date | null;
    afk: boolean;
    ready: boolean;
    readyToQuit: boolean;
    research: {
        scanning: ResearchProgress,
        hyperspace: ResearchProgress,
        terraforming: ResearchProgress,
        experimentation: ResearchProgress,
        weapons: ResearchProgress,
        banking: ResearchProgress,
        manufacturing: ResearchProgress,
        specialists: ResearchProgress
    }
};

export interface GameHistoryStar {
    starId: ObjectId;
    ownedByPlayerId: ObjectId | null;
    naturalResources: NaturalResources,
    ships: number;
    shipsActual: number;
    specialistId: number | null;
    homeStar: boolean;
    warpGate: boolean;
    ignoreBulkUpgrade: IgnoreBulkUpgrade,
    infrastructure: Infrastructure,
    location: Location
};

export interface GameHistoryCarrierWaypoint {
    source: ObjectId;
    destination: ObjectId;
};

export interface GameHistoryCarrier {
    carrierId: ObjectId;
    ownedByPlayerId: ObjectId;
    name: string;
    orbiting: ObjectId | null;
    ships: number;
    specialistId: number | null;
    isGift: boolean;
    location: Location,
    waypoints: GameHistoryCarrierWaypoint[]
};

export interface GameHistory {
    _id: ObjectId;
    gameId: ObjectId;
    tick: number;
    productionTick: number;
    players: GameHistoryPlayer[],
    stars: GameHistoryStar[],
    carriers: GameHistoryCarrier[]
};
