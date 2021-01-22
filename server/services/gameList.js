const moment = require('moment');

module.exports = class GameListService {
    
    constructor(gameModel) {
        this.gameModel = gameModel;
    }

    async listOfficialGames() {
        return await this.gameModel.find({
            'settings.general.createdByUserId': { $eq: null },
            'state.startDate': { $eq: null }
        })
        .sort({
            'settings.general.description': 1 // Sort description ascending
        })
        .select({
            'settings.general.name': 1,
            'settings.general.description': 1,
            'settings.general.playerLimit': 1,
            state: 1
        })
        .lean({ defaults: true })
        .exec();
    }

    async listUserGames(select) {
        select = select || {
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        };

        return await this.gameModel.find({
            'settings.general.createdByUserId': { $ne: null },
            'state.startDate': { $eq: null }
        })
        .select(select)
        .lean({ defaults: true })
        .exec();
    }

    async listActiveGames(userId) {
        return await this.gameModel.find({
            'galaxy.players': { $elemMatch: { userId } },   // User is in game
            $and: [                                         // and (game is in progress AND user's player is not defeated)
                { 'state.endDate': { $eq: null } },
                { 
                    'galaxy.players': { 
                        $elemMatch: { 
                            userId, 
                            defeated: { $in: [ null, false ] } // Defeated either not set or is false.
                        }
                    }
                }
            ]
        })
        .sort({
            'state.startDate': -1 // Sort start date descending (most recent started games appear first)
        })
        .select({
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        })
        .lean({ defaults: true })
        .exec();
    }

    async listCompletedGames(userId) {
        return await this.gameModel.find({
            'galaxy.players': { $elemMatch: { userId } },   // User is in game
            $or: [                                          // and (game is in progress OR user's player is defeated)
                { 'state.endDate': { $ne: null } },
                { 'galaxy.players': { $elemMatch: { userId, defeated: true } } }
            ]
        })
        .sort({
            'state.startDate': -1 // Sort start date descending (most recent finished games appear first)
        })
        .select({
            'settings.general.name': 1,
            'settings.general.playerLimit': 1,
            state: 1
        })
        .lean({ defaults: true })
        .exec();
    }

    async listOldCompletedGames() {
        let date = moment().subtract(3, 'month');

        return await this.gameModel.find({
            'state.endDate': { $lt: date }
        })
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
        .select({
            _id: 1
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
