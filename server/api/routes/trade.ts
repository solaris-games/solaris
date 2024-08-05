import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import TradeController from '../controllers/trade';
import { MiddlewareContainer } from "../middleware";
import { SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = TradeController(container);

    router.put('/api/game/:gameId/trade/credits',
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

    router.put('/api/game/:gameId/trade/creditsSpecialists',
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

    router.put('/api/game/:gameId/trade/renown',
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

    router.put('/api/game/:gameId/trade/tech',
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

    router.get('/api/game/:gameId/trade/tech/:toPlayerId',
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

    router.get('/api/game/:gameId/trade/:toPlayerId/events',
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