import { object, string, Validator } from "@solaris/common";
import { integerFromQueryString } from "../../utils/validation";

export interface ProcessPaymentRequest {
    token: string;
}

export const parseProcessPaymentRequest: Validator<ProcessPaymentRequest> =
    object({
        token: string,
    });

export interface ShopPurchaseRequest {
    amount: number;
}

const MAX_PURCHASE_TOKENS = 1000;

export const parseShopPurchaseRequest: Validator<ShopPurchaseRequest> = object({
    amount: integerFromQueryString({
        range: {
            from: 1,
            to: MAX_PURCHASE_TOKENS,
        },
    }),
});
