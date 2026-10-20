import {
    createShopPurchaseRoutes,
    type ShopProcessPaymentResponse,
    type ShopPurchaseResponse,
} from "@solaris/common";
import type { Axios } from "axios";
import { doGet, doPost, type ResponseResult } from "./index";

const routes = createShopPurchaseRoutes();

export const purchaseGalacticCredits =
    (axios: Axios) =>
    async (amount: number): Promise<ResponseResult<ShopPurchaseResponse>> => {
        return doGet(axios)(
            routes.purchaseGalacticCredits,
            {},
            { amount },
            { withCredentials: true },
        );
    };

export const processGalacticCredits =
    (axios: Axios) =>
    async (
        token: string,
    ): Promise<ResponseResult<ShopProcessPaymentResponse>> => {
        return doPost(axios)(
            routes.processGalacticCredits,
            {},
            {},
            { token },
            { withCredentials: true },
        );
    };
