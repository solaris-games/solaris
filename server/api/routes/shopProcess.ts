import { DependencyContainer } from "../../services/types/DependencyContainer";
import ShopController from '../controllers/shop';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller = ShopController(container);

    router.get('/api/shop/galacticcredits/purchase/process',
            mw.auth.authenticate(),
            controller.process
    );

    return router;
}