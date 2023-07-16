import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ResearchController from '../controllers/research';
import { MiddlewareContainer } from "../middleware";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = ResearchController(container);

    router.put('/api/game/:gameId/research/now',
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
        mw.player.validatePlayerState({ isPlayerUndefeated: true }), controller.updateNow,
        mw.core.handleError);

    router.put('/api/game/:gameId/research/next',
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
        mw.player.validatePlayerState({ isPlayerUndefeated: true }), controller.updateNext,
        mw.core.handleError);

    return router;
}