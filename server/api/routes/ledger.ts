import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import LedgerController from '../controllers/ledger';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';
import PlayerMiddleware from '../middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

    const controller = LedgerController(container, io);

    router.get('/api/game/:gameId/ledger/credits',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwPlayer.loadPlayer,
        controller.detailCredits,
        mwCore.handleError);

    router.put('/api/game/:gameId/ledger/credits/forgive/:playerId',
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
        controller.forgiveCredits,
        mwCore.handleError);

    router.put('/api/game/:gameId/ledger/credits/settle/:playerId',
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
        controller.settleCredits,
        mwCore.handleError);

        router.get('/api/game/:gameId/ledger/creditsSpecialists',
            mwAuth.authenticate(),
            mwGame.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            mwPlayer.loadPlayer,
            controller.detailCreditsSpecialists,
            mwCore.handleError);
    
        router.put('/api/game/:gameId/ledger/creditsSpecialists/forgive/:playerId',
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
            controller.forgiveCreditsSpecialists,
            mwCore.handleError);
    
        router.put('/api/game/:gameId/ledger/creditsSpecialists/settle/:playerId',
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
            controller.settleCreditsSpecialists,
            mwCore.handleError);

    return router;
}