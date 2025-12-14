import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ConversationController from '../controllers/conversation';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import {createConversationRoutes} from "solaris-common";
import {DBObjectId} from "../../services/types/DBObjectId";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = ConversationController(container);
    const routes = createConversationRoutes<DBObjectId>();
    const answer = createRoutes(router, mw);

    answer(routes.list,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.player.loadPlayer,
            controller.list,
            mw.playerMutex.release()
    );

    answer(routes.listPrivate,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.player.loadPlayer,
            controller.listPrivate,
            mw.playerMutex.release()
    );

    answer(routes.getUnreadCount,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.player.loadPlayer,
            controller.getUnreadCount,
            mw.playerMutex.release()
    );

    answer(routes.detail,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.player.loadPlayer,
            controller.detail,
            mw.playerMutex.release()
    );

    answer(routes.create,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.create,
            mw.playerMutex.release()
    );

    answer(routes.sendMessage,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                settings: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.sendMessage,
            mw.playerMutex.release()
    );

    answer(routes.markAsRead,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.markAsRead,
            mw.playerMutex.release()
    );

    answer(routes.mute,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.mute,
            mw.playerMutex.release()
    );

    answer(routes.unmute,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.unmute,
            mw.playerMutex.release()
    );

    answer(routes.leave,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.leave,
            mw.playerMutex.release()
    );

    answer(routes.pinMessage,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.pinMessage,
            mw.playerMutex.release()
    );

    answer(routes.unpinMessage,
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                state: true,
                conversations: true,
                'galaxy.players': true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.unpinMessage,
            mw.playerMutex.release()
    );

    return router;
}