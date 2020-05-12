module.exports = class ResearchService {

    constructor(randomService, playerService, timeService) {
        this.randomService = randomService;
        this.playerService = playerService;
        this.timeService = timeService;
    }

    async updateResearchNow(game, player, preference) {
        player.researchingNow = preference;

        await game.save();

        let eta = this.calculateCurrentResearchETAInTicks(game, player);
        let etaTime = this.timeService.calculateTimeByTicks(eta, game.settings.gameTime.speed, game.state.lastTickDate);

        return {
            eta,
            etaTime
        };
    }

    async updateResearchNext(game, player, preference) {
        player.researchingNext = preference;

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

    calculateCurrentResearchETAInTicks(game, player) {
        let tech = player.research[player.researchingNow];

        let requiredProgress = tech.level * game.constants.research.progressMultiplier;
        let remainingPoints = requiredProgress - tech.progress;

        let totalScience = this.playerService.calculateTotalScience(player, game.galaxy.stars);

        return Math.ceil(remainingPoints / totalScience);
    }

};
