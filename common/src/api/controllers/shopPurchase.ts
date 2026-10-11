import { GetRoute, SimplePostRoute } from "./index";

export type ShopPurchaseResponse = {
    approvalUrl: string;
};

export type ShopProcessPaymentResponse = {
    credits: number;
};

export const createShopPurchaseRoutes = () => ({
    purchaseGalacticCredits: new GetRoute<
        {},
        { amount: number },
        ShopPurchaseResponse
    >("/api/shop/galacticcredits/purchase"),
    processGalacticCredits: new SimplePostRoute<
        { token: string },
        ShopProcessPaymentResponse
    >("/api/shop/galacticcredits/purchase/process"),
});
