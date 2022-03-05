export type SpecialistType = 'star' | 'carrier';

export interface Specialist {
    id: number;
    key: string;
    name: string;
    description: string;
    baseCostCredits: number;
    baseCostCreditsSpecialists: number;
    oneShot: boolean;
    modifiers: {
        local?: {
            speed?: number;
            toCarrierSpeed?: number;
            weapons?: number;
            hyperspace?: number;
            scanning?: number;
            manufacturing?: number;
            terraforming?: number;
            carrierToCarrierCombat?: {
                weapons: number;
            },
            carrierToStarCombat?: {
                weapons: number;
            }
        },
        special?: {
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
            },
            lockWarpGates?: boolean;
            addNaturalResourcesOnTick?: number;
            destroyInfrastructureOnLoss?: boolean;
            economyInfrastructureMultiplier?: number;
            scienceInfrastructureMultiplier?: number;
            creditsPerTickByScience?: number;
            autoCarrierSpecialistAssign?: number;
            combatSwapWeaponsTechnology?: boolean;
        }
    }
};
