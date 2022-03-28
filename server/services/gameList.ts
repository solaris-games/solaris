import { DBObjectId } from "../types/DBObjectId";
import DatabaseRepository from "../models/DatabaseRepository";
import { Game, GameUserNotification } from "../types/Game";
import ConversationService from "./conversation";
import EventService from "./event";
import GameService from "./game";
import GameTypeService from "./gameType";

const moment = require('moment');

export default class GameListService {
    gameRepo: DatabaseRepository<Game>;
    gameService: GameService;
    conversationService: ConversationService;
    eventService: EventService;
    gameTypeService: GameTypeService;
    
    constructor(
        gameRepo: DatabaseRepository<Game>,
        gameService: GameService,
        conversationService: ConversationService,
        eventService: EventService,
        gameTypeService: GameTypeService
    ) {
        this.gameRepo = gameRepo;
        this.gameService = gameService;
        this.conversationService = conversationService;
        this.eventService = eventService;
        this.gameTypeService = gameTypeService;
    }

    async listOfficialGames() {
        return await this.gameRepo.find({
            'settings.general.type': { $nin: ['custom', 'tutorial'] },
            'state.startDate': { $eq: null }
        }, {
            'settings.general.type': 1,
            'settings.general.featured': 1,
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        });
    }

    async listUserGames(select?) {
        select = select || {
            'settings.general.type': 1,
            'settings.general.featured': 1,
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        };

        return await this.gameRepo.find({
            'settings.general.type': { $eq: 'custom' },
            'state.startDate': { $eq: null }
        }, select);
    }

    async listActiveGames(userId: DBObjectId) {
        const games = await this.gameRepo.find({
            'state.endDate': { $eq: null }, // Game is in progress
            $or: [
                // User is playing or has been afk'd
                { 'galaxy.players': { $elemMatch: { userId } } },
                { 'afkers': { $in: [userId] } }
            ]
        }, {
            'settings.general.name': 1,
            'settings.general.type': 1,
            'settings.general.playerLimit': 1,
            'settings.gametime.speed': 1,
            'settings.gametime.gameType': 1,
            'settings.gameTime': 1,
            'settings.galaxy.productionTicks': 1,
            'galaxy.players._id': 1,
            'galaxy.players.userId': 1,
            'galaxy.players.ready': 1,
            'galaxy.players.defeated': 1,
            'galaxy.players.afk': 1,
            'conversations.participants': 1,
            'conversations.messages.readBy': 1,
            state: 1
        }, {
            'state.startDate': -1 // Sort start date descending (most recent started games appear first)
        });

        return await Promise.all(games.map(async game => {
            game.userNotifications = await this.getUserPlayerNotifications(game, userId, true, true, true);

            delete (game as any).conversations;
            delete (game as any).galaxy;

            return game;
        }));
    }

    async listRecentlyCompletedGames(select: any | null = null, limit: number = 20) {
        select = select || {
            'settings.general.type': 1,
            'settings.general.featured': 1,
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        };

        return await this.gameRepo.find({
            'state.endDate': { $ne: null }, // Game is finished
            'settings.general.type': { $ne: 'tutorial'}
        },
        select,
        { 'state.endDate': -1 },
        limit);
    }

    async listUserCompletedGames(userId: DBObjectId) {
        const games = await this.gameRepo.find({
            'state.endDate': { $ne: null }, // Game is finished
            'settings.general.type': { $ne: 'tutorial'},
            $or: [
                // User was active in the game or has been afk'd
                { 'galaxy.players': { $elemMatch: { userId } } },
                { 'afkers': { $in: [userId] } }
            ]
        }, {
            'settings.general.name': 1,
            'settings.general.type': 1,
            'galaxy.players._id': 1,
            'galaxy.players.userId': 1,
            'galaxy.players.defeated': 1,
            'galaxy.players.afk': 1,
            'conversations.participants': 1,
            'conversations.messages.readBy': 1,
            state: 1
        }, {
            'state.endDate': -1 // Sort end date descending (most recent ended games appear first)
        });

        return await Promise.all(games.map(async game => {
            game.userNotifications = await this.getUserPlayerNotifications(game, userId, false, false, true);

            delete (game as any).conversations;
            delete (game as any).galaxy;

            return game;
        }));
    }

    async getUserPlayerNotifications(game: Game, userId: DBObjectId, includeTurnWaiting: boolean = true, includeUnreadEvents: boolean = true, includeUnreadConversastions: boolean = true): Promise<GameUserNotification> {
        const player = game.galaxy.players.find(p => p.userId && p.userId.toString() === userId.toString());

        let unreadConversations: number | null = null,
            unreadEvents: number | null = null,
            totalUnread: number | null = null,
            turnWaiting: boolean | null = null;

        // Note: The player may have gone afk and been replaced by another player so we need to
        // double check that the player is actually in the game to retrieve conversation counts etc.
        if (player) {
            if (includeUnreadConversastions) unreadConversations = this.conversationService.getUnreadCount(game, player._id);
            if (includeUnreadEvents) unreadEvents = await this.eventService.getUnreadCount(game, player._id);
            if (includeTurnWaiting) turnWaiting = this.gameTypeService.isTurnBasedGame(game) && !player.ready;

            totalUnread = (unreadConversations || 0) + (unreadEvents || 0);
        }

        let notification: GameUserNotification = {
            unreadConversations,
            unreadEvents,
            unread: totalUnread,
            turnWaiting,
            defeated: player?.defeated || null,
            afk: player?.afk || null
        };

        return notification;
    }

    async listOldCompletedGamesNotCleaned(months: number = 1) {
        let date = moment().subtract(months, 'month');

        let query = {
            $and: [
                { 'state.winner': { $ne: null } },
                { 'state.endDate': { $lt: date } },
                {
                    $or: [
                        { 'state.cleaned': false },
                        { 'state.cleaned': { $eq: null } }
                    ]
                }
            ]
        };

        return await this.gameRepo.find(query, {
            _id: 1
        });
    }

    async listGamesTimedOutWaitingForPlayers() {
        let date = moment().subtract(7, 'day');

        let games = await this.gameRepo.find({
            'settings.general.type': { 
                $in: [
                    'custom',
                    'special_dark',
                    'special_ultraDark',
                    'special_orbital',
                    'special_battleRoyale',
                    'special_homeStar',
                    'special_anonymous',
                    'special_kingOfTheHill',
                    'special_tinyGalaxy'
                ]
            },
            'state.startDate': { $eq: null }
        }, {
            'galaxy.stars': 0,
            'galaxy.carriers': 0
        });
        
        return games.filter(g => {
            return moment(g._id.getTimestamp()) <= date;
        });
    }

    async listInProgressGames() {
        let games = await this.gameRepo.find({
            'settings.general.type': { $nin: ['tutorial'] },
            'state.startDate': { $ne: null },
            'state.endDate': { $eq: null },
            'state.paused': { $eq: false }
        }, {
            'settings.general.name': 1,
            'settings.general.type': 1,
            'settings.general.playerLimit': 1,
            state: 1,
            'galaxy.players.afk': 1
        }, {
            'state.startDate': -1
        });

        for (let game of games) {
            game.state.afkSlots = game.galaxy.players.filter(p => p.afk).length;

            delete (game as any).galaxy;
        }

        return games;
    }

    async listInProgressGamesGameTick() {
        return await this.gameRepo.find({
            'state.startDate': { $ne: null },
            'state.endDate': { $eq: null },
            'state.paused': { $eq: false },
            'state.locked': { $eq: false }
        }, {
            _id: 1,
            state: 1,
            settings: 1,
            'galaxy.players': 1
        }, {
            'settings.gameTime.speed': 1    // Prioritise faster games first.
        });
    }

    async listOpenGamesCreatedByUser(userId: DBObjectId) {
        return await this.gameRepo.find({
            'settings.general.createdByUserId': { $eq: userId },
            'state.startDate': { $eq: null }
        });
    }

    async getUserTutorial(userId: DBObjectId) {
        const tutorial = await this.gameRepo.findOne({
            'settings.general.type': 'tutorial',
            'state.endDate': { $eq: null }, // Game is in progress
            'galaxy.players': { 
                $elemMatch: { 
                    userId,
                    defeated: false
                } 
            }
        }, {
            _id: 1
        });

        return tutorial;
    }

    async listCompletedTutorials() {
        let date = moment().subtract(1, 'day');

        let games = await this.gameRepo.find({
            'settings.general.type': 'tutorial',
            'state.endDate': { $ne: null }
        }, {
            _id: 1
        });
        
        return games.filter(g => {
            return moment(g._id.getTimestamp()) <= date;
        });
    }

};
