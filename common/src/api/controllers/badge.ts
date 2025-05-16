import {GetRoute, PostRoute, SimpleGetRoute} from "./index";
import { type Badge} from "../types/common/badge";
import { type AwardedBadge } from "../types/common/user";

export type PurchaseForPlayerReq = {
    badgeKey: string;
}

export const createBadgeRoutes = <ID>() => ({
    listAll: new SimpleGetRoute<Badge[]>('/api/badges'),
    listForUser: new GetRoute<{userId: string}, {}, AwardedBadge<ID>[]>('/api/badges/user/:userId'),
    listForPlayer: new GetRoute<{ gameId: string, playerId: string }, {}, AwardedBadge<ID>[]>('/api/badges/game/:gameId/player/:playerId'),
    purchaseForPlayer: new PostRoute<{ gameId: string, playerId: string }, {}, PurchaseForPlayerReq, null>('/api/badges/game/:gameId/player/:playerId'),
});