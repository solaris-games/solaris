import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import TradeController from '../controllers/trade';
import { MiddlewareContainer } from "../middleware";
import { SingleRouter} from "../singleRoute";
import { createTradeRoutes } from "solaris-common";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = TradeController(container);
    const routes = createTradeRoutes();
    const answer = createRoutes(router, mw);

    answer(routes.sendCredits,
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
                isInProgress: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.sendCredits,
            mw.playerMutex.release()
    );

    answer(routes.sendCreditsSpecialists,
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
                isInProgress: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.sendCreditsSpecialists,
            mw.playerMutex.release()
    );

    answer(routes.sendRenown,
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
                isStarted: true
            }),
            mw.player.loadPlayer,
            controller.sendRenown,
            mw.playerMutex.release()
    );

    answer(routes.sendTechnology,
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
                isInProgress: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.sendTechnology,
            mw.playerMutex.release()
    );

    answer(routes.listTradeableTechnologies,
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
                isInProgress: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.listTradeableTechnologies,
            mw.playerMutex.release()
    );

    answer(routes.listTradeEvents,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                'galaxy.players': true
            }),
            mw.player.loadPlayer,
            controller.listTradeEvents,
            mw.playerMutex.release()
    );

    return router;
}