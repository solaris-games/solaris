import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import AuthController from '../controllers/auth';
import { MiddlewareContainer } from "../middleware";
import { authLoginRequestSchema } from "../requests/auth";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = AuthController(container);

    router.post('/api/auth/login',
        validator.body(authLoginRequestSchema),
        controller.login,
        mw.core.handleError);

    router.post('/api/auth/logout',
        controller.logout,
        mw.core.handleError);

    router.post('/api/auth/verify',
        controller.verify);

    router.get('/api/auth/discord',
        controller.authoriseDiscord); // TODO: This should be in another api file. oauth.js?
        
    router.delete('/api/auth/discord',
        mw.auth.authenticate(),
        controller.unauthoriseDiscord,
        mw.core.handleError);

    return router;
}