import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import LedgerController from '../controllers/ledger';
import { MiddlewareContainer } from "../middleware";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = LedgerController(container);

    router.get('/api/game/:gameId/ledger/credits',
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
            mw.player.loadPlayer,
            controller.detailCredits,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/ledger/credits/forgive/:playerId',
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
            controller.forgiveCredits,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/ledger/credits/settle/:playerId',
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
            controller.settleCredits,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/ledger/creditsSpecialists',
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
            mw.player.loadPlayer,
            controller.detailCreditsSpecialists,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/ledger/creditsSpecialists/forgive/:playerId',
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
            controller.forgiveCreditsSpecialists,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/ledger/creditsSpecialists/settle/:playerId',
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
            controller.settleCreditsSpecialists,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    return router;
}