import type {InfrastructureType, NaturalResources} from "./star";

export interface StarUpgradeReport<ID> {
    starId: ID;
    starName: string;
    naturalResources: NaturalResources;
    infrastructureCurrent: number;
    infrastructureCostTotal: number;
    nextInfrastructureCost: number;
    infrastructure: number;
    manufacturing?: number;
}

export interface BulkUpgradeReport<ID> {
    budget: number;
    stars: StarUpgradeReport<ID>[];
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

export interface InfrastructureUpgradeReport<ID> {
    playerId: ID;
    starId: ID;
    starName: string;
    infrastructure: number;
    cost: number;
    nextCost: number;
    manufacturing?: number;
    currentResearchTicksEta?: number | null;
    nextResearchTicksEta?: number | null;
};
