import {GetRoute, PutRoute} from "./index";
import type {PlayerReputation, ResearchTypeNotRandom} from "../../types/common/player";
import type {TradeEvent, TradeTechnology} from "../../types/common/trade";

export type TradeSendToPlayerRequest<ID> = {
    toPlayerId: ID;
    amount: number;
};

export type TradeSendTechnologyToPlayerRequest<ID> = {
    toPlayerId: ID;
    technology: ResearchTypeNotRandom;
    level: number;
};

export type ReputationResponse<ID> = {
    reputation: PlayerReputation<ID>
}

export const createTradeRoutes = <ID>() => ({
    sendCredits: new PutRoute<{ gameId: ID }, {}, TradeSendToPlayerRequest<ID>, ReputationResponse<ID>>("/api/game/:gameId/trade/credits"),
    sendCreditsSpecialists: new PutRoute<{ gameId: ID }, {}, TradeSendToPlayerRequest<ID>, ReputationResponse<ID>>("/api/game/:gameId/trade/creditsSpecialists"),
    sendRenown: new PutRoute<{ gameId: ID }, {}, TradeSendToPlayerRequest<ID>, {}>("/api/game/:gameId/trade/renown"),
    sendTechnology: new PutRoute<{ gameId: ID }, {}, TradeSendTechnologyToPlayerRequest<ID>, ReputationResponse<ID>>("/api/game/:gameId/trade/tech"),
    listTradeableTechnologies: new GetRoute<{ gameId: ID, toPlayerId: ID }, {}, TradeTechnology[]>("/api/game/:gameId/trade/tech/:toPlayerId"),
    listTradeEvents: new GetRoute<{ gameId: ID, toPlayerId: ID }, {}, TradeEvent<ID>[]>("/api/game/:gameId/trade/:toPlayerId/events"),
});
