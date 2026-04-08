import { DependencyContainer } from "../../services/types/DependencyContainer";
import BadgeController from '../controllers/badges';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import {createBadgeRoutes} from "solaris-common";
import {createRoutes} from "../typedapi/routes";
import {DBObjectId} from "../../services/types/DBObjectId";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller = BadgeController(container);
    const routes = createBadgeRoutes<DBObjectId>();

    const answer = createRoutes(router, mw);

    answer(routes.listAll,
            mw.auth.authenticate(),
            controller.listAll
    );

    answer(routes.listForUser,
            mw.auth.authenticate(),
            controller.listForUser
    );

    answer(routes.purchaseForPlayer,
            mw.auth.authenticate(),
            mw.game.loadGame({
                lean: true,
                state: true,
                settings: true,
                'galaxy.players': true
            }),
            controller.purchaseForPlayer
    );

    answer(routes.listForPlayer,
            mw.auth.authenticate(),
            mw.game.loadGame({
                lean: true,
                state: true,
                settings: true,
                'galaxy.players': true
            }),
            controller.listForPlayer
    );

    return router;
}