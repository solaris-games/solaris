import { DBObjectId } from "../DBObjectId";
import { InternalGameEvent } from "./InternalGameEvent";

export default interface InternalGamePlayerBadgePurchasedEvent extends InternalGameEvent {
    purchasedByPlayerId: DBObjectId;
    purchasedByPlayerAlias: string;
    purchasedForPlayerId: DBObjectId;
    purchasedForPlayerAlias: string;
    badgeKey: string;
    badgeName: string;
};
