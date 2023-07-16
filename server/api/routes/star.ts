import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import StarController from '../controllers/star';
import { MiddlewareContainer } from "../middleware";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = StarController(container);

    router.put('/api/game/:gameId/star/upgrade/economy',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.upgradeEconomy,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/upgrade/industry',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.upgradeIndustry,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/upgrade/science',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.upgradeScience,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/upgrade/bulk',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.upgradeBulk,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/upgrade/bulkCheck',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.upgradeBulkCheck,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/build/warpgate',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.buildWarpGate,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/destroy/warpgate',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true,
            isStarted: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.destroyWarpGate,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/build/carrier',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.buildCarrier,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/:starId/transferall',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.garrisonAllShips,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/:starId/distributeall',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.distributeAllShips,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/abandon',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isInProgress: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.abandon,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/toggleignorebulkupgrade',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.toggleBulkIgnore,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/toggleignorebulkupgradeall',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.toggleBulkIgnoreAll,
        mw.core.handleError);

    return router;
}