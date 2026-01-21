import { InternalGameEvent } from "./InternalGameEvent";
import {DBObjectId} from "../DBObjectId";

export default interface InternalPlayerGalacticCycleCompleteEvent extends InternalGameEvent {
    playerId: DBObjectId;
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
