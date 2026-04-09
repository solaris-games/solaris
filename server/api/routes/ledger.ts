import { DependencyContainer } from "../../services/types/DependencyContainer";
import LedgerController from '../controllers/ledger';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import {createLedgerRoutes} from "@solaris/common";
import {DBObjectId} from "../../services/types/DBObjectId";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller = LedgerController(container);
    const routes = createLedgerRoutes<DBObjectId>();
    const answer = createRoutes(router, mw);

    answer(routes.detailLedgerCredits,
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

    answer(routes.forgiveLedgerCredits,
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

    answer(routes.settleLedgerCredits,
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

    answer(routes.detailLedgerSpecialistTokens,
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

    answer(routes.forgiveLedgerSpecialistTokens,
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

    answer(routes.settleLedgerSpecialistTokens,
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