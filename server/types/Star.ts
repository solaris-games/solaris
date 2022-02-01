import { ObjectId } from "mongoose";
import { Location } from "./Location";

export interface NaturalResources {
    economy: number;
    industry: number;
    science: number;
};

export interface Infrastructure {
    economy: number;
    industry: number;
    science: number;
};

export interface IgnoreBulkUpgrade {
    economy: boolean;
    industry: boolean;
    science: boolean;
}

export interface Star {
    _id?: ObjectId;
    ownedByPlayerId: ObjectId | null;
    name: string;
    naturalResources: NaturalResources,
    ships: number;
    shipsActual: number;
    specialistId: number | null;
    homeStar: boolean;
    warpGate: boolean;
    isNebula: boolean;
    isAsteroidField: boolean;
    isBlackHole: boolean;
    wormHoleToStarId: ObjectId | null;
    ignoreBulkUpgrade: IgnoreBulkUpgrade,
    infrastructure: Infrastructure,
    location: Location
}