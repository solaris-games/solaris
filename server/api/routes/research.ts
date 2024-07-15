import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ResearchController from '../controllers/research';
import { MiddlewareContainer } from "../middleware";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = ResearchController(container);

    router.put('/api/game/:gameId/research/now',
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
            controller.updateNow,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/research/next',
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
            controller.updateNext,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    return router;
}