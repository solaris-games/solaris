import {GetRoute, PutRoute} from "./index";
import type {DiplomaticStatus} from "../../types/common/diplomacy";

export const createDiplomacyRoutes = <ID>() => ({
    listDiplomacy: new GetRoute<{ gameId: ID }, {}, DiplomaticStatus<ID>[]>("/api/game/:gameId/diplomacy"),
    detailDiplomacy: new GetRoute<{ gameId: ID, toPlayer: ID }, {}, DiplomaticStatus<ID>>("/api/game/:gameId/diplomacy/:toPlayerId"),
    ally: new PutRoute<{ gameId: ID, playerId: ID }, {}, {}, DiplomaticStatus<ID>>("/api/game/:gameId/diplomacy/ally/:playerId"),
    enemy: new PutRoute<{ gameId: ID, playerId: ID }, {}, {}, DiplomaticStatus<ID>>("/api/game/:gameId/diplomacy/enemy/:playerId"),
    neutral: new PutRoute<{ gameId: ID, playerId: ID }, {}, {}, DiplomaticStatus<ID>>("/api/game/:gameId/diplomacy/neutral/:playerId"),
});
