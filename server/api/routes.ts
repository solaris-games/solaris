import { Router } from "express";
import { DependencyContainer } from "../types/DependencyContainer";
import Middleware from './middleware';
import AdminController from './controllers/admin';
import AuthController from './controllers/auth';
import BadgeController from './controllers/badges';

export default (router: Router, io, container: DependencyContainer) => {
    const mw = Middleware(container);
    const admin = AdminController(container, io);
    const auth = AuthController(container, io);
    const badges = BadgeController(container, io);
    
    /* ADMIN */
    router.get('/api/admin/user', mw.authenticateCommunityManager, admin.listUsers, mw.handleError);
    router.get('/api/admin/passwordresets', mw.authenticateAdmin, admin.listPasswordResets, mw.handleError);
    router.get('/api/admin/reports', mw.authenticateAdmin, admin.listReports, mw.handleError);
    router.patch('/api/admin/reports/:reportId/action', mw.authenticateAdmin, admin.actionReport, mw.handleError);
    router.patch('/api/admin/user/:userId/contributor', mw.authenticateAdmin, admin.setRoleContributor, mw.handleError);
    router.patch('/api/admin/user/:userId/developer', mw.authenticateAdmin, admin.setRoleDeveloper, mw.handleError);
    router.patch('/api/admin/user/:userId/communityManager', mw.authenticateAdmin, admin.setRoleCommunityManager, mw.handleError);
    router.patch('/api/admin/user/:userId/gameMaster', mw.authenticateAdmin, admin.setRoleGameMaster, mw.handleError);
    router.patch('/api/admin/user/:userId/credits', mw.authenticateAdmin, admin.setCredits, mw.handleError);
    router.patch('/api/admin/user/:userId/ban', mw.authenticateAdmin, admin.banUser, mw.handleError);
    router.patch('/api/admin/user/:userId/unban', mw.authenticateAdmin, admin.unbanUser, mw.handleError);
    router.patch('/api/admin/user/:userId/resetAchievements', mw.authenticateAdmin, admin.resetAchievements, mw.handleError);
    router.patch('/api/admin/user/:userId/promoteToEstablishedPlayer', mw.authenticateCommunityManager, admin.promoteToEstablishedPlayer, mw.handleError);
    router.post('/api/admin/user/:userId/impersonate', mw.authenticateAdmin, admin.impersonate, mw.handleError);
    router.get('/api/admin/game', mw.authenticateSubAdmin, admin.listGames, mw.handleError);
    router.patch('/api/admin/game/:gameId/featured', mw.authenticateSubAdmin, admin.setGameFeatured, mw.handleError);
    router.patch('/api/admin/game/:gameId/timeMachine', mw.authenticateAdmin, admin.setGameTimeMachine, mw.handleError);
    router.patch('/api/admin/game/:gameId/finish', mw.authenticateAdmin, mw.loadGamePlayersSettingsState, mw.validateGameLocked, mw.validateGameInProgress, admin.forceEndGame, mw.handleError);

    /* AUTH */
    router.post('/api/auth/login', auth.login, mw.handleError);
    router.post('/api/auth/logout', auth.logout, mw.handleError);
    router.post('/api/auth/verify', auth.verify);
    router.get('/api/auth/discord', auth.authoriseDiscord); // TODO: This should be in another api file. oauth.js?
    router.delete('/api/auth/discord', mw.authenticate, auth.unauthoriseDiscord, mw.handleError);

    /* BADGES */
    router.get('/api/badges', mw.authenticate, badges.listAll, mw.handleError);
    router.get('/api/badges/user/:userId', mw.authenticate, badges.listForUser, mw.handleError);
    router.post('/api/badges/game/:gameId/player/:playerId', mw.authenticate, mw.loadGamePlayersState, badges.purchaseForPlayer, mw.handleError);
    router.post('/api/badges/user/:userId', mw.authenticate, badges.purchaseForUser, mw.handleError);
    router.get('/api/badges/game/:gameId/player/:playerId', mw.authenticate, mw.loadGamePlayersState, badges.listForPlayer, mw.handleError);

    // TODO: The others.
    
    return router;
}