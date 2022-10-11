import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import AdminController from '../controllers/admin';
import { MiddlewareContainer } from "../middleware";
import { adminSetGameFeaturedRequestSchema, adminSetGameTimeMachineRequestSchema, adminSetUserCreditsRequestSchema, adminSetUserRoleRequestSchema } from "../requests/admin";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = AdminController(container);
    
    router.get('/api/admin/insights',
        mw.auth.authenticate({ admin: true }),
        controller.getInsights,
        mw.core.handleError);
    
    router.get('/api/admin/user',
        mw.auth.authenticate({ communityManager: true }),
        controller.listUsers,
        mw.core.handleError);

    router.get('/api/admin/passwordresets',
        mw.auth.authenticate({ admin: true }),
        controller.listPasswordResets,
        mw.core.handleError);

    router.get('/api/admin/reports',
        mw.auth.authenticate({ admin: true }),
        controller.listReports,
        mw.core.handleError);

    router.patch('/api/admin/reports/:reportId/action',
        mw.auth.authenticate({ admin: true }),
        controller.actionReport,
        mw.core.handleError);

    router.patch('/api/admin/user/:userId/contributor',
        mw.auth.authenticate({ admin: true }),
        validator.body(adminSetUserRoleRequestSchema),
        controller.setRoleContributor,
        mw.core.handleError);
        
    router.patch('/api/admin/user/:userId/developer',
        mw.auth.authenticate({ admin: true }),
        validator.body(adminSetUserRoleRequestSchema),
        controller.setRoleDeveloper,
        mw.core.handleError);

    router.patch('/api/admin/user/:userId/communityManager',
        mw.auth.authenticate({ admin: true }),
        validator.body(adminSetUserRoleRequestSchema),
        controller.setRoleCommunityManager,
        mw.core.handleError);

    router.patch('/api/admin/user/:userId/gameMaster',
        mw.auth.authenticate({ admin: true }),
        validator.body(adminSetUserRoleRequestSchema),
        controller.setRoleGameMaster,
        mw.core.handleError);

    router.patch('/api/admin/user/:userId/credits',
        mw.auth.authenticate({ admin: true }),
        validator.body(adminSetUserCreditsRequestSchema),
        controller.setCredits,
        mw.core.handleError);

    router.patch('/api/admin/user/:userId/ban',
        mw.auth.authenticate({ admin: true }),
        controller.banUser,
        mw.core.handleError);

    router.patch('/api/admin/user/:userId/unban',
        mw.auth.authenticate({ admin: true }),
        controller.unbanUser,
        mw.core.handleError);

    router.patch('/api/admin/user/:userId/resetAchievements',
        mw.auth.authenticate({ admin: true }),
        controller.resetAchievements,
        mw.core.handleError);

    router.patch('/api/admin/user/:userId/promoteToEstablishedPlayer',
        mw.auth.authenticate({ communityManager: true }),
        controller.promoteToEstablishedPlayer,
        mw.core.handleError);

    router.post('/api/admin/user/:userId/impersonate',
        mw.auth.authenticate({ admin: true }),
        controller.impersonate,
        mw.core.handleError);

    router.get('/api/admin/game',
        mw.auth.authenticate({ subAdmin: true }),
        controller.listGames,
        mw.core.handleError);

    router.patch('/api/admin/game/:gameId/featured',
        mw.auth.authenticate({ subAdmin: true }),
        validator.body(adminSetGameFeaturedRequestSchema),
        controller.setGameFeatured,
        mw.core.handleError);

    router.patch('/api/admin/game/:gameId/timeMachine',
        mw.auth.authenticate({ admin: true }),
        validator.body(adminSetGameTimeMachineRequestSchema),
        controller.setGameTimeMachine,
        mw.core.handleError);

    router.patch('/api/admin/game/:gameId/finish',
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
        mw.core.handleError);

    return router;
}