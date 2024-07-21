import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import DiplomacyController from '../controllers/diplomacy';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = DiplomacyController(container);

    router.get('/api/game/:gameId/diplomacy',
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                'galaxy.players': true
                // 'galaxy.players._id': 1,
                // 'galaxy.players.userId': 1,
                // 'galaxy.players.diplomacy': 1
            }),
            mw.player.loadPlayer,
            controller.list,
            mw.playerMutex.release()
    );

    router.get('/api/game/:gameId/diplomacy/:toPlayerId',
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                'galaxy.players': true
                // 'galaxy.players._id': 1,
                // 'galaxy.players.userId': 1,
                // 'galaxy.players.diplomacy': 1
            }),
            mw.player.loadPlayer,
            controller.detail,
            mw.playerMutex.release()
    );

    router.put('/api/game/:gameId/diplomacy/ally/:playerId',
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

    router.put('/api/game/:gameId/diplomacy/enemy/:playerId',
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

    router.put('/api/game/:gameId/diplomacy/neutral/:playerId',
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