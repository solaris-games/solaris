import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import BadgeController from '../controllers/badges';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);

    const controller = BadgeController(container, io);

    router.get('/api/badges',
        mwAuth.authenticate(),
        controller.listAll,
        mwCore.handleError);

    router.get('/api/badges/user/:userId',
        mwAuth.authenticate(),
        controller.listForUser,
        mwCore.handleError);

    router.post('/api/badges/game/:gameId/player/:playerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            'galaxy.players': true
        }),
        controller.purchaseForPlayer,
        mwCore.handleError);

    router.post('/api/badges/user/:userId',
        mwAuth.authenticate(),
        controller.purchaseForUser,
        mwCore.handleError);

    router.get('/api/badges/game/:gameId/player/:playerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            settings: true,
            'galaxy.players': true
        }),
        controller.listForPlayer,
        mwCore.handleError);

    return router;
}