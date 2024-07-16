import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import StarController from '../controllers/star';
import { MiddlewareContainer } from "../middleware";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = StarController(container);

    router.put('/api/game/:gameId/star/upgrade/economy',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/upgrade/industry',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/upgrade/science',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/upgrade/bulk',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/upgrade/bulkCheck',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/upgrade/scheduleBulk',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            controller.scheduleBulk,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/upgrade/toggleBulkRepeat',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            controller.toggleBulkRepeat,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/upgrade/trashBulk',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            controller.trashBulk,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/build/warpgate',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/destroy/warpgate',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/build/carrier',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/:starId/transferall',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/:starId/distributeall',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/abandon',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/toggleignorebulkupgrade',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/toggleignorebulkupgradeall',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    return router;
}