import { DBObjectId } from "./DBObjectId";
import { Location } from "./Location";
import { PlayerResearch, ResearchType, ResearchTypeNotRandom } from "./Player";
import { IgnoreBulkUpgrade, Infrastructure, NaturalResources } from "./Star";

export interface GameHistoryPlayer {
    userId: DBObjectId | null;
    playerId: DBObjectId;
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
    researchingNow: ResearchTypeNotRandom;
    researchingNext: ResearchType;
    credits: number;
    creditsSpecialists: number;
    isOpenSlot: boolean;
    defeated: boolean;
    defeatedDate: Date | null;
    afk: boolean;
    ready: boolean;
    readyToQuit: boolean;
    research: PlayerResearch,
};

export interface GameHistoryStar {
    starId: DBObjectId;
    ownedByPlayerId: DBObjectId | null;
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
    source: DBObjectId;
    destination: DBObjectId;
};

export interface GameHistoryCarrier {
    carrierId: DBObjectId;
    ownedByPlayerId: DBObjectId;
    name: string;
    orbiting: DBObjectId | null;
    ships: number;
    specialistId: number | null;
    isGift: boolean;
    location: Location,
    waypoints: GameHistoryCarrierWaypoint[]
};

export interface GameHistory {
    _id?: DBObjectId;
    gameId: DBObjectId;
    tick: number;
    productionTick: number;
    players: GameHistoryPlayer[],
    stars: GameHistoryStar[],
    carriers: GameHistoryCarrier[]
};
