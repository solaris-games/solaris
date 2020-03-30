module.exports = class ResearchService {

    constructor() {
        
    }

    async updateResearchNow(game, userId, preference) {
        // Get the user's player and update their research preference.
        let userPlayer = game.galaxy.players.find(p => p.userId === userId);

        userPlayer.researchingNow = preference;

        return await game.save();
    }

    async updateResearchNext(game, userId, preference) {
        // Get the user's player and update their research preference.
        let userPlayer = game.galaxy.players.find(p => p.userId === userId);

        userPlayer.researchingNext = preference;

        return await game.save();
    }

};
