import { BaseEvent } from "./baseEvent";

export default interface PlayerGalacticCycleCompleteEvent extends BaseEvent {
    creditsEconomy: number;
    creditsBanking: number;
    creditsSpecialists: number;
    experimentTechnology: string | null;
    experimentTechnologyLevel: number | null;
    experimentAmount: number | null;
    experimentLevelUp: boolean | null;
    experimentResearchingNext: string | null;
    carrierUpkeep: {
        carrierCount: number;
        totalCost: number
    } | null;
    allianceUpkeep: {
        allianceCount: number;
        totalCost: number;
    } | null;
};
