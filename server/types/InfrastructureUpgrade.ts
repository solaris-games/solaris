import { ObjectId } from "mongoose";
import { InfrastructureType, Star } from "./Star";

export interface BulkUpgradeStar {
    starId: ObjectId;
    starName: string;
    naturalResources: number;
    infrastructureCurrent: number;
    infrastructureCostTotal: number;
};

export interface BulkUpgradeReport {
    budget: number;
    stars: BulkUpgradeStar[];
    cost: number;
    upgraded: number;
    infrastructureType: InfrastructureType;
    ignoredCount: number;
    currentResearchTicksEta?: number | null;
    nextResearchTicksEta?: number | null;
};

export interface InfrastructureUpgradeCosts {
    economy: number | null;
    industry: number | null;
    science: number | null;
    warpGate: number | null;
    carriers: number | null;
};

export interface InfrastructureUpgradeReport {
    playerId: ObjectId;
    starId: ObjectId;
    starName: string;
    infrastructure: number;
    cost: number;
    nextCost: number;
    manufacturing?: number;
    currentResearchTicksEta?: number | null;
    nextResearchTicksEta?: number | null;
};
