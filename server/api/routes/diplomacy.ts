import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import DiplomacyController from '../controllers/diplomacy';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';
import PlayerMiddleware from '../middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

    const controller = DiplomacyController(container, io);

    router.get('/api/game/:gameId/diplomacy',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            'galaxy.players': true
            // 'galaxy.players._id': 1,
            // 'galaxy.players.userId': 1,
            // 'galaxy.players.diplomacy': 1
        }),
        mwPlayer.loadPlayer,
        controller.list,
        mwCore.handleError);

    router.get('/api/game/:gameId/diplomacy/:toPlayerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            'galaxy.players': true
            // 'galaxy.players._id': 1,
            // 'galaxy.players.userId': 1,
            // 'galaxy.players.diplomacy': 1
        }),
        mwPlayer.loadPlayer,
        controller.detail,
        mwCore.handleError);

    router.put('/api/game/:gameId/diplomacy/ally/:playerId',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.declareAlly,
        mwCore.handleError);

    router.put('/api/game/:gameId/diplomacy/enemy/:playerId',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.declareEnemy,
        mwCore.handleError);

    router.put('/api/game/:gameId/diplomacy/neutral/:playerId',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.declareNeutral,
        mwCore.handleError);

    return router;
}