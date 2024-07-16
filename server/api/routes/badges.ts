import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import BadgeController from '../controllers/badges';
import { MiddlewareContainer } from "../middleware";
import { badgesPurchaseBadgeRequestSchema } from "../requests/badges";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = BadgeController(container);

    router.get('/api/badges',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.listAll,
            mw.core.handleError)
    );

    router.get('/api/badges/user/:userId',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.listForUser,
            mw.core.handleError)
    );

    router.post('/api/badges/game/:gameId/player/:playerId',
        ...singleRoute(
            mw.auth.authenticate(),
            validator.body(badgesPurchaseBadgeRequestSchema),
            mw.game.loadGame({
                lean: true,
                state: true,
                'galaxy.players': true
            }),
            controller.purchaseForPlayer,
            mw.core.handleError)
    );

    router.post('/api/badges/user/:userId',
        ...singleRoute(
            mw.auth.authenticate(),
            validator.body(badgesPurchaseBadgeRequestSchema),
            controller.purchaseForUser,
            mw.core.handleError)
    );

    router.get('/api/badges/game/:gameId/player/:playerId',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.game.loadGame({
                lean: true,
                state: true,
                settings: true,
                'galaxy.players': true
            }),
            controller.listForPlayer,
            mw.core.handleError)
    );

    return router;
}