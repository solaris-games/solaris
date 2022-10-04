import { Router } from "express";
import { createValidator } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import AuthController from '../controllers/auth';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import { authLoginRequestSchema } from "../requests/auth";

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const validator = createValidator({ passError: true });

    const controller = AuthController(container, io);

    router.post('/api/auth/login',
        validator.body(authLoginRequestSchema),
        controller.login,
        mwCore.handleError);

    router.post('/api/auth/logout',
        controller.logout,
        mwCore.handleError);

    router.post('/api/auth/verify',
        controller.verify);

    router.get('/api/auth/discord',
        controller.authoriseDiscord); // TODO: This should be in another api file. oauth.js?
        
    router.delete('/api/auth/discord',
        mwAuth.authenticate(),
        controller.unauthoriseDiscord,
        mwCore.handleError);

    return router;
}