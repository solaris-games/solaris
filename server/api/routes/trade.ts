import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import TradeController from '../controllers/trade';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';
import PlayerMiddleware from '../middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

    const controller = TradeController(container, io);

    router.put('/api/game/:gameId/trade/credits',
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
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.sendCredits,
        mwCore.handleError);

    router.put('/api/game/:gameId/trade/creditsSpecialists',
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
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.sendCreditsSpecialists,
        mwCore.handleError);

    router.put('/api/game/:gameId/trade/renown',
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
            isStarted: true
        }),
        mwPlayer.loadPlayer,
        controller.sendRenown,
        mwCore.handleError);

    router.put('/api/game/:gameId/trade/tech',
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
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.sendTechnology,
        mwCore.handleError);

    router.get('/api/game/:gameId/trade/tech/:toPlayerId',
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
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.listTradeableTechnologies,
        mwCore.handleError);

    router.get('/api/game/:gameId/trade/:toPlayerId/events',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        controller.listTradeEvents,
        mwCore.handleError);

    return router;
}