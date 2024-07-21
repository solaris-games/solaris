import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import LedgerController from '../controllers/ledger';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = LedgerController(container);

    router.get('/api/game/:gameId/ledger/credits',
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            mw.player.loadPlayer,
            controller.detailCredits,
            mw.playerMutex.release()
    );

    router.put('/api/game/:gameId/ledger/credits/forgive/:playerId',
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
            controller.forgiveCredits,
            mw.playerMutex.release()
    );

    router.put('/api/game/:gameId/ledger/credits/settle/:playerId',
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
            controller.settleCredits,
            mw.playerMutex.release()
    );

    router.get('/api/game/:gameId/ledger/creditsSpecialists',
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            mw.player.loadPlayer,
            controller.detailCreditsSpecialists,
            mw.playerMutex.release()
    );

    router.put('/api/game/:gameId/ledger/creditsSpecialists/forgive/:playerId',
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
            controller.forgiveCreditsSpecialists,
            mw.playerMutex.release()
    );

    router.put('/api/game/:gameId/ledger/creditsSpecialists/settle/:playerId',
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
            controller.settleCreditsSpecialists,
            mw.playerMutex.release()
    );

    return router;
}