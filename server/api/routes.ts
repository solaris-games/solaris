import { Router } from "express";
import { DependencyContainer } from "../types/DependencyContainer";
import Middleware from './middleware';
import AdminController from "./controllers/admin";

export default (router: Router, io, container: DependencyContainer) => {
    const middleware = Middleware(container);
    const controller = AdminController(container, io);
    
    /* ADMIN */
    router.get('/api/admin/user', middleware.authenticateCommunityManager, controller.listUsers, middleware.handleError);
    router.get('/api/admin/passwordresets', middleware.authenticateAdmin, controller.listPasswordResets, middleware.handleError);
    router.get('/api/admin/reports', middleware.authenticateAdmin, controller.listReports, middleware.handleError);
    router.patch('/api/admin/reports/:reportId/action', middleware.authenticateAdmin, controller.actionReport, middleware.handleError);
    router.patch('/api/admin/user/:userId/contributor', middleware.authenticateAdmin, controller.setRoleContributor, middleware.handleError);
    router.patch('/api/admin/user/:userId/developer', middleware.authenticateAdmin, controller.setRoleDeveloper, middleware.handleError);
    router.patch('/api/admin/user/:userId/communityManager', middleware.authenticateAdmin, controller.setRoleCommunityManager, middleware.handleError);
    router.patch('/api/admin/user/:userId/gameMaster', middleware.authenticateAdmin, controller.setRoleGameMaster, middleware.handleError);
    router.patch('/api/admin/user/:userId/credits', middleware.authenticateAdmin, controller.setCredits, middleware.handleError);
    router.patch('/api/admin/user/:userId/ban', middleware.authenticateAdmin, controller.banUser, middleware.handleError);
    router.patch('/api/admin/user/:userId/unban', middleware.authenticateAdmin, controller.unbanUser, middleware.handleError);
    router.patch('/api/admin/user/:userId/resetAchievements', middleware.authenticateAdmin, controller.resetAchievements, middleware.handleError);
    router.patch('/api/admin/user/:userId/promoteToEstablishedPlayer', middleware.authenticateCommunityManager, controller.promoteToEstablishedPlayer, middleware.handleError);
    router.post('/api/admin/user/:userId/impersonate', middleware.authenticateAdmin, controller.impersonate, middleware.handleError);
    router.get('/api/admin/game', middleware.authenticateSubAdmin, controller.listGames, middleware.handleError);
    router.patch('/api/admin/game/:gameId/featured', middleware.authenticateSubAdmin, controller.setGameFeatured, middleware.handleError);
    router.patch('/api/admin/game/:gameId/timeMachine', middleware.authenticateAdmin, controller.setGameTimeMachine, middleware.handleError);
    router.patch('/api/admin/game/:gameId/finish', middleware.authenticateAdmin, middleware.loadGamePlayersSettingsState, middleware.validateGameLocked, middleware.validateGameInProgress, controller.forceEndGame, middleware.handleError);

    // TODO: The others.
    
    return router;
}