const moment = require('moment');

const SELECTS = {
    INFO: {
        settings: 1,
        state: 1
    },
    SETTINGS: {
        settings: 1
    },
    GALAXY: {
        galaxy: 1
    }
};

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
        .select(SELECTS.INFO)
        .lean()
        .exec();
    }

    async listUserGames() {
        return await this.gameModel.find({
            'settings.general.createdByUserId': { $ne: null },
            'state.startDate': { $eq: null }
        })
        .select(SELECTS.INFO)
        .lean()
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
        .select(SELECTS.INFO)
        .lean()
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
        .select(SELECTS.INFO)
        .lean()
        .exec();
    }

    async listInProgressGames() {
        return await this.gameModel.find({
            'state.startDate': { $lte: moment().utc().toDate() },
            'state.endDate': { $eq: null },
            'state.paused': { $eq: false }
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
