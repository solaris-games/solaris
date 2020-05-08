module.exports = class ResearchService {

    constructor(randomService) {
        this.randomService = randomService;
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

    conductResearch(game, player) {
        let tech = player.research[player.researchingNow];
            
        tech.progress += player.research.experimentation.level;

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = tech.level * game.constants.research.progressMultiplier;

        if (tech.progress >= requiredProgress) {
            tech.level++;
            tech.progress -= requiredProgress;
            player.researchingNow = player.researchingNext;
        }
    }

    conductExperiments(game, player) {
        let techs = Object.keys(player.research).filter(k => {
            return k.match(/^[^_\$]/) != null;
        });

        let researchTechsCount = techs.length;

        let techKey = techs[this.randomService.getRandomNumber(researchTechsCount - 1)];
        let tech = player.research[techKey];

        tech.progress += player.research.experimentation.level * (game.constants.research.progressMultiplier / 2);

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = tech.level * game.constants.research.progressMultiplier;

        while (tech.progress >= requiredProgress) {
            tech.level++;
            tech.progress -= requiredProgress;
        }
    }

};
