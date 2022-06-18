import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ShopController from '../controllers/shop';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);

    const controller = ShopController(container, io);

    router.get('/api/shop/galacticcredits/purchase',
        mwAuth.authenticate(),
        controller.purchase,
        mwCore.handleError);

    router.get('/api/shop/galacticcredits/purchase/process',
        mwAuth.authenticate(),
        controller.process,
        mwCore.handleError);

    return router;
}