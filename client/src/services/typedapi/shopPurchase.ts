import {createShopPurchaseRoutes, type ShopPurchaseResponse} from "@solaris/common";
import type { Axios } from "axios";
import {doGet, type ResponseResult} from "@/services/typedapi/index";

const routes = createShopPurchaseRoutes();

export const purchaseGalacticCredits = (axios: Axios) => async (amount: number): Promise<ResponseResult<ShopPurchaseResponse>> => {
  return doGet(axios)(routes.purchaseGalacticCredits, {}, { amount }, { withCredentials: true });
};
