import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import SpecialistController from '../controllers/specialist';
import { MiddlewareContainer } from "../middleware";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = SpecialistController(container);

    router.get('/api/game/specialists/bans',
        ...singleRoute(
            controller.listBans,
            mw.core.handleError)
    );

    router.get('/api/game/specialists/carrier',
        ...singleRoute(
            controller.listCarrier,
            mw.core.handleError)
    );

    router.get('/api/game/specialists/star',
        ...singleRoute(
            controller.listStar,
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/specialists/carrier',
        ...singleRoute(
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            controller.listCarrierForGame,
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/specialists/star',
        ...singleRoute(
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            controller.listStarForGame,
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/carrier/:carrierId/hire/:specialistId',
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
            controller.hireCarrier,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/star/:starId/hire/:specialistId',
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
            controller.hireStar,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    return router;
}