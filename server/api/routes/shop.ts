import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ShopController from '../controllers/shop';
import { MiddlewareContainer } from "../middleware";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = ShopController(container);

    router.get('/api/shop/galacticcredits/purchase',
        mw.auth.authenticate(),
        controller.purchase,
        mw.core.handleError);

    router.get('/api/shop/galacticcredits/purchase/process',
        mw.auth.authenticate(),
        controller.process,
        mw.core.handleError);

    return router;
}