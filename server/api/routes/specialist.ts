import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import SpecialistController from '../controllers/specialist';
import { MiddlewareContainer } from "../middleware";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = SpecialistController(container);

    router.get('/api/game/specialists/bans',
        controller.listBans,
        mw.core.handleError);

    router.get('/api/game/specialists/carrier',
        controller.listCarrier,
        mw.core.handleError);

    router.get('/api/game/specialists/star',
        controller.listStar,
        mw.core.handleError);

    router.get('/api/game/:gameId/specialists/carrier',
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        controller.listCarrierForGame,
        mw.core.handleError);

    router.get('/api/game/:gameId/specialists/star',
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        controller.listStarForGame,
        mw.core.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/hire/:specialistId',
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
        mw.player.validatePlayerState({ isPlayerUndefeated: true }), controller.hireCarrier,
        mw.core.handleError);

    router.put('/api/game/:gameId/star/:starId/hire/:specialistId',
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
        mw.player.validatePlayerState({ isPlayerUndefeated: true }), controller.hireStar,
        mw.core.handleError);

    return router;
}