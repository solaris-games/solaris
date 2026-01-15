import type { InfrastructureUpgradeCosts } from "./infrastructureUpgrade";
import type { Location } from "./location";
import type { MapObject } from "./map";
import type { PlayerTechnologyLevels } from "./player";
import type { Specialist } from "./specialist";

export interface NaturalResources {
    economy: number;
    industry: number;
    science: number;
};

export interface TerraformedResources extends NaturalResources {
    
};

export type InfrastructureType = 'economy' | 'industry' | 'science';

export interface Infrastructure {
    economy: number | null;
    industry: number | null;
    science: number | null;
};

export interface IgnoreBulkUpgrade {
    economy: boolean;
    industry: boolean;
    science: boolean;
};

export interface Star<ID> extends MapObject<ID> {
    naturalResources: NaturalResources;
    terraformedResources?: TerraformedResources;
    ships: number | null;
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
    wormHoleToStarId: ID | null;
    ignoreBulkUpgrade?: IgnoreBulkUpgrade;
    infrastructure: Infrastructure;
    isKingOfTheHillStar?: boolean;
    locationNext?: Location;
    specialist?: Specialist | null;
    targeted?: boolean;
    upgradeCosts?: InfrastructureUpgradeCosts;
    manufacturing?: number;
    isInScanningRange?: boolean;
    effectiveTechs?: PlayerTechnologyLevels;
};

export interface StarCaptureResult<ID> {
    capturedById: ID;
    capturedByAlias: string;
    captureReward: number;
    specialistDestroyed?: boolean;
};
