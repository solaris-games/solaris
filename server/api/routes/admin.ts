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
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = AdminController(container);

    router.get('/api/admin/insights',
            mw.auth.authenticate({ admin: true }),
            controller.getInsights
    );

    router.get('/api/admin/user',
            mw.auth.authenticate({ communityManager: true }),
            controller.listUsers
    );

    router.get('/api/admin/passwordresets',
            mw.auth.authenticate({ admin: true }),
            controller.listPasswordResets
    );

    router.get('/api/admin/reports/:reportId/conversation',
            mw.auth.authenticate({ communityManager: true }),
            controller.conversationForReport
    );

    router.get('/api/admin/reports',
            mw.auth.authenticate({ communityManager: true }),
            controller.listReports
    );

    router.patch('/api/admin/reports/:reportId/action',
        
            mw.auth.authenticate({ communityManager: true }),
            controller.actionReport
    );

    router.post('/api/admin/user/:userId/warning',
            mw.auth.authenticate({ communityManager: true }),
            validator.body(adminAddWarningRequestSchema),
            controller.addWarning
    );

    router.patch('/api/admin/user/:userId/contributor',
            mw.auth.authenticate({ admin: true }),
            validator.body(adminSetUserRoleRequestSchema),
            controller.setRoleContributor
    );

    router.patch('/api/admin/user/:userId/developer',
        
            mw.auth.authenticate({ admin: true }),
            validator.body(adminSetUserRoleRequestSchema),
            controller.setRoleDeveloper
    );

    router.patch('/api/admin/user/:userId/communityManager',
            mw.auth.authenticate({ admin: true }),
            validator.body(adminSetUserRoleRequestSchema),
            controller.setRoleCommunityManager
    );

    router.patch('/api/admin/user/:userId/gameMaster',
            mw.auth.authenticate({ admin: true }),
            validator.body(adminSetUserRoleRequestSchema),
            controller.setRoleGameMaster
    );

    router.patch('/api/admin/user/:userId/credits',
        
            mw.auth.authenticate({ admin: true }),
            validator.body(adminSetUserCreditsRequestSchema),
            controller.setCredits
    );

    router.patch('/api/admin/user/:userId/ban',
            mw.auth.authenticate({ communityManager: true }),
            controller.banUser
    );

    router.patch('/api/admin/user/:userId/unban',
            mw.auth.authenticate({ communityManager: true }),
            controller.unbanUser
    );

    router.patch('/api/admin/user/:userId/resetAchievements',
        
            mw.auth.authenticate({ admin: true }),
            controller.resetAchievements
    );

    router.patch('/api/admin/user/:userId/promoteToEstablishedPlayer',
            mw.auth.authenticate({ communityManager: true }),
            controller.promoteToEstablishedPlayer
    );

    router.post('/api/admin/user/:userId/impersonate',
            mw.auth.authenticate({ admin: true }),
            controller.impersonate
    );

    router.post('/api/admin/endImpersonate',
        mw.auth.authenticate({ adminImpersonatingAnotherUser: true }),
        controller.endImpersonate
    );

    router.get('/api/admin/game',
            mw.auth.authenticate({ subAdmin: true }),
            controller.listGames
    );

    router.patch('/api/admin/game/:gameId/featured',
            mw.auth.authenticate({ subAdmin: true }),
            validator.body(adminSetGameFeaturedRequestSchema),
            controller.setGameFeatured
    );

    router.patch('/api/admin/game/:gameId/timeMachine',
            mw.auth.authenticate({ subAdmin: true }),
            validator.body(adminSetGameTimeMachineRequestSchema),
            controller.setGameTimeMachine
    );

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
            controller.forceEndGame
    );

    router.delete('/api/admin/game/:gameId/quitters',
            mw.auth.authenticate({ admin: true }),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                'galaxy.players': true
            }),
            controller.resetQuitters
    );

    router.post("/api/admin/announcements/",
        mw.auth.authenticate({ admin: true }),
        controller.createAnnouncement);

    router.delete("/api/admin/announcements/:id",
        mw.auth.authenticate({ admin: true }),
        controller.deleteAnnouncement);

    router.get("/api/admin/announcements/",
        mw.auth.authenticate({ admin: true }),
        controller.getAllAnnouncements);

    return router;
}