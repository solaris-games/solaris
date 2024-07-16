import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import AdminController from '../controllers/admin';
import { MiddlewareContainer } from "../middleware";
import {
    adminAddWarningRequestSchema,
    adminSetGameFeaturedRequestSchema,
    adminSetGameTimeMachineRequestSchema,
    adminSetUserCreditsRequestSchema,
    adminSetUserRoleRequestSchema
} from "../requests/admin";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = AdminController(container);

    router.get('/api/admin/insights',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            controller.getInsights,
            mw.core.handleError)
    );

    router.get('/api/admin/user',
        ...singleRoute(
            mw.auth.authenticate({ communityManager: true }),
            controller.listUsers,
            mw.core.handleError)
    );

    router.get('/api/admin/passwordresets',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            controller.listPasswordResets,
            mw.core.handleError)
    );

    router.get('/api/admin/reports/:reportId/conversation',
        ...singleRoute(
            mw.auth.authenticate({ communityManager: true }),
            controller.conversationForReport,
            mw.core.handleError)
    );

    router.get('/api/admin/reports',
        ...singleRoute(
            mw.auth.authenticate({ communityManager: true }),
            controller.listReports,
            mw.core.handleError)
    );

    router.patch('/api/admin/reports/:reportId/action',
        ...singleRoute(
            mw.auth.authenticate({ communityManager: true }),
            controller.actionReport,
            mw.core.handleError)
    );

    router.post('/api/admin/user/:userId/warning',
        ...singleRoute(
            mw.auth.authenticate({ communityManager: true }),
            validator.body(adminAddWarningRequestSchema),
            controller.addWarning,
            mw.core.handleError)
    );

    router.patch('/api/admin/user/:userId/contributor',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            validator.body(adminSetUserRoleRequestSchema),
            controller.setRoleContributor,
            mw.core.handleError)
    );

    router.patch('/api/admin/user/:userId/developer',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            validator.body(adminSetUserRoleRequestSchema),
            controller.setRoleDeveloper,
            mw.core.handleError)
    );

    router.patch('/api/admin/user/:userId/communityManager',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            validator.body(adminSetUserRoleRequestSchema),
            controller.setRoleCommunityManager,
            mw.core.handleError)
    );

    router.patch('/api/admin/user/:userId/gameMaster',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            validator.body(adminSetUserRoleRequestSchema),
            controller.setRoleGameMaster,
            mw.core.handleError)
    );

    router.patch('/api/admin/user/:userId/credits',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            validator.body(adminSetUserCreditsRequestSchema),
            controller.setCredits,
            mw.core.handleError)
    );

    router.patch('/api/admin/user/:userId/ban',
        ...singleRoute(
            mw.auth.authenticate({ communityManager: true }),
            controller.banUser,
            mw.core.handleError)
    );

    router.patch('/api/admin/user/:userId/unban',
        ...singleRoute(
            mw.auth.authenticate({ communityManager: true }),
            controller.unbanUser,
            mw.core.handleError)
    );

    router.patch('/api/admin/user/:userId/resetAchievements',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            controller.resetAchievements,
            mw.core.handleError)
    );

    router.patch('/api/admin/user/:userId/promoteToEstablishedPlayer',
        ...singleRoute(
            mw.auth.authenticate({ communityManager: true }),
            controller.promoteToEstablishedPlayer,
            mw.core.handleError)
    );

    router.post('/api/admin/user/:userId/impersonate',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            controller.impersonate,
            mw.core.handleError)
    );

    router.get('/api/admin/game',
        ...singleRoute(
            mw.auth.authenticate({ subAdmin: true }),
            controller.listGames,
            mw.core.handleError)
    );

    router.patch('/api/admin/game/:gameId/featured',
        ...singleRoute(
            mw.auth.authenticate({ subAdmin: true }),
            validator.body(adminSetGameFeaturedRequestSchema),
            controller.setGameFeatured,
            mw.core.handleError)
    );

    router.patch('/api/admin/game/:gameId/timeMachine',
        ...singleRoute(
            mw.auth.authenticate({ subAdmin: true }),
            validator.body(adminSetGameTimeMachineRequestSchema),
            controller.setGameTimeMachine,
            mw.core.handleError)
    );

    router.patch('/api/admin/game/:gameId/finish',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                'galaxy.players': true
            }),
            mw.game.validateGameState({
                isUnlocked: true,
                isInProgress: true
            }),
            controller.forceEndGame,
            mw.core.handleError)
    );

    router.delete('/api/admin/game/:gameId/quitters',
        ...singleRoute(
            mw.auth.authenticate({ admin: true }),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                'galaxy.players': true
            }),
            controller.resetQuitters,
            mw.core.handleError)
    );

    return router;
}