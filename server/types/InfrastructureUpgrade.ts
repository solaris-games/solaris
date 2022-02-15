import { DBObjectId } from "./DBObjectId";
import { InfrastructureType, Star } from "./Star";

export interface BulkUpgradeReport {
    budget: number;
    stars: any[];
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
    playerId: DBObjectId;
    starId: DBObjectId;
    starName: string;
    infrastructure: number;
    cost: number;
    nextCost: number;
    manufacturing?: number;
    currentResearchTicksEta?: number | null;
    nextResearchTicksEta?: number | null;
};
