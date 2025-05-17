import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import SpectatorController from '../controllers/spectator';
import { MiddlewareContainer } from "../middleware";
import { spectatorInviteSpectatorRequestSchema } from "../requests/spectator";
import { SingleRouter } from "../singleRoute";
import {createSpectatorRoutes} from "solaris-common/dist/api/controllers/spectator";
import {DBObjectId} from "../../services/types/DBObjectId";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = SpectatorController(container);
    const routes = createSpectatorRoutes<DBObjectId>();
    const answer = createRoutes(router, mw);

    answer(routes.listSpectators,
        mw.auth.authenticate(),
        mw.playerMutex.wait(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: false
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mw.player.loadPlayer,
        controller.list,
        mw.playerMutex.release());

    answer(routes.inviteSpectators,
            mw.auth.authenticate(),
            validator.body(spectatorInviteSpectatorRequestSchema),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: false
            }),
            mw.game.validateGameState({
                isUnlocked: true,
                isNotFinished: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.invite,
            mw.playerMutex.release()
    );

    answer(routes.uninviteSpectator,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: false
            }),
            mw.game.validateGameState({
                isUnlocked: true,
                isNotFinished: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.uninvite,
            mw.playerMutex.release()
    );

    answer(routes.clearSpectators,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: false
            }),
            mw.game.validateGameState({
                isUnlocked: true,
                isNotFinished: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.clear,
            mw.playerMutex.release()
    );

    return router;
}