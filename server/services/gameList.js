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
            'galaxy.players': { $elemMatch: { userId } }
            // TODO: Filter out finished games?
        })
        .select(SELECTS.INFO)
        .exec();
    }
};
