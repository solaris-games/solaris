import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ConversationController from '../controllers/conversation';
import { MiddlewareContainer } from "../middleware";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = ConversationController(container);

    router.get('/api/game/:gameId/conversations',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/conversations/private/:withPlayerId',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/conversations/unread',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/conversations/:conversationId',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.post('/api/game/:gameId/conversations',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.patch('/api/game/:gameId/conversations/:conversationId/send',
        ...singleRoute(
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
            controller.sendMessage,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.patch('/api/game/:gameId/conversations/:conversationId/markAsRead',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.patch('/api/game/:gameId/conversations/:conversationId/mute',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.patch('/api/game/:gameId/conversations/:conversationId/unmute',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.patch('/api/game/:gameId/conversations/:conversationId/leave',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.patch('/api/game/:gameId/conversations/:conversationId/pin/:messageId',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.patch('/api/game/:gameId/conversations/:conversationId/unpin/:messageId',
        ...singleRoute(
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
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    return router;
}