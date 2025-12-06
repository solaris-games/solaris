import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import DiplomacyController from '../controllers/diplomacy';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import {createDiplomacyRoutes} from "solaris-common";
import {DBObjectId} from "../../services/types/DBObjectId";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = DiplomacyController(container);
    const routes = createDiplomacyRoutes<DBObjectId>();
    const answer = createRoutes(router, mw);

    answer(routes.listDiplomacy,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                'galaxy.players': true
            }),
            mw.player.loadPlayer,
            controller.list,
            mw.playerMutex.release()
    );

    answer(routes.detailDiplomacy,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                'galaxy.players': true
            }),
            mw.player.loadPlayer,
            controller.detail,
            mw.playerMutex.release()
    );

    answer(routes.ally,
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
            controller.declareAlly,
            mw.playerMutex.release()
    );

    answer(routes.enemy,
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
            controller.declareEnemy,
            mw.playerMutex.release()
    );

    answer(routes.neutral,
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
            controller.declareNeutral,
            mw.playerMutex.release()
    );

    return router;
}