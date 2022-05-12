import { Router } from "express";
import { DependencyContainer } from "../types/DependencyContainer";
import Middleware from './middleware';
import AdminController from './controllers/admin';
import AuthController from './controllers/auth';

export default (router: Router, io, container: DependencyContainer) => {
    const middleware = Middleware(container);
    const adminController = AdminController(container, io);
    const authController = AuthController(container, io);
    
    /* ADMIN */
    router.get('/api/admin/user', middleware.authenticateCommunityManager, adminController.listUsers, middleware.handleError);
    router.get('/api/admin/passwordresets', middleware.authenticateAdmin, adminController.listPasswordResets, middleware.handleError);
    router.get('/api/admin/reports', middleware.authenticateAdmin, adminController.listReports, middleware.handleError);
    router.patch('/api/admin/reports/:reportId/action', middleware.authenticateAdmin, adminController.actionReport, middleware.handleError);
    router.patch('/api/admin/user/:userId/contributor', middleware.authenticateAdmin, adminController.setRoleContributor, middleware.handleError);
    router.patch('/api/admin/user/:userId/developer', middleware.authenticateAdmin, adminController.setRoleDeveloper, middleware.handleError);
    router.patch('/api/admin/user/:userId/communityManager', middleware.authenticateAdmin, adminController.setRoleCommunityManager, middleware.handleError);
    router.patch('/api/admin/user/:userId/gameMaster', middleware.authenticateAdmin, adminController.setRoleGameMaster, middleware.handleError);
    router.patch('/api/admin/user/:userId/credits', middleware.authenticateAdmin, adminController.setCredits, middleware.handleError);
    router.patch('/api/admin/user/:userId/ban', middleware.authenticateAdmin, adminController.banUser, middleware.handleError);
    router.patch('/api/admin/user/:userId/unban', middleware.authenticateAdmin, adminController.unbanUser, middleware.handleError);
    router.patch('/api/admin/user/:userId/resetAchievements', middleware.authenticateAdmin, adminController.resetAchievements, middleware.handleError);
    router.patch('/api/admin/user/:userId/promoteToEstablishedPlayer', middleware.authenticateCommunityManager, adminController.promoteToEstablishedPlayer, middleware.handleError);
    router.post('/api/admin/user/:userId/impersonate', middleware.authenticateAdmin, adminController.impersonate, middleware.handleError);
    router.get('/api/admin/game', middleware.authenticateSubAdmin, adminController.listGames, middleware.handleError);
    router.patch('/api/admin/game/:gameId/featured', middleware.authenticateSubAdmin, adminController.setGameFeatured, middleware.handleError);
    router.patch('/api/admin/game/:gameId/timeMachine', middleware.authenticateAdmin, adminController.setGameTimeMachine, middleware.handleError);
    router.patch('/api/admin/game/:gameId/finish', middleware.authenticateAdmin, middleware.loadGamePlayersSettingsState, middleware.validateGameLocked, middleware.validateGameInProgress, adminController.forceEndGame, middleware.handleError);

    /* AUTH */
    router.post('/api/auth/login', authController.login, middleware.handleError);
    router.post('/api/auth/logout', authController.logout, middleware.handleError);
    router.post('/api/auth/verify', authController.verify);
    router.get('/api/auth/discord', authController.authoriseDiscord); // TODO: This should be in another api file. oauth.js?
    router.delete('/api/auth/discord', middleware.authenticate, authController.unauthoriseDiscord, middleware.handleError);

    // TODO: The others.
    
    return router;
}