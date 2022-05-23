import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import StarController from '../controllers/star';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';
import PlayerMiddleware from '../middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

    const controller = StarController(container, io);

    router.put('/api/game/:gameId/star/upgrade/economy',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.upgradeEconomy,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/upgrade/industry',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.upgradeIndustry,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/upgrade/science',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.upgradeScience,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/upgrade/bulk',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.upgradeBulk,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/upgrade/bulkCheck',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.upgradeBulkCheck,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/build/warpgate',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.buildWarpGate,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/destroy/warpgate',
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
            isNotFinished: true,
            isStarted: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.destroyWarpGate,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/build/carrier',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.buildCarrier,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/transferall',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.garrisonAllShips,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/abandon',
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
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.abandon,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/toggleignorebulkupgrade',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.toggleBulkIgnore,
        mwCore.handleError);

    router.put('/api/game/:gameId/star/toggleignorebulkupgradeall',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), controller.toggleBulkIgnoreAll,
        mwCore.handleError);

    return router;
}