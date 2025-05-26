import {type Badge, createBadgeRoutes, type AwardedBadge } from "@solaris-common";
import {doGet, doPost, type ResponseResult} from "./index";
import { type Axios } from "axios";

const routes = createBadgeRoutes<string>();

export const getBadges = (axios: Axios) => async (): Promise<ResponseResult<Badge[]>> => {
  return doGet(axios)(routes.listAll, {}, {}, { withCredentials: true});
}

export const getBadgesForUser = (axios: Axios) => async (userId: string): Promise<ResponseResult<AwardedBadge<string>[]>> => {
  return doGet(axios)(routes.listForUser, { userId }, {}, { withCredentials: true});
}

export const getBadgesForPlayer = (axios: Axios) => async (gameId: string, playerId: string): Promise<ResponseResult<AwardedBadge<string>[]>> => {
  return doGet(axios)(routes.listForPlayer, { gameId, playerId }, {}, { withCredentials: true});
}

export const purchaseBadgeForPlayer = (axios: Axios) => async (gameId: string, playerId: string, badgeKey: string): Promise<ResponseResult<null>> => {
  return doPost(axios)(routes.purchaseForPlayer, { gameId, playerId }, {}, { badgeKey }, { withCredentials: true });
}
