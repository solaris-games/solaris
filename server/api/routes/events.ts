import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import EventController from '../controllers/event';
import { MiddlewareContainer } from "../middleware";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = EventController(container);

    router.get('/api/game/:gameId/events',
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
            controller.list,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.patch('/api/game/:gameId/events/markAsRead',
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
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.markAllAsRead,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.patch('/api/game/:gameId/events/:eventId/markAsRead',
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
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.markAsRead,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/events/unread',
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
            controller.getUnreadCount,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    return router;
}