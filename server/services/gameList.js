const moment = require('moment');

module.exports = class GameListService {
    
    constructor(gameModel, gameService, conversationService, eventService) {
        this.gameModel = gameModel;
        this.gameService = gameService;
        this.conversationService = conversationService;
        this.eventService = eventService;
    }

    async listOfficialGames() {
        return await this.gameModel.find({
            'settings.general.type': { $ne: 'custom' },
            'state.startDate': { $eq: null }
        })
        .select({
            'settings.general.type': 1,
            'settings.general.featured': 1,
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        })
        .lean({ defaults: true })
        .exec();
    }

    async listUserGames(select) {
        select = select || {
            'settings.general.type': 1,
            'settings.general.featured': 1,
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        };

        return await this.gameModel.find({
            'settings.general.type': { $eq: 'custom' },
            'state.startDate': { $eq: null }
        })
        .select(select)
        .lean({ defaults: true })
        .exec();
    }

    async listActiveGames(userId) {
        const games = await this.gameModel.find({
            'state.endDate': { $eq: null }, // Game is in progress
            $or: [
                // User is playing or has been afk'd
                { 'galaxy.players': { $elemMatch: { userId } } },
                { 'afkers': { $in: [userId] } }
            ]
        })
        .sort({
            'state.startDate': -1 // Sort start date descending (most recent started games appear first)
        })
        .select({
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            'settings.gameTime': 1,
            'galaxy.players': 1,
            conversations: 1,
            state: 1
        })
        .lean({ defaults: true })
        .exec();

        return await Promise.all(games.map(async game => {
            const player = game.galaxy.players.find(p => p.userId === userId.toString());
            const playerId = player._id;
            const unreadConversations = this.conversationService.getUnreadCount(game, playerId);
            const unreadEvents = await this.eventService.getUnreadCount(game, playerId);

            const turnWaiting = this.gameService.isTurnBasedGame(game) && !player.ready;

            return {
                _id: game._id,
                settings: game.settings,
                state: game.state,
                unread: unreadConversations + unreadEvents,
                turnWaiting,
                defeated: player.defeated,
                afk: player.afk
            }
        }))
    }

    async listCompletedGames(userId) {
        return await this.gameModel.find({
            'state.endDate': { $ne: null }, // Game is finished
            $or: [
                // User was active in the game or has been afk'd
                { 'galaxy.players': { $elemMatch: { userId } } },
                { 'afkers': { $in: [userId] } }
            ]
        })
        .sort({
            'state.endDate': -1 // Sort end date descending (most recent ended games appear first)
        })
        .select({
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        })
        .lean({ defaults: true })
        .exec();
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

        return await this.gameModel.find(query, {
            _id: 1
        })
        .lean()
        .exec();
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
        return await this.gameModel.find({
            'state.startDate': { $lte: moment().utc().toDate() },
            'state.endDate': { $eq: null },
            'state.paused': { $eq: false }
        })
        .sort({
            'state.startDate': -1
        })
        .select({
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        })
        .lean()
        .exec();
    }

    async listInProgressGamesGameTick() {
        return await this.gameModel.find({
            'state.startDate': { $lte: moment().utc().toDate() },
            'state.endDate': { $eq: null },
            'state.paused': { $eq: false },
            'state.locked': { $eq: false }
        })
        .sort({
            'settings.gameTime.speed': 1    // Prioritise faster games first.
        })
        .select({
            _id: 1,
            state: 1,
            settings: 1,
            'galaxy.players': 1
        })
        .exec();
    }

    async listOpenGamesCreatedByUser(userId) {
        return await this.gameModel.find({
            'settings.general.createdByUserId': { $eq: userId },
            'state.startDate': { $eq: null }
        })
        .exec();
    }

};
