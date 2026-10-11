import { DependencyContainer } from "../../services/types/DependencyContainer";
import ShopController from "../controllers/shop";
import { MiddlewareContainer } from "../middleware";
import { SingleRouter } from "../singleRoute";

export default (
    router: SingleRouter,
    mw: MiddlewareContainer,
    container: DependencyContainer,
) => {
    const controller = ShopController(container);

    router.post(
        "/api/shop/galacticcredits/purchase/process",
        mw.auth.authenticate(),
        controller.capture,
    );

    return router;
};
