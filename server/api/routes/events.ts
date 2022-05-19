import { Router } from "express";
import { DependencyContainer } from "../../types/DependencyContainer";
import EventController from '../controllers/event';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';
import PlayerMiddleware from '../middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

    const controller = EventController(container, io);

    router.get('/api/game/:gameId/events',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwPlayer.loadPlayer,
        controller.list,
        mwCore.handleError);

    router.get('/api/game/:gameId/events/trade',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwPlayer.loadPlayer,
        controller.listTrade,
        mwCore.handleError);

    router.patch('/api/game/:gameId/events/markAsRead',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.markAllAsRead,
        mwCore.handleError);

    router.patch('/api/game/:gameId/events/:eventId/markAsRead',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.markAsRead,
        mwCore.handleError);

    router.get('/api/game/:gameId/events/unread',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwPlayer.loadPlayer,
        controller.getUnreadCount,
        mwCore.handleError);

    return router;
}