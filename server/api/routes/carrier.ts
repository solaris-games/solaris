import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import CarrierController from '../controllers/carrier';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';
import PlayerMiddleware from '../middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

    const controller = CarrierController(container, io);

    router.put('/api/game/:gameId/carrier/:carrierId/waypoints',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.saveWaypoints,
        mwCore.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/waypoints/loop',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.loopWaypoints,
        mwCore.handleError);
    
    router.put('/api/game/:gameId/carrier/:carrierId/transfer',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.transferShips,
        mwCore.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/gift',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.gift,
        mwCore.handleError);

    router.patch('/api/game/:gameId/carrier/:carrierId/rename',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.rename,
        mwCore.handleError);

    router.delete('/api/game/:gameId/carrier/:carrierId/scuttle',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.scuttle,
        mwCore.handleError);

    router.post('/api/game/:gameId/carrier/calculateCombat',
        mwAuth.authenticate(),
        controller.calculateCombat,
        mwCore.handleError);

    return router;
}