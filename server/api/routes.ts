import { Router } from "express";
import { DependencyContainer } from "../types/DependencyContainer";
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

import AuthMiddleware from './middleware/auth';
import CoreMiddleware from './middleware/core';
import GameMiddleware from './middleware/game';
import PlayerMiddleware from './middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

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
    router.get('/api/admin/user',
        mwAuth.authenticate({ communityManager: true }),
        admin.listUsers,
        mwCore.handleError);
    router.get('/api/admin/passwordresets',
        mwAuth.authenticate({ admin: true }),
        admin.listPasswordResets,
        mwCore.handleError);
    router.get('/api/admin/reports',
        mwAuth.authenticate({ admin: true }),
        admin.listReports,
        mwCore.handleError);
    router.patch('/api/admin/reports/:reportId/action',
        mwAuth.authenticate({ admin: true }),
        admin.actionReport,
        mwCore.handleError);
    router.patch('/api/admin/user/:userId/contributor',
        mwAuth.authenticate({ admin: true }),
        admin.setRoleContributor,
        mwCore.handleError);
    router.patch('/api/admin/user/:userId/developer',
        mwAuth.authenticate({ admin: true }),
        admin.setRoleDeveloper,
        mwCore.handleError);
    router.patch('/api/admin/user/:userId/communityManager',
        mwAuth.authenticate({ admin: true }),
        admin.setRoleCommunityManager,
        mwCore.handleError);
    router.patch('/api/admin/user/:userId/gameMaster',
        mwAuth.authenticate({ admin: true }),
        admin.setRoleGameMaster,
        mwCore.handleError);
    router.patch('/api/admin/user/:userId/credits',
        mwAuth.authenticate({ admin: true }),
        admin.setCredits,
        mwCore.handleError);
    router.patch('/api/admin/user/:userId/ban',
        mwAuth.authenticate({ admin: true }),
        admin.banUser,
        mwCore.handleError);
    router.patch('/api/admin/user/:userId/unban',
        mwAuth.authenticate({ admin: true }),
        admin.unbanUser,
        mwCore.handleError);
    router.patch('/api/admin/user/:userId/resetAchievements',
        mwAuth.authenticate({ admin: true }),
        admin.resetAchievements,
        mwCore.handleError);
    router.patch('/api/admin/user/:userId/promoteToEstablishedPlayer',
        mwAuth.authenticate({ communityManager: true }),
        admin.promoteToEstablishedPlayer,
        mwCore.handleError);
    router.post('/api/admin/user/:userId/impersonate',
        mwAuth.authenticate({ admin: true }),
        admin.impersonate,
        mwCore.handleError);
    router.get('/api/admin/game',
        mwAuth.authenticate({ subAdmin: true }),
        admin.listGames,
        mwCore.handleError);
    router.patch('/api/admin/game/:gameId/featured',
        mwAuth.authenticate({ subAdmin: true }),
        admin.setGameFeatured,
        mwCore.handleError);
    router.patch('/api/admin/game/:gameId/timeMachine',
        mwAuth.authenticate({ admin: true }),
        admin.setGameTimeMachine,
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
        admin.forceEndGame,
        mwCore.handleError);

    /* AUTH */
    router.post('/api/auth/login',
        auth.login,
        mwCore.handleError);
    router.post('/api/auth/logout',
        auth.logout,
        mwCore.handleError);
    router.post('/api/auth/verify',
        auth.verify);
    router.get('/api/auth/discord',
        auth.authoriseDiscord); // TODO: This should be in another api file. oauth.js?
    router.delete('/api/auth/discord',
        mwAuth.authenticate(),
        auth.unauthoriseDiscord,
        mwCore.handleError);

    /* BADGES */
    router.get('/api/badges',
        mwAuth.authenticate(),
        badges.listAll,
        mwCore.handleError);
    router.get('/api/badges/user/:userId',
        mwAuth.authenticate(),
        badges.listForUser,
        mwCore.handleError);
    router.post('/api/badges/game/:gameId/player/:playerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            'galaxy.players': true
        }),
        badges.purchaseForPlayer,
        mwCore.handleError);
    router.post('/api/badges/user/:userId',
        mwAuth.authenticate(),
        badges.purchaseForUser,
        mwCore.handleError);
    router.get('/api/badges/game/:gameId/player/:playerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            'galaxy.players': true
        }),
        badges.listForPlayer,
        mwCore.handleError);

    /* CARRIER */
    router.put('/api/game/:gameId/carrier/:carrierId/waypoints',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        carrier.saveWaypoints,
        mwCore.handleError);
    router.put('/api/game/:gameId/carrier/:carrierId/waypoints/loop',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        carrier.loopWaypoints,
        mwCore.handleError);
    router.put('/api/game/:gameId/carrier/:carrierId/transfer',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        carrier.transferShips,
        mwCore.handleError);
    router.put('/api/game/:gameId/carrier/:carrierId/gift',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        carrier.gift,
        mwCore.handleError);
    router.patch('/api/game/:gameId/carrier/:carrierId/rename',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        carrier.rename,
        mwCore.handleError);
    router.delete('/api/game/:gameId/carrier/:carrierId/scuttle',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        carrier.scuttle,
        mwCore.handleError);
    router.post('/api/game/:gameId/carrier/calculateCombat',
        mwAuth.authenticate(),
        carrier.calculateCombat,
        mwCore.handleError);

    /* CONVERSATIONS */
    router.get('/api/game/:gameId/conversations',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        conversation.list,
        mwCore.handleError);
    router.get('/api/game/:gameId/conversations/private/:withPlayerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        conversation.listPrivate,
        mwCore.handleError);
    router.get('/api/game/:gameId/conversations/unread',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        conversation.getUnreadCount,
        mwCore.handleError);
    router.get('/api/game/:gameId/conversations/:conversationId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        conversation.detail,
        mwCore.handleError);
    router.post('/api/game/:gameId/conversations',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        conversation.create,
        mwCore.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/send',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        conversation.sendMessage,
        mwCore.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/markAsRead',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        conversation.markAsRead,
        mwCore.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/mute',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        conversation.mute,
        mwCore.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/unmute',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        conversation.unmute,
        mwCore.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/leave',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        conversation.leave,
        mwCore.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/pin/:messageId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        conversation.pinMessage,
        mwCore.handleError);
    router.patch('/api/game/:gameId/conversations/:conversationId/unpin/:messageId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            conversations: true,
            'galaxy.players': true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        conversation.unpinMessage,
        mwCore.handleError);

    /* DIPLOMACY */
    router.get('/api/game/:gameId/diplomacy',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            'galaxy.players': true
            // 'galaxy.players._id': 1,
            // 'galaxy.players.userId': 1,
            // 'galaxy.players.diplomacy': 1
        }),
        mwPlayer.loadPlayer,
        diplomacy.list,
        mwCore.handleError);
    router.get('/api/game/:gameId/diplomacy/:toPlayerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            'galaxy.players': true
            // 'galaxy.players._id': 1,
            // 'galaxy.players.userId': 1,
            // 'galaxy.players.diplomacy': 1
        }),
        mwPlayer.loadPlayer,
        diplomacy.detail,
        mwCore.handleError);
    router.put('/api/game/:gameId/diplomacy/ally/:playerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        diplomacy.declareAlly,
        mwCore.handleError);
    router.put('/api/game/:gameId/diplomacy/enemy/:playerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        diplomacy.declareEnemy,
        mwCore.handleError);
    router.put('/api/game/:gameId/diplomacy/neutral/:playerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        diplomacy.declareNeutral,
        mwCore.handleError);

    /* EVENTS */
    router.get('/api/game/:gameId/events',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwPlayer.loadPlayer,
        event.list,
        mwCore.handleError);
    router.get('/api/game/:gameId/events/trade',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwPlayer.loadPlayer,
        event.listTrade,
        mwCore.handleError);
    router.patch('/api/game/:gameId/events/markAsRead',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        event.markAllAsRead,
        mwCore.handleError);
    router.patch('/api/game/:gameId/events/:eventId/markAsRead',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        event.markAsRead,
        mwCore.handleError);
    router.get('/api/game/:gameId/events/unread',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwPlayer.loadPlayer,
        event.getUnreadCount,
        mwCore.handleError);

    /* GAMES */
    router.get('/api/game/defaultSettings',
        mwAuth.authenticate(),
        game.getDefaultSettings,
        mwCore.handleError);
    router.get('/api/game/flux',
        mwAuth.authenticate(),
        game.getFlux,
        mwCore.handleError);
    router.post('/api/game/',
        mwAuth.authenticate(),
        game.create,
        mwCore.handleError);
    router.post('/api/game/tutorial',
        mwAuth.authenticate(),
        game.createTutorial,
        mwCore.handleError);
    router.get('/api/game/:gameId/info',
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            constants: true
        }),
        // TODO: This needs to utilise a response middleware function to map the game object to a response object.
        (req, res, next) => {
            try {
                if (req.game.settings.general.createdByUserId) {
                    req.game.settings.general.isGameAdmin = req.game.settings.general.createdByUserId.toString() === req.session.userId.toString();
                } else {
                    req.game.settings.general.isGameAdmin = false;
                }

                delete req.game.settings.general.password;

                next();
            } catch (err) {
                next(err);
            }
        },
        game.detailInfo,
        mwCore.handleError);
    router.get('/api/game/:gameId/state',
        mwGame.loadGame({
            lean: true,
            state: true
        }),
        game.detailState,
        mwCore.handleError);
    router.get('/api/game/:gameId/galaxy',
        game.detailGalaxy,
        mwCore.handleError);
    router.get('/api/game/list/summary',
        game.listSummary,
        mwCore.handleError);
    router.get('/api/game/list/summary/user',
        game.listMySummary,
        mwCore.handleError);
    router.get('/api/game/list/official',
        game.listOfficial,
        mwCore.handleError);
    router.get('/api/game/list/custom',
        game.listCustom,
        mwCore.handleError);
    router.get('/api/game/list/inprogress',
        game.listInProgress,
        mwCore.handleError);
    router.get('/api/game/list/completed',
        mwAuth.authenticate(),
        game.listRecentlyCompleted,
        mwCore.handleError);
    router.get('/api/game/list/completed/user',
        mwAuth.authenticate(),
        game.listMyCompleted,
        mwCore.handleError);
    router.get('/api/game/list/active',
        mwAuth.authenticate(),
        game.listMyActiveGames,
        mwCore.handleError);
    router.get('/api/game/:gameId/intel',
        mwAuth.authenticate(),
        game.getIntel,
        mwCore.handleError);
    router.put('/api/game/:gameId/join',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            galaxy: true,
            conversations: true,
            state: true,
            constants: true,
            quitters: true,
            afkers: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        game.join,
        mwCore.handleError);
    router.put('/api/game/:gameId/quit',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            galaxy: true,
            conversations: true,
            state: true,
            constants: true,
            quitters: true,
            afkers: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        game.quit,
        mwCore.handleError);
    router.put('/api/game/:gameId/concedeDefeat',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        game.concede,
        mwCore.handleError);
    router.put('/api/game/:gameId/ready',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        game.ready,
        mwCore.handleError);
    router.put('/api/game/:gameId/readytocycle',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        game.readyToCycle,
        mwCore.handleError);
    router.put('/api/game/:gameId/notready',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        game.unready,
        mwCore.handleError);
    router.put('/api/game/:gameId/readyToQuit',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        game.readyToQuit,
        mwCore.handleError);
    router.put('/api/game/:gameId/notReadyToQuit',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        game.unreadyToQuit,
        mwCore.handleError);
    router.get('/api/game/:gameId/notes',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwPlayer.loadPlayer,
        game.getNotes,
        mwCore.handleError);
    router.put('/api/game/:gameId/notes',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        game.saveNotes,
        mwCore.handleError);
    router.delete('/api/game/:gameId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        game.delete,
        mwCore.handleError);
    router.get('/api/game/:gameId/player/:playerId',
        mwGame.loadGame({
            lean: true,
            settings: true,
            'galaxy.players': true
        }),
        game.getPlayerUser,
        mwCore.handleError);
    router.patch('/api/game/:gameId/player/touch',
        mwAuth.authenticate(),
        game.touch,
        mwCore.handleError);

    /* GUILDS */
    router.get('/api/guild/list',
        mwAuth.authenticate(),
        guild.list,
        mwCore.handleError);
    router.get('/api/guild',
        mwAuth.authenticate(),
        guild.detailMine,
        mwCore.handleError);
    router.get('/api/guild/leaderboard',
        mwAuth.authenticate(),
        guild.listLeaderboard,
        mwCore.handleError);
    router.get('/api/guild/invites',
        mwAuth.authenticate(),
        guild.listMyInvites,
        mwCore.handleError);
    router.get('/api/guild/applications',
        mwAuth.authenticate(),
        guild.listMyApplications,
        mwCore.handleError);
    router.get('/api/guild/:guildId',
        mwAuth.authenticate(),
        guild.detail,
        mwCore.handleError);
    router.post('/api/guild',
        mwAuth.authenticate(),
        guild.create,
        mwCore.handleError);
    router.patch('/api/guild',
        mwAuth.authenticate(),
        guild.rename,
        mwCore.handleError);
    router.delete('/api/guild/:guildId',
        mwAuth.authenticate(),
        guild.delete,
        mwCore.handleError);
    router.put('/api/guild/:guildId/invite',
        mwAuth.authenticate(),
        guild.invite,
        mwCore.handleError);
    router.patch('/api/guild/:guildId/uninvite/:userId',
        mwAuth.authenticate(),
        guild.uninvite,
        mwCore.handleError);
    router.patch('/api/guild/:guildId/accept/:userId',
        mwAuth.authenticate(),
        guild.acceptInviteForApplicant,
        mwCore.handleError);
    router.patch('/api/guild/:guildId/accept',
        mwAuth.authenticate(),
        guild.acceptInvite,
        mwCore.handleError);
    router.patch('/api/guild/:guildId/decline',
        mwAuth.authenticate(),
        guild.declineInvite,
        mwCore.handleError);
    router.put('/api/guild/:guildId/apply',
        mwAuth.authenticate(),
        guild.apply,
        mwCore.handleError);
    router.patch('/api/guild/:guildId/withdraw',
        mwAuth.authenticate(),
        guild.withdraw,
        mwCore.handleError);
    router.patch('/api/guild/:guildId/reject/:userId',
        mwAuth.authenticate(),
        guild.reject,
        mwCore.handleError);
    router.patch('/api/guild/:guildId/leave',
        mwAuth.authenticate(),
        guild.leave,
        mwCore.handleError);
    router.patch('/api/guild/:guildId/promote/:userId',
        mwAuth.authenticate(),
        guild.promote,
        mwCore.handleError);
    router.patch('/api/guild/:guildId/demote/:userId',
        mwAuth.authenticate(),
        guild.demote,
        mwCore.handleError);
    router.patch('/api/guild/:guildId/kick/:userId',
        mwAuth.authenticate(),
        guild.kick,
        mwCore.handleError);

    /* LEDGER */
    router.get('/api/game/:gameId/ledger',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwPlayer.loadPlayer,
        ledger.detail,
        mwCore.handleError);
    router.put('/api/game/:gameId/ledger/forgive/:playerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        ledger.forgive,
        mwCore.handleError);
    router.put('/api/game/:gameId/ledger/settle/:playerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        ledger.settle,
        mwCore.handleError);

    /* REPORT */
    router.post('/api/game/:gameId/report',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        report.create,
        mwCore.handleError);

    /* RESEARCH */
    router.put('/api/game/:gameId/research/now',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), research.updateNow,
        mwCore.handleError);
    router.put('/api/game/:gameId/research/next',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), research.updateNext,
        mwCore.handleError);

    /* SHOP */
    router.get('/api/shop/galacticcredits/purchase',
        mwAuth.authenticate(),
        shop.purchase,
        mwCore.handleError);
    router.get('/api/shop/galacticcredits/purchase/process',
        mwAuth.authenticate(),
        shop.process,
        mwCore.handleError);

    /* SPECIALIST */
    router.get('/api/game/specialists/bans',
        specialist.listBans,
        mwCore.handleError);
    router.get('/api/game/specialists/carrier',
        specialist.listCarrier,
        mwCore.handleError);
    router.get('/api/game/specialists/star',
        specialist.listStar,
        mwCore.handleError);
    router.get('/api/game/:gameId/specialists/carrier',
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        specialist.listCarrierForGame,
        mwCore.handleError);
    router.get('/api/game/:gameId/specialists/star',
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        specialist.listStarForGame,
        mwCore.handleError);
    router.put('/api/game/:gameId/carrier/:carrierId/hire/:specialistId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), specialist.hireCarrier,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/:starId/hire/:specialistId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), specialist.hireStar,
        mwCore.handleError);

    /* STAR */
    router.put('/api/game/:gameId/star/upgrade/economy',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.upgradeEconomy,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/upgrade/industry',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.upgradeIndustry,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/upgrade/science',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.upgradeScience,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/upgrade/bulk',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.upgradeBulk,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/upgrade/bulkCheck',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.upgradeBulkCheck,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/build/warpgate',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.buildWarpGate,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/destroy/warpgate',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true,
            isStarted: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.destroyWarpGate,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/build/carrier',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.buildCarrier,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/transferall',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isNotFinished: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.garrisonAllShips,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/abandon',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.abandon,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/toggleignorebulkupgrade',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.toggleBulkIgnore,
        mwCore.handleError);
    router.put('/api/game/:gameId/star/toggleignorebulkupgradeall',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }), star.toggleBulkIgnoreAll,
        mwCore.handleError);

    /* TRADE */
    router.put('/api/game/:gameId/trade/credits',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        trade.sendCredits,
        mwCore.handleError);
    router.put('/api/game/:gameId/trade/creditsSpecialists',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        trade.sendCreditsSpecialists,
        mwCore.handleError);
    router.put('/api/game/:gameId/trade/renown',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isStarted: true
        }),
        mwPlayer.loadPlayer,
        trade.sendRenown,
        mwCore.handleError);
    router.put('/api/game/:gameId/trade/tech',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        trade.sendTechnology,
        mwCore.handleError);
    router.get('/api/game/:gameId/trade/tech/:toPlayerId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        trade.listTradeableTechnologies,
        mwCore.handleError);
    router.get('/api/game/:gameId/trade/:toPlayerId/events',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            state: true,
            'galaxy.players': true
        }),
        mwPlayer.loadPlayer,
        trade.listTradeEvents,
        mwCore.handleError);

    /* USERS */
    router.get('/api/user/leaderboard',
        user.listLeaderboard,
        mwCore.handleError);
    router.post('/api/user/',
        user.create,
        mwCore.handleError);
    router.get('/api/user/settings',
        user.getSettings,
        mwCore.handleError);
    router.put('/api/user/settings',
        mwAuth.authenticate(),
        user.saveSettings,
        mwCore.handleError);
    router.get('/api/user/subscriptions',
        mwAuth.authenticate(),
        user.getSubscriptions,
        mwCore.handleError);
    router.put('/api/user/subscriptions',
        mwAuth.authenticate(),
        user.saveSubscriptions,
        mwCore.handleError);
    router.get('/api/user/credits',
        mwAuth.authenticate(),
        user.getCredits,
        mwCore.handleError);
    router.get('/api/user/',
        mwAuth.authenticate(),
        user.detailMe,
        mwCore.handleError);
    router.get('/api/user/avatars',
        mwAuth.authenticate(),
        user.listMyAvatars,
        mwCore.handleError);
    router.post('/api/user/avatars/:avatarId/purchase',
        mwAuth.authenticate(),
        user.purchaseAvatar,
        mwCore.handleError);
    router.get('/api/user/:id',
        user.detail,
        mwCore.handleError);
    router.get('/api/user/achievements/:id',
        user.getAchievements,
        mwCore.handleError);
    router.put('/api/user/changeEmailPreference',
        mwAuth.authenticate(),
        user.updateEmailPreference,
        mwCore.handleError);
    router.put('/api/user/changeUsername',
        mwAuth.authenticate(),
        user.updateUsername,
        mwCore.handleError);
    router.put('/api/user/changeEmailAddress',
        mwAuth.authenticate(),
        user.updateEmailAddress,
        mwCore.handleError);
    router.put('/api/user/changePassword',
        mwAuth.authenticate(),
        user.updatePassword,
        mwCore.handleError);
    router.post('/api/user/requestResetPassword',
        user.requestPasswordReset,
        mwCore.handleError);
    router.post('/api/user/resetPassword',
        user.resetPassword,
        mwCore.handleError);
    router.post('/api/user/requestUsername',
        user.requestUsername,
        mwCore.handleError);
    router.delete('/api/user/closeaccount',
        mwAuth.authenticate(),
        user.delete,
        mwCore.handleError);
    router.get('/api/user/donations/recent',
        user.listRecentDonations,
        mwCore.handleError);

    return router;
}