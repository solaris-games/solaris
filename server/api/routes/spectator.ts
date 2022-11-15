import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import SpectatorController from '../controllers/spectator';
import { MiddlewareContainer } from "../middleware";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = SpectatorController(container);

    router.get('/api/game/:gameId/spectators',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: false
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        controller.list,
        mw.core.handleError);

    router.put('/api/game/:gameId/spectators/invite/:userId',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: false
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.invite,
        mw.core.handleError);

    router.put('/api/game/:gameId/spectators/uninvite/:userId',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: false
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.uninvite,
        mw.core.handleError);

    router.delete('/api/game/:gameId/spectators',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: false
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.clear,
        mw.core.handleError);

    return router;
}