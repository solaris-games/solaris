import { GetRoute } from "./index";

export type ShopPurchaseResponse = {
    approvalUrl: string;
};

export const createShopPurchaseRoutes = () => ({
    purchaseGalacticCredits: new GetRoute<
        {},
        { amount: number },
        ShopPurchaseResponse
    >("/api/shop/galacticcredits/purchase"),
});
