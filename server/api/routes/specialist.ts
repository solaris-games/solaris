import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import SpecialistController from '../controllers/specialist';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';
import PlayerMiddleware from '../middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

    const controller = SpecialistController(container, io);

    router.get('/api/game/specialists/bans',
        controller.listBans,
        mwCore.handleError);

    router.get('/api/game/specialists/carrier',
        controller.listCarrier,
        mwCore.handleError);

    router.get('/api/game/specialists/star',
        controller.listStar,
        mwCore.handleError);

    router.get('/api/game/:gameId/specialists/carrier',
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        controller.listCarrierForGame,
        mwCore.handleError);

    router.get('/api/game/:gameId/specialists/star',
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        controller.listStarForGame,
        mwCore.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/hire/:specialistId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.hireCarrier,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/:starId/hire/:specialistId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.hireStar,
        mwCore.handleError);

    return router;
}