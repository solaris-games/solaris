import type { ResearchTypeNotRandom } from "./player";
import type {
    PlayerCreditsReceivedEvent, PlayerCreditsSentEvent,
    PlayerDebtEventData,
    PlayerDebtForgivenEvent,
    PlayerDebtSettledEvent,
    PlayerGiftReceivedEvent,
    PlayerGiftSentEvent, PlayerRenownReceivedEvent, PlayerRenownSentEvent, PlayerSpecialistTokensReceivedEvent,
    PlayerSpecialistTokensSentEvent, PlayerTechnologyReceivedEvent, PlayerTechnologySentEvent
} from "./events/player";

export interface TradeTechnology {
    name: ResearchTypeNotRandom;
    level: number;
    cost: number;
};

export type TradeEvent<ID> = { sentDate: Date } &
    (PlayerDebtForgivenEvent<ID>
    | PlayerDebtSettledEvent<ID>
    | PlayerCreditsReceivedEvent<ID>
    | PlayerCreditsSentEvent<ID>
    | PlayerRenownReceivedEvent<ID>
    | PlayerRenownSentEvent<ID>
    | PlayerSpecialistTokensReceivedEvent<ID>
    | PlayerSpecialistTokensSentEvent<ID>
    | PlayerTechnologySentEvent<ID>
    | PlayerTechnologyReceivedEvent<ID>
    | PlayerGiftReceivedEvent<ID>
    | PlayerGiftSentEvent<ID>);

export interface TradeEventTechnology {
    name: string;
    level: number;
    difference: number;
};
