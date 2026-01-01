import type { StarCaptureResult } from "../star";
import type { CombatResult } from "../combat";
import type {BulkUpgradeReport} from "../infrastructureUpgrade";
import type {BaseGameEvent} from "./game";
import type {LedgerType} from "../ledger";
import type {DiplomaticStatus} from "../diplomacy";
import type {TradeEventTechnology} from "../trade";

export interface BasePlayerEvent<ID> extends BaseGameEvent<ID> {
    playerId: ID;
}

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

export interface BasePlayerDebtEvent<ID> extends BasePlayerEvent<ID> {
    data: {
        debtorPlayerId: ID,
        creditorPlayerId: ID,
        amount: number,
        ledgerType: LedgerType,
    }
}

export interface PlayerDebtForgivenEvent<ID> extends BasePlayerDebtEvent<ID> {
    type: 'playerDebtForgiven',
}

export interface PlayerDebtSettledEvent<ID> extends BasePlayerDebtEvent<ID> {
    type: 'playerDebtSettled',
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
        technology: TradeEventTechnology,
    },
}

export interface PlayerTechnologySentEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerTechnologySent',
    data: {
        toPlayerId: ID,
        technology: TradeEventTechnology,
    },
}

export interface CombatEventData<ID> {
    playerIdDefenders: ID[];
    playerIdAttackers: ID[];
    combatResult: CombatResult<ID>;
}

export interface BaseCombatEvent<ID> extends BasePlayerEvent<ID> {
    data: CombatEventData<ID>,
}

export interface PlayerCombatStarEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCombatStar';
    data: CombatEventData<ID> & {
        playerIdOwner: ID;
        starId: ID;
        starName: string;
        captureResult: StarCaptureResult<ID>;
    };
}

export interface PlayerCombatCarrierEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCombatCarrier',
    data: CombatEventData<ID>,
}

export interface PlayerBulkInfrastructureUpgradedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerBulkInfrastructureUpgraded',
    data: {
        upgradeReport: BulkUpgradeReport<ID>,
    }
}