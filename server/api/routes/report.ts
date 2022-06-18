import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ReportController from '../controllers/report';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';
import PlayerMiddleware from '../middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

    const controller = ReportController(container, io);

    router.post('/api/game/:gameId/report',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        controller.create,
        mwCore.handleError);

    return router;
}