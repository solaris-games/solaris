import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import EventController from '../controllers/event';
import { MiddlewareContainer } from "../middleware";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = EventController(container);

    router.get('/api/game/:gameId/events',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.player.loadPlayer,
        controller.list,
        mw.core.handleError);

    router.patch('/api/game/:gameId/events/markAsRead',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true
        }),
        mw.player.loadPlayer,
        controller.markAllAsRead,
        mw.core.handleError);

    router.patch('/api/game/:gameId/events/:eventId/markAsRead',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.game.validateGameState({
            isUnlocked: true
        }),
        mw.player.loadPlayer,
        controller.markAsRead,
        mw.core.handleError);

    router.get('/api/game/:gameId/events/unread',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mw.player.loadPlayer,
        controller.getUnreadCount,
        mw.core.handleError);

    return router;
}