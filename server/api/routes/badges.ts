import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import BadgeController from '../controllers/badges';
import { MiddlewareContainer } from "../middleware";
import { badgesPurchaseBadgeRequestSchema } from "../requests/badges";
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = BadgeController(container);

    router.get('/api/badges',
            mw.auth.authenticate(),
            controller.listAll
    );

    router.get('/api/badges/user/:userId',
            mw.auth.authenticate(),
            controller.listForUser
    );

    router.post('/api/badges/game/:gameId/player/:playerId',
            mw.auth.authenticate(),
            validator.body(badgesPurchaseBadgeRequestSchema),
            mw.game.loadGame({
                lean: true,
                state: true,
                'galaxy.players': true
            }),
            controller.purchaseForPlayer
    );

    router.post('/api/badges/user/:userId',
            mw.auth.authenticate(),
            validator.body(badgesPurchaseBadgeRequestSchema),
            controller.purchaseForUser
    );

    router.get('/api/badges/game/:gameId/player/:playerId',
            mw.auth.authenticate(),
            mw.game.loadGame({
                lean: true,
                state: true,
                settings: true,
                'galaxy.players': true
            }),
            controller.listForPlayer
    );

    return router;
}