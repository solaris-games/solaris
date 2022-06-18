import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ConversationController from '../controllers/conversation';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';
import PlayerMiddleware from '../middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

    const controller = ConversationController(container, io);

    router.get('/api/game/:gameId/conversations',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        controller.list,
        mwCore.handleError);

    router.get('/api/game/:gameId/conversations/private/:withPlayerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        controller.listPrivate,
        mwCore.handleError);

    router.get('/api/game/:gameId/conversations/unread',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        controller.getUnreadCount,
        mwCore.handleError);

    router.get('/api/game/:gameId/conversations/:conversationId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        controller.detail,
        mwCore.handleError);

    router.post('/api/game/:gameId/conversations',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.create,
        mwCore.handleError);
        
    router.patch('/api/game/:gameId/conversations/:conversationId/send',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.sendMessage,
        mwCore.handleError);

    router.patch('/api/game/:gameId/conversations/:conversationId/markAsRead',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.markAsRead,
        mwCore.handleError);

    router.patch('/api/game/:gameId/conversations/:conversationId/mute',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.mute,
        mwCore.handleError);

    router.patch('/api/game/:gameId/conversations/:conversationId/unmute',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.unmute,
        mwCore.handleError);

    router.patch('/api/game/:gameId/conversations/:conversationId/leave',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.leave,
        mwCore.handleError);

    router.patch('/api/game/:gameId/conversations/:conversationId/pin/:messageId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.pinMessage,
        mwCore.handleError);

    router.patch('/api/game/:gameId/conversations/:conversationId/unpin/:messageId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.unpinMessage,
        mwCore.handleError);

    return router;
}