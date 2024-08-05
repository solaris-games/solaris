import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import AuthController from '../controllers/auth';
import { MiddlewareContainer } from "../middleware";
import { authLoginRequestSchema } from "../requests/auth";
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = AuthController(container);

    router.post('/api/auth/login',
            validator.body(authLoginRequestSchema),
            controller.login
    );

    router.post('/api/auth/logout',
        
            controller.logout
    );

    router.post('/api/auth/verify',
            controller.verify
    );

    router.get('/api/auth/discord',
            controller.authoriseDiscord // TODO: This should be in another api file. oauth.js?
    );

    router.delete('/api/auth/discord',
            mw.auth.authenticate(),
            controller.unauthoriseDiscord
    );

    return router;
}