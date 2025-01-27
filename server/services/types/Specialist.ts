export type SpecialistType = 'star'|'carrier';

export interface Specialist {
    id: number;
    key: string;
    name: string;
    description: string;
    active: {
        official: boolean;
        custom: boolean;
    },
    baseCostCredits: number;
    baseCostCreditsSpecialists: number;
    oneShot: boolean;
    expireTicks: number | null;
    modifiers: {
        local?: {
            speed?: number;
            weapons?: number;
            hyperspace?: number;
            scanning?: number;
            manufacturing?: number;
            terraforming?: number;
            carrierToCarrierCombat?: {
                weapons?: number;
            }
            carrierToStarCombat?: {
                attacker: {
                    weapons?: number;
                    perAlly?: {
                        weapons: number,
                        maxAllies: number,
                    };
                }
                defender: {
                    weapons?: number;
                }
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
            defenderBonus?: number;
            wormHoleConstructor?: boolean;
        }
    }
};
