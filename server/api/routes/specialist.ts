import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import SpecialistController from '../controllers/specialist';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import {createSpecialistRoutes} from "solaris-common";
import {DBObjectId} from "../../services/types/DBObjectId";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = SpecialistController(container);
    const routes = createSpecialistRoutes<DBObjectId>();

    const answer = createRoutes(router, mw);

    answer(routes.listBans,
            controller.listBans
    );

    answer(routes.listCarrier,
            controller.listCarrier
    );

    answer(routes.listStar,
            controller.listStar
    );

    answer(routes.listCarrierForGame,
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            controller.listCarrierForGame
    );

    answer(routes.listStarForGame,
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            controller.listStarForGame
    );

    answer(routes.hireCarrier,
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
            mw.playerMutex.release()
    );

    answer(routes.hireStar,
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
            mw.playerMutex.release()
    );

    return router;
}