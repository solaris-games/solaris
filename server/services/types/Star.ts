import { DBObjectId } from "./DBObjectId";
import { InfrastructureUpgradeCosts } from "./InfrastructureUpgrade";
import { Location } from "./Location";
import { MapObject } from "./Map";
import { PlayerTechnologyLevels } from "./Player";
import { Specialist } from 'solaris-common';

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

export interface Star extends MapObject {
    name: string;
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
    wormHoleToStarId: DBObjectId | null;
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

export interface StarCaptureResult {
    capturedById: DBObjectId;
    capturedByAlias: string;
    captureReward: number;
    specialistDestroyed?: boolean;
};
