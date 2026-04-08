import {object, PurchaseForPlayerReq, string, Validator} from "@solaris-common";

export const parseBadgesPurchaseRequest: Validator<PurchaseForPlayerReq> = object({
    badgeKey: string,
});
