const GameService = require('./game');

module.exports = class ResearchService {

    constructor() {
        this.gameService = new GameService();
    }

    async updateResearchNow(gameId, userId, preference) {
        let game = await this.gameService.getByIdAll(gameId);

        // Get the user's player and update their research preference.
        let userPlayer = game.galaxy.players.find(p => p.userId === userId);

        userPlayer.researchingNow = preference;

        return await game.save();
    }

    async updateResearchNext(gameId, userId, preference) {
        let game = this.gameService.getByIdAll(gameId);

        // Get the user's player and update their research preference.
        let userPlayer = game.galaxy.players.find(p => p.userId === userId);

        userPlayer.researchingNext = preference;

        return await game.save();
    }

};
