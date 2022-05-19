import { Router } from "express";
import { DependencyContainer } from "../../types/DependencyContainer";
import AdminController from '../controllers/admin';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);

    const controller = AdminController(container, io);
    
    router.get('/api/admin/user',
        mwAuth.authenticate({ communityManager: true }),
        controller.listUsers,
        mwCore.handleError);

    router.get('/api/admin/passwordresets',
        mwAuth.authenticate({ admin: true }),
        controller.listPasswordResets,
        mwCore.handleError);

    router.get('/api/admin/reports',
        mwAuth.authenticate({ admin: true }),
        controller.listReports,
        mwCore.handleError);

    router.patch('/api/admin/reports/:reportId/action',
        mwAuth.authenticate({ admin: true }),
        controller.actionReport,
        mwCore.handleError);

    router.patch('/api/admin/user/:userId/contributor',
        mwAuth.authenticate({ admin: true }),
        controller.setRoleContributor,
        mwCore.handleError);
        
    router.patch('/api/admin/user/:userId/developer',
        mwAuth.authenticate({ admin: true }),
        controller.setRoleDeveloper,
        mwCore.handleError);

    router.patch('/api/admin/user/:userId/communityManager',
        mwAuth.authenticate({ admin: true }),
        controller.setRoleCommunityManager,
        mwCore.handleError);

    router.patch('/api/admin/user/:userId/gameMaster',
        mwAuth.authenticate({ admin: true }),
        controller.setRoleGameMaster,
        mwCore.handleError);

    router.patch('/api/admin/user/:userId/credits',
        mwAuth.authenticate({ admin: true }),
        controller.setCredits,
        mwCore.handleError);

    router.patch('/api/admin/user/:userId/ban',
        mwAuth.authenticate({ admin: true }),
        controller.banUser,
        mwCore.handleError);

    router.patch('/api/admin/user/:userId/unban',
        mwAuth.authenticate({ admin: true }),
        controller.unbanUser,
        mwCore.handleError);

    router.patch('/api/admin/user/:userId/resetAchievements',
        mwAuth.authenticate({ admin: true }),
        controller.resetAchievements,
        mwCore.handleError);

    router.patch('/api/admin/user/:userId/promoteToEstablishedPlayer',
        mwAuth.authenticate({ communityManager: true }),
        controller.promoteToEstablishedPlayer,
        mwCore.handleError);

    router.post('/api/admin/user/:userId/impersonate',
        mwAuth.authenticate({ admin: true }),
        controller.impersonate,
        mwCore.handleError);

    router.get('/api/admin/game',
        mwAuth.authenticate({ subAdmin: true }),
        controller.listGames,
        mwCore.handleError);

    router.patch('/api/admin/game/:gameId/featured',
        mwAuth.authenticate({ subAdmin: true }),
        controller.setGameFeatured,
        mwCore.handleError);

    router.patch('/api/admin/game/:gameId/timeMachine',
        mwAuth.authenticate({ admin: true }),
        controller.setGameTimeMachine,
        mwCore.handleError);

    router.patch('/api/admin/game/:gameId/finish',
        mwAuth.authenticate({ admin: true }),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isInProgress: true
        }),
        controller.forceEndGame,
        mwCore.handleError);

    return router;
}