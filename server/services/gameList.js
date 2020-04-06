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
        .select(SELECTS.INFO)
        .exec();
    }

    async listUserGames() {
        return await this.gameModel.find({
            'settings.general.createdByUserId': { $ne: null },
            'state.startDate': { $eq: null }
        })
        .select(SELECTS.INFO)
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
        .select(SELECTS.INFO)
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
            'state.endDate': -1 // Sort end date descending
        })
        .select(SELECTS.INFO)
        .exec();
    }

};
