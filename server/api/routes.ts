import { Router } from "express";
import { DependencyContainer } from "../types/DependencyContainer";
import Middleware from './middleware';
import AdminController from './controllers/admin';
import AuthController from './controllers/auth';
import BadgeController from './controllers/badges';
import CarrierController from './controllers/carrier';
import ConversationController from './controllers/conversation';
import DiplomacyController from './controllers/diplomacy';
import EventController from './controllers/event';
import GameController from './controllers/game';
import GuildController from './controllers/guild';
import LedgerController from './controllers/ledger';
import ReportController from './controllers/report';
import ResearchController from './controllers/research';
import ShopController from './controllers/shop';
import SpecialistController from './controllers/specialist';
import StarController from './controllers/star';
import TradeController from './controllers/trade';
import UserController from './controllers/user';

export default (router: Router, io, container: DependencyContainer) => {
    const mw = Middleware(container);
    const admin = AdminController(container, io);
    const auth = AuthController(container, io);
    const badges = BadgeController(container, io);
    const carrier = CarrierController(container, io);
    const conversation = ConversationController(container, io);
    const diplomacy = DiplomacyController(container, io);
    const event = EventController(container, io);
    const game = GameController(container, io);
    const guild = GuildController(container, io);
    const ledger = LedgerController(container, io);
    const report = ReportController(container, io);
    const research = ResearchController(container, io);
    const shop = ShopController(container, io);
    const specialist = SpecialistController(container, io);
    const star = StarController(container, io);
    const trade = TradeController(container, io);
    const user = UserController(container, io);
    
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

    /* CARRIER */
    router.put('/api/game/:gameId/carrier/:carrierId/waypoints', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, carrier.saveWaypoints, mw.handleError);
    router.put('/api/game/:gameId/carrier/:carrierId/waypoints/loop', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, carrier.loopWaypoints, mw.handleError);
    router.put('/api/game/:gameId/carrier/:carrierId/transfer', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, carrier.transferShips, mw.handleError);
    router.put('/api/game/:gameId/carrier/:carrierId/gift', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, carrier.gift, mw.handleError);
    router.patch('/api/game/:gameId/carrier/:carrierId/rename', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, carrier.rename, mw.handleError);
    router.delete('/api/game/:gameId/carrier/:carrierId/scuttle', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, carrier.scuttle, mw.handleError);
    router.post('/api/game/:gameId/carrier/calculateCombat', mw.authenticate, carrier.calculateCombat, mw.handleError);

    /* CONVERSATIONS */
    router.get('/api/game/:gameId/conversations', mw.authenticate, mw.loadGameConversationsLean, mw.loadPlayer, conversation.list, mw.handleError);
    router.get('/api/game/:gameId/conversations/private/:withPlayerId', mw.authenticate, mw.loadGameConversationsLean, mw.loadPlayer, conversation.listPrivate, mw.handleError);
    router.get('/api/game/:gameId/conversations/unread', mw.authenticate, mw.loadGameConversationsLean, mw.loadPlayer, conversation.getUnreadCount, mw.handleError);
    router.get('/api/game/:gameId/conversations/:conversationId', mw.authenticate, mw.loadGameConversationsLean, mw.loadPlayer, conversation.detail, mw.handleError);
    router.post('/api/game/:gameId/conversations', mw.authenticate, mw.loadGameConversationsLean, mw.validateGameLocked, mw.loadPlayer, conversation.create, mw.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/send', mw.authenticate, mw.loadGameConversationsLean, mw.validateGameLocked, mw.loadPlayer, conversation.sendMessage, mw.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/markAsRead', mw.authenticate, mw.loadGameConversations, mw.validateGameLocked, mw.loadPlayer, conversation.markAsRead, mw.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/mute', mw.authenticate, mw.loadGameConversationsLean, mw.validateGameLocked, mw.loadPlayer, conversation.mute, mw.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/unmute', mw.authenticate, mw.loadGameConversationsLean, mw.validateGameLocked, mw.loadPlayer, conversation.unmute, mw.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/leave', mw.authenticate, mw.loadGameConversationsLean, mw.validateGameLocked, mw.loadPlayer, conversation.leave, mw.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/pin/:messageId', mw.authenticate, mw.loadGameConversationsLean, mw.validateGameLocked, mw.loadPlayer, conversation.pinMessage, mw.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/unpin/:messageId', mw.authenticate, mw.loadGameConversationsLean, mw.validateGameLocked, mw.loadPlayer, conversation.unpinMessage, mw.handleError);

    /* DIPLOMACY */
    router.get('/api/game/:gameId/diplomacy', mw.authenticate, mw.loadGameDiplomacyLean, mw.loadPlayer, diplomacy.list, mw.handleError);
    router.get('/api/game/:gameId/diplomacy/:toPlayerId', mw.authenticate, mw.loadGameDiplomacyLean, mw.loadPlayer, diplomacy.detail, mw.handleError);
    router.put('/api/game/:gameId/diplomacy/ally/:playerId', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, diplomacy.declareAlly, mw.handleError);
    router.put('/api/game/:gameId/diplomacy/enemy/:playerId', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, diplomacy.declareEnemy, mw.handleError);
    router.put('/api/game/:gameId/diplomacy/neutral/:playerId', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, diplomacy.declareNeutral, mw.handleError);

    /* EVENTS */
    router.get('/api/game/:gameId/events', mw.authenticate, mw.loadGameLean, mw.loadPlayer, event.list, mw.handleError);
    router.get('/api/game/:gameId/events/trade', mw.authenticate, mw.loadGameLean, mw.loadPlayer, event.listTrade, mw.handleError);
    router.patch('/api/game/:gameId/events/markAsRead', mw.authenticate,mw.loadGameLean, mw.validateGameLocked, mw.loadPlayer, event.markAllAsRead, mw.handleError);
    router.patch('/api/game/:gameId/events/:eventId/markAsRead', mw.authenticate,mw.loadGameLean, mw.validateGameLocked, mw.loadPlayer, event.markAsRead, mw.handleError);
    router.get('/api/game/:gameId/events/unread', mw.authenticate, mw.loadGameLean, mw.loadPlayer, event.getUnreadCount, mw.handleError);

    /* GAMES */
    router.get('/api/game/defaultSettings', mw.authenticate, game.getDefaultSettings, mw.handleError);
    router.get('/api/game/flux', mw.authenticate, game.getFlux, mw.handleError);
    router.post('/api/game/', mw.authenticate, game.create, mw.handleError);
    router.post('/api/game/tutorial', mw.authenticate, game.createTutorial, mw.handleError);
    router.get('/api/game/:gameId/info', mw.loadGameInfo, game.detailInfo, mw.handleError);
    router.get('/api/game/:gameId/state', mw.loadGameState, game.detailState, mw.handleError);
    router.get('/api/game/:gameId/galaxy', game.detailGalaxy, mw.handleError);
    router.get('/api/game/list/summary', game.listSummary, mw.handleError);
    router.get('/api/game/list/summary/user', game.listMySummary, mw.handleError);
    router.get('/api/game/list/official', game.listOfficial, mw.handleError);
    router.get('/api/game/list/custom', game.listCustom, mw.handleError);
    router.get('/api/game/list/inprogress', game.listInProgress, mw.handleError);
    router.get('/api/game/list/completed', mw.authenticate, game.listRecentlyCompleted, mw.handleError);
    router.get('/api/game/list/completed/user', mw.authenticate, game.listMyCompleted, mw.handleError);
    router.get('/api/game/list/active', mw.authenticate, game.listMyActiveGames, mw.handleError);
    router.get('/api/game/:gameId/intel', mw.authenticate, game.getIntel, mw.handleError);
    router.put('/api/game/:gameId/join', mw.authenticate, mw.loadGameAll, mw.validateGameLocked, game.join, mw.handleError);
    router.put('/api/game/:gameId/quit', mw.authenticate, mw.loadGameAll, mw.validateGameLocked, mw.loadPlayer, mw.validateUndefeatedPlayer, game.quit, mw.handleError);
    router.put('/api/game/:gameId/concedeDefeat', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameInProgress, mw.loadPlayer, mw.validateUndefeatedPlayer, game.concede, mw.handleError);
    router.put('/api/game/:gameId/ready', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.loadPlayer, mw.validateUndefeatedPlayer, game.ready, mw.handleError);
    router.put('/api/game/:gameId/readytocycle', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.loadPlayer, mw.validateUndefeatedPlayer, game.readyToCycle, mw.handleError);
    router.put('/api/game/:gameId/notready', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.loadPlayer, mw.validateUndefeatedPlayer, game.unready, mw.handleError);
    router.put('/api/game/:gameId/readyToQuit', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.loadPlayer, mw.validateUndefeatedPlayer, game.readyToQuit, mw.handleError);
    router.put('/api/game/:gameId/notReadyToQuit', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.loadPlayer, mw.validateUndefeatedPlayer, game.unreadyToQuit, mw.handleError);
    router.get('/api/game/:gameId/notes', mw.authenticate, mw.loadGame, mw.loadPlayer, game.getNotes, mw.handleError);
    router.put('/api/game/:gameId/notes', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.loadPlayer, game.saveNotes, mw.handleError);
    router.delete('/api/game/:gameId', mw.authenticate, mw.loadGame, mw.validateGameLocked, game.delete, mw.handleError);
    router.get('/api/game/:gameId/player/:playerId', mw.loadGamePlayers, game.getPlayerUser, mw.handleError);
    router.patch('/api/game/:gameId/player/touch', mw.authenticate, game.touch, mw.handleError);

    /* GUILDS */
    router.get('/api/guild/list', mw.authenticate, guild.list, mw.handleError);
    router.get('/api/guild', mw.authenticate, guild.detailMine, mw.handleError);
    router.get('/api/guild/leaderboard', mw.authenticate, guild.listLeaderboard, mw.handleError);
    router.get('/api/guild/invites', mw.authenticate, guild.listMyInvites, mw.handleError);
    router.get('/api/guild/applications', mw.authenticate, guild.listMyApplications, mw.handleError);
    router.get('/api/guild/:guildId', mw.authenticate, guild.detail, mw.handleError);
    router.post('/api/guild', mw.authenticate, guild.create, mw.handleError);
    router.patch('/api/guild', mw.authenticate, guild.rename, mw.handleError);
    router.delete('/api/guild/:guildId', mw.authenticate, guild.delete, mw.handleError);
    router.put('/api/guild/:guildId/invite', mw.authenticate, guild.invite, mw.handleError);
    router.patch('/api/guild/:guildId/uninvite/:userId', mw.authenticate, guild.uninvite, mw.handleError);
    router.patch('/api/guild/:guildId/accept/:userId', mw.authenticate, guild.acceptInviteForApplicant, mw.handleError);
    router.patch('/api/guild/:guildId/accept', mw.authenticate, guild.acceptInvite, mw.handleError);
    router.patch('/api/guild/:guildId/decline', mw.authenticate, guild.declineInvite, mw.handleError);
    router.put('/api/guild/:guildId/apply', mw.authenticate, guild.apply, mw.handleError);
    router.patch('/api/guild/:guildId/withdraw', mw.authenticate, guild.withdraw, mw.handleError);
    router.patch('/api/guild/:guildId/reject/:userId', mw.authenticate, guild.reject, mw.handleError);
    router.patch('/api/guild/:guildId/leave', mw.authenticate, guild.leave, mw.handleError);
    router.patch('/api/guild/:guildId/promote/:userId', mw.authenticate, guild.promote, mw.handleError);
    router.patch('/api/guild/:guildId/demote/:userId', mw.authenticate, guild.demote, mw.handleError);
    router.patch('/api/guild/:guildId/kick/:userId', mw.authenticate, guild.kick, mw.handleError);

    /* LEDGER */
    router.get('/api/game/:gameId/ledger', mw.authenticate, mw.loadGameLean, mw.loadPlayer, ledger.detail, mw.handleError);
    router.put('/api/game/:gameId/ledger/forgive/:playerId', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, ledger.forgive, mw.handleError);
    router.put('/api/game/:gameId/ledger/settle/:playerId', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, ledger.settle, mw.handleError);

    /* REPORT */
    router.post('/api/game/:gameId/report', mw.authenticate, mw.loadGamePlayers, mw.loadPlayer, report.create, mw.handleError);

    /* RESEARCH */
    router.put('/api/game/:gameId/research/now', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, research.updateNow, mw.handleError);
    router.put('/api/game/:gameId/research/next', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, research.updateNext, mw.handleError);

    /* SHOP */
    router.get('/api/shop/galacticcredits/purchase', mw.authenticate, shop.purchase, mw.handleError);
    router.get('/api/shop/galacticcredits/purchase/process', mw.authenticate, shop.process, mw.handleError);

    /* SPECIALIST */
    router.get('/api/game/specialists/bans', specialist.listBans, mw.handleError);
    router.get('/api/game/specialists/carrier', specialist.listCarrier, mw.handleError);
    router.get('/api/game/specialists/star', specialist.listStar, mw.handleError);
    router.get('/api/game/:gameId/specialists/carrier', mw.loadGameLean, specialist.listCarrierForGame, mw.handleError);
    router.get('/api/game/:gameId/specialists/star', mw.loadGameLean, specialist.listStarForGame, mw.handleError);
    router.put('/api/game/:gameId/carrier/:carrierId/hire/:specialistId', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, specialist.hireCarrier, mw.handleError);
    router.put('/api/game/:gameId/star/:starId/hire/:specialistId', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, specialist.hireStar, mw.handleError);

    /* STAR */
    router.put('/api/game/:gameId/star/upgrade/economy', mw.authenticate, mw.validateStarIdBody, mw.loadGameLean, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, star.upgradeEconomy, mw.handleError);
    router.put('/api/game/:gameId/star/upgrade/industry', mw.authenticate, mw.validateStarIdBody, mw.loadGameLean, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, star.upgradeIndustry, mw.handleError);
    router.put('/api/game/:gameId/star/upgrade/science', mw.authenticate, mw.validateStarIdBody, mw.loadGameLean, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, star.upgradeScience, mw.handleError);
    router.put('/api/game/:gameId/star/upgrade/bulk', mw.authenticate, mw.loadGameLean, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, star.upgradeBulk, mw.handleError);
    router.put('/api/game/:gameId/star/upgrade/bulkCheck', mw.authenticate, mw.loadGameLean, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, star.upgradeBulkCheck, mw.handleError);
    router.put('/api/game/:gameId/star/build/warpgate', mw.authenticate, mw.validateStarIdBody, mw.loadGameLean, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, star.buildWarpGate, mw.handleError);
    router.put('/api/game/:gameId/star/destroy/warpgate', mw.authenticate, mw.validateStarIdBody, mw.loadGameLean, mw.validateGameLocked, mw.validateGameStarted, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, star.destroyWarpGate, mw.handleError);
    router.put('/api/game/:gameId/star/build/carrier', mw.authenticate, mw.validateStarIdBody, mw.loadGameLean, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, star.buildCarrier, mw.handleError);
    router.put('/api/game/:gameId/star/transferall', mw.authenticate, mw.validateStarIdBody, mw.loadGameLean, mw.validateGameLocked, mw.validateGameNotFinished, mw.loadPlayer, mw.validateUndefeatedPlayer, star.garrisonAllShips, mw.handleError);
    router.put('/api/game/:gameId/star/abandon', mw.authenticate, mw.validateStarIdBody, mw.loadGame, mw.validateGameLocked, mw.validateGameInProgress, mw.loadPlayer, mw.validateUndefeatedPlayer, star.abandon, mw.handleError);
    router.put('/api/game/:gameId/star/toggleignorebulkupgrade', mw.authenticate, mw.validateStarIdBody, mw.loadGameLean, mw.validateGameLocked, mw.loadPlayer, mw.validateUndefeatedPlayer, star.toggleBulkIgnore, mw.handleError);
    router.put('/api/game/:gameId/star/toggleignorebulkupgradeall', mw.authenticate, mw.validateStarIdBody, mw.loadGameLean, mw.validateGameLocked, mw.loadPlayer, mw.validateUndefeatedPlayer, star.toggleBulkIgnoreAll, mw.handleError);

    /* TRADE */
    router.put('/api/game/:gameId/trade/credits', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameInProgress, mw.loadPlayer, mw.validateUndefeatedPlayer, trade.sendCredits, mw.handleError);
    router.put('/api/game/:gameId/trade/creditsSpecialists', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameInProgress, mw.loadPlayer, mw.validateUndefeatedPlayer, trade.sendCreditsSpecialists, mw.handleError);
    router.put('/api/game/:gameId/trade/renown', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameStarted, mw.loadPlayer, trade.sendRenown, mw.handleError);
    router.put('/api/game/:gameId/trade/tech', mw.authenticate, mw.loadGame, mw.validateGameLocked, mw.validateGameInProgress, mw.loadPlayer, mw.validateUndefeatedPlayer, trade.sendTechnology, mw.handleError);
    router.get('/api/game/:gameId/trade/tech/:toPlayerId', mw.authenticate, mw.loadGameLean, mw.validateGameInProgress, mw.loadPlayer, mw.validateUndefeatedPlayer, trade.listTradeableTechnologies, mw.handleError);
    router.get('/api/game/:gameId/trade/:toPlayerId/events', mw.authenticate, mw.loadGamePlayersState, mw.loadPlayer, trade.listTradeEvents, mw.handleError);

    /* USERS */
    router.get('/api/user/leaderboard', user.listLeaderboard, mw.handleError);
    router.post('/api/user/', user.create, mw.handleError);
    router.get('/api/user/settings', user.getSettings, mw.handleError);
    router.put('/api/user/settings', mw.authenticate, user.saveSettings, mw.handleError);
    router.get('/api/user/subscriptions', mw.authenticate, user.getSubscriptions, mw.handleError);
    router.put('/api/user/subscriptions', mw.authenticate, user.saveSubscriptions, mw.handleError);
    router.get('/api/user/credits', mw.authenticate, user.getCredits, mw.handleError);
    router.get('/api/user/', mw.authenticate, user.detailMe, mw.handleError);
    router.get('/api/user/avatars', mw.authenticate, user.listMyAvatars, mw.handleError);
    router.post('/api/user/avatars/:avatarId/purchase', mw.authenticate, user.purchaseAvatar, mw.handleError);
    router.get('/api/user/:id', user.detail, mw.handleError);
    router.get('/api/user/achievements/:id', user.getAchievements, mw.handleError);
    router.put('/api/user/changeEmailPreference', mw.authenticate, user.updateEmailPreference, mw.handleError);
    router.put('/api/user/changeUsername', mw.authenticate, user.updateUsername, mw.handleError);
    router.put('/api/user/changeEmailAddress', mw.authenticate, user.updateEmailAddress, mw.handleError);
    router.put('/api/user/changePassword', mw.authenticate, user.updatePassword, mw.handleError);
    router.post('/api/user/requestResetPassword', user.requestPasswordReset, mw.handleError);
    router.post('/api/user/resetPassword', user.resetPassword, mw.handleError);
    router.post('/api/user/requestUsername', user.requestUsername, mw.handleError);
    router.delete('/api/user/closeaccount', mw.authenticate, user.delete, mw.handleError);
    router.get('/api/user/donations/recent', user.listRecentDonations, mw.handleError);

    return router;
}