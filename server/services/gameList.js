const moment = require('moment');

module.exports = class GameListService {
    
    constructor(gameRepo, gameService, conversationService, eventService) {
        this.gameRepo = gameRepo;
        this.gameService = gameService;
        this.conversationService = conversationService;
        this.eventService = eventService;
    }

    async listOfficialGames() {
        return await this.gameRepo.find({
            'settings.general.type': { $ne: 'custom' },
            'state.startDate': { $eq: null }
        }, {
            'settings.general.type': 1,
            'settings.general.featured': 1,
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        });
    }

    async listUserGames(select) {
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

    async listActiveGames(userId) {
        const games = await this.gameRepo.find({
            'state.endDate': { $eq: null }, // Game is in progress
            $or: [
                // User is playing or has been afk'd
                { 'galaxy.players': { $elemMatch: { userId } } },
                { 'afkers': { $in: [userId] } }
            ]
        }, {
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            'settings.gametime.speed': 1,
            'settings.gametime.gameType': 1,
            'settings.gameTime': 1,
            'settings.galaxy.productionTicks': 1,
            'galaxy.players': 1,
            conversations: 1,
            state: 1
        }, {
            'state.startDate': -1 // Sort start date descending (most recent started games appear first)
        });

        return await Promise.all(games.map(async game => {
            const player = game.galaxy.players.find(p => p.userId === userId.toString());

            let unreadConversations = null,
                unreadEvents = null,
                totalUnread = null,
                turnWaiting = null;

            // Note: The player may have gone afk and been replaced by another player so we need to
            // double check that the player is actually in the game to retrieve conversation counts etc.
            if (player) {
                unreadConversations = this.conversationService.getUnreadCount(game, player._id);
                unreadEvents = await this.eventService.getUnreadCount(game, player._id);
                turnWaiting = this.gameService.isTurnBasedGame(game) && !player.ready;

                totalUnread = unreadConversations + unreadEvents;
            }

            return {
                _id: game._id,
                settings: game.settings,
                state: game.state,
                unread: totalUnread,
                turnWaiting,
                defeated: player?.defeated,
                afk: player?.afk
            }
        }))
    }

    async listCompletedGames(userId) {
        return await this.gameRepo.find({
            'state.endDate': { $ne: null }, // Game is finished
            $or: [
                // User was active in the game or has been afk'd
                { 'galaxy.players': { $elemMatch: { userId } } },
                { 'afkers': { $in: [userId] } }
            ]
        }, {
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        }, {
            'state.endDate': -1 // Sort end date descending (most recent ended games appear first)
        });
    }

    async listOldCompletedGames(months = 1, cleaned = null) {
        let date = moment().subtract(months, 'month');

        let query = {
            $and: [
                { 'state.winner': { $ne: null } },
                { 'state.endDate': { $lt: date } }
            ]
        };
        
        if (cleaned != null) {
            query['$and'].push({
                'state.cleaned': cleaned
            });
        }

        return await this.gameRepo.find(query, {
            _id: 1
        });
    }

    async listCustomGamesTimedOut() {
        let date = moment().subtract(7, 'day');

        let userGames = await this.listUserGames({
            'galaxy.stars': 0,
            'galaxy.carriers': 0
        });

        return userGames.filter(g => {
            return moment(g._id.getTimestamp()) <= date;
        });
    }

    async listInProgressGames() {
        return await this.gameRepo.find({
            'state.startDate': { $lte: moment().utc().toDate() },
            'state.endDate': { $eq: null },
            'state.paused': { $eq: false }
        }, {
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        }, {
            'state.startDate': -1
        });
    }

    async listInProgressGamesGameTick() {
        return await this.gameRepo.find({
            'state.startDate': { $lte: moment().utc().toDate() },
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

    async listOpenGamesCreatedByUser(userId) {
        return await this.gameRepo.find({
            'settings.general.createdByUserId': { $eq: userId },
            'state.startDate': { $eq: null }
        });
    }

};
