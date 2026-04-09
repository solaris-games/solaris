import { DependencyContainer } from "../../services/types/DependencyContainer";
import AuthController from '../controllers/auth';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import {createAuthRoutes} from "@solaris/common";
import {DBObjectId} from "../../services/types/DBObjectId";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller = AuthController(container);
    const routes = createAuthRoutes<DBObjectId>();
    const answer = createRoutes(router, mw);

    answer(routes.login,
            controller.login
    );

    answer(routes.logout,
            controller.logout
    );

    answer(routes.verify,
            controller.verify
    );

    answer(routes.authoriseDiscord,
            controller.authoriseDiscord // TODO: This should be in another api file. oauth.js?
    );

    answer(routes.unauthoriseDiscord,
            mw.auth.authenticate(),
            controller.unauthoriseDiscord
    );

    return router;
}