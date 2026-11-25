export type SpecialistType = "star" | "carrier";

export interface SpecialistModifiersLocal {
    speed?: number;
    weapons?: number;
    hyperspace?: number;
    scanning?: number;
    manufacturing?: number;
    terraforming?: number;
    carrierToCarrierCombat?: {
        weapons?: number;
    };
    carrierToStarCombat?: {
        captureTargetedPlayers?: boolean;
        attacker: {
            weapons?: number;
            perAlly?: {
                weapons: number;
                maxAllies: number;
            };
        };
        defender: {
            weapons?: number;
        };
    };
}

export interface SpecialistModifiersSpecial {
    hideShips?: boolean;
    deductEnemyWeapons?: number;
    unlockWarpGates?: boolean;
    starCaptureRewardMultiplier?: number;
    avoidCombatCarrierToCarrier?: boolean;
    reigniteDeadStar?: boolean;
    reigniteDeadStarNaturalResources?: {
        economy: number;
        industry: number;
        science: number;
    };
    lockWarpGates?: boolean;
    addNaturalResourcesOnTick?: number;
    destroyInfrastructureOnLoss?: boolean;
    economyInfrastructureMultiplier?: number;
    scienceInfrastructureMultiplier?: number;
    creditsPerTickByScience?: number;
    autoCarrierSpecialistAssign?: number;
    combatSwapWeaponsTechnology?: boolean;
    defenderBonus?: number;
    wormHoleConstructor?: boolean;
    moveStar?: boolean;
    starMovementPerTick?: number;
    attractStar?: boolean;
}

export interface Specialist {
    id: number;
    key: string;
    name: string;
    description: string;
    active: {
        official: boolean;
        custom: boolean;
    };
    baseCostCredits: number;
    baseCostCreditsSpecialists: number;
    oneShot: boolean;
    expireTicks: number | null;
    modifiers: {
        local?: SpecialistModifiersLocal;
        special?: SpecialistModifiersSpecial;
    };
}
