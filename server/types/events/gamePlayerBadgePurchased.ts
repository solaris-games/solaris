import { DBObjectId } from "../DBObjectId";
import { BaseGameEvent } from "./baseGameEvent";

export default interface GamePlayerBadgePurchasedEvent extends BaseGameEvent {
    purchasedByPlayerId: DBObjectId;
    purchasedByPlayerAlias: string;
    purchasedForPlayerId: DBObjectId;
    purchasedForPlayerAlias: string;
    badgeKey: string;
    badgeName: string;
};
