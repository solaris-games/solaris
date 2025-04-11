import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ConversationController from '../controllers/conversation';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = ConversationController(container);

    router.get('/api/game/:gameId/conversations',
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

    router.get('/api/game/:gameId/conversations/private/:withPlayerId',
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

    router.get('/api/game/:gameId/conversations/unread',
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

    router.get('/api/game/:gameId/conversations/:conversationId',
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

    router.post('/api/game/:gameId/conversations',
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

    router.patch('/api/game/:gameId/conversations/:conversationId/send',
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

    router.patch('/api/game/:gameId/conversations/:conversationId/markAsRead',
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

    router.patch('/api/game/:gameId/conversations/:conversationId/mute',
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

    router.patch('/api/game/:gameId/conversations/:conversationId/unmute',
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

    router.patch('/api/game/:gameId/conversations/:conversationId/leave',
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

    router.patch('/api/game/:gameId/conversations/:conversationId/pin/:messageId',
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

    router.patch('/api/game/:gameId/conversations/:conversationId/unpin/:messageId',
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