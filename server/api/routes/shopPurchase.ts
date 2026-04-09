import { DependencyContainer } from "../../services/types/DependencyContainer";
import ShopController from '../controllers/shop';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import {createShopPurchaseRoutes} from "@solaris/common";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller = ShopController(container);
    const routes = createShopPurchaseRoutes();
    const answer = createRoutes(router, mw);

    answer(routes.purchaseGalacticCredits,
        mw.auth.authenticate(),
        controller.purchase,
    );

    return router;
}