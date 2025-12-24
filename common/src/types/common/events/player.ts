import type { StarCaptureResult } from "../star";
import type { CombatResult } from "../combat";
import type {BulkUpgradeReport} from "../infrastructureUpgrade";
import type {BaseGameEvent} from "./game";
import type {LedgerType} from "../ledger";
import type {DiplomaticStatus} from "../diplomacy";

export interface BasePlayerEvent<ID> extends BaseGameEvent<ID> {
    playerId: ID;
}

export type PlayerEvent<ID> =
    | PlayerCombatStarEvent<ID>
    | PlayerCombatCarrierEvent<ID>
    | PlayerBulkInfrastructureUpgradedEvent<ID>
    | PlayerCreditsReceivedEvent<ID>
    | PlayerCreditsSentEvent<ID>
    | PlayerSpecialistTokensReceivedEvent<ID>
    | PlayerSpecialistTokensSentEvent<ID>
    | PlayerDebtForgivenEvent<ID>
    | PlayerDebtSettledEvent<ID>
    | PlayerGiftReceivedEvent<ID>
    | PlayerGiftSentEvent<ID>
    | PlayerCarrierSpecialistHiredEvent<ID>
    | PlayerConversationCreatedEvent<ID>
    | PlayerConversationInvitedEvent<ID>
    | PlayerConversationLeftEvent<ID>
    | PlayerDiplomacyStatusChangedEvent<ID>
    | PlayerGalacticCycleCompleteEvent<ID>
    | PlayerStarSpecialistHiredEvent<ID>
    | PlayerRenownReceivedEvent<ID>
    | PlayerRenownSentEvent<ID>
    | PlayerResearchCompleteEvent<ID>
    | PlayerStarAbandonedEvent<ID>
    | PlayerStarDiedEvent<ID>
    | PlayerStarReignitedEvent<ID>
    | PlayerTechnologyReceivedEvent<ID>
    | PlayerTechnologySentEvent<ID>

export interface PlayerCreditsReceivedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCreditsReceived',
    data: {
        fromPlayerId: ID,
        credits: number,
    }
}

export interface PlayerCreditsSentEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCreditsSent',
    data: {
        toPlayerId: ID,
        credits: number,
    }
}

export interface PlayerSpecialistTokensReceivedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCreditsSpecialistsReceived',
    data: {
        fromPlayerId: ID,
        creditsSpecialists: number,
    }
}

export interface PlayerSpecialistTokensSentEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCreditsSpecialistsSent',
    data: {
        toPlayerId: ID,
        creditsSpecialists: number,
    }
}

export interface PlayerDebtForgivenEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerDebtForgiven',
    data: {
        debtorPlayerId: ID,
        creditorPlayerId: ID,
        amount: number,
        ledgerType: LedgerType,
    }
}

export interface PlayerDebtSettledEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerDebtSettled',
    data: {
        debtorPlayerId: ID,
        creditorPlayerId: ID,
        amount: number,
        ledgerType: LedgerType,
    }
}

export interface PlayerGiftReceivedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerGiftReceived',
    data: {
        fromPlayerId: ID,
        carrierId: ID,
        carrierName: string,
        carrierShips: number,
        starId: ID,
        starName: string,
    }
}

export interface PlayerGiftSentEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerGiftSent',
    data: {
        toPlayerId: ID,
        carrierId: ID,
        carrierName: string,
        carrierShips: number,
        starId: ID,
        starName: string,
    }
}

export interface PlayerCarrierSpecialistHiredEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCarrierSpecialistHired',
    data: {
        carrierId: ID,
        carrierName: string,
        specialistId: number,
        specialistName: string,
        specialistDescription: string,
    }
}

export interface PlayerConversationCreatedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerConversationCreated',
    data: {
        conversationId: ID,
        createdBy: ID,
        name: string,
        participants: ID[],
    },
}

export interface PlayerConversationInvitedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerConversationInvited',
    data: {
        conversationId: ID,
        name: string,
        playerId: ID,
    },
}

export interface PlayerConversationLeftEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerConversationLeft',
    data: {
        conversationId: ID,
        name: string,
        playerId: ID,
    },
}

export interface PlayerDiplomacyStatusChangedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerDiplomacyStatusChanged',
    data: DiplomaticStatus<ID>,
}

export interface PlayerGalacticCycleCompleteEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerGalacticCycleComplete',
    data: {
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
    },
}

export interface PlayerStarSpecialistHiredEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerStarSpecialistHired',
    data: {
        starId: ID,
        starName: string,
        specialistId: number,
        specialistName: string,
        specialistDescription: string,
    },
}

export interface PlayerRenownReceivedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerRenownReceived',
    data: {
        fromPlayerId: ID,
        renown: number,
    },
}

export interface PlayerRenownSentEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerRenownSent',
    data: {
        toPlayerId: ID,
        renown: number,
    },
}

export interface PlayerResearchCompleteEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerResearchComplete',
    data: {
        technologyKey: string,
        technologyLevel: number,
        technologyKeyNext: string,
        technologyLevelNext: number,
    },
}

export interface PlayerStarAbandonedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerStarAbandoned',
    data: {
        starId: ID,
        starName: string,
    },
}

export interface PlayerStarDiedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerStarDied',
    data: {
        starId: ID,
        starName: string,
    },
}

export interface PlayerStarReignitedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerStarReignited',
    data: {
        starId: ID,
        starName: string,
    },
}

export interface PlayerTechnologyReceivedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerTechnologyReceived',
    data: {
        fromPlayerId: ID,
        technology: string,
    },
}

export interface PlayerTechnologySentEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerTechnologySent',
    data: {
        toPlayerId: ID,
        technology: string,
    },
}

export interface PlayerCombatStarEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCombatStar';
    data: {
        playerIdOwner: ID;
        playerIdDefenders: ID[];
        playerIdAttackers: ID[];
        starId: ID;
        starName: string;
        captureResult: StarCaptureResult<ID>;
        combatResult: CombatResult<ID>;
    };
}

export interface PlayerCombatCarrierEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCombatCarrier',
    data: {
        playerIdDefenders: ID[];
        playerIdAttackers: ID[];
        combatResult: CombatResult<ID>;
    }
}

export interface PlayerBulkInfrastructureUpgradedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerBulkInfrastructureUpgraded',
    data: {
        upgradeReport: BulkUpgradeReport<ID>,
    }
}