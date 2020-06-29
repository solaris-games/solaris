module.exports = class ResearchService {

    constructor(randomService, playerService, timeService, eventService) {
        this.randomService = randomService;
        this.playerService = playerService;
        this.timeService = timeService;
        this.eventService = eventService;
    }

    async updateResearchNow(game, player, preference) {
        player.researchingNow = preference;

        await game.save();

        let etaTicks = this.calculateCurrentResearchETAInTicks(game, player);
        let etaTime = null;
        
        if (eta) {
            this.timeService.calculateTimeByTicks(etaTicks, game.settings.gameTime.speed, game.state.lastTickDate);
        }

        return {
            etaTicks,
            etaTime
        };
    }

    async updateResearchNext(game, player, preference) {
        player.researchingNext = preference;

        return await game.save();
    }

    async conductResearch(game, player) {
        // TODO: Defeated players do not conduct research or experiments?
        if (player.defeated) {
            return;
        }

        let tech = player.research[player.researchingNow];
            
        tech.progress += player.research.experimentation.level;

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = this.getRequiredResearchProgress(game, player.researchingNow, tech.level);

        if (tech.progress >= requiredProgress) {
            tech.level++;
            tech.progress -= requiredProgress;

            let eventTech = {
                name: player.researchingNow,
                level: tech.level
            };

            await this.eventService.createResearchCompleteEvent(game, player, eventTech);

            player.researchingNow = player.researchingNext;
        }
    }

    getRequiredResearchProgress(game, technologyKey, technologyLevel) {
        const researchCostConfig = game.settings.technology.researchCosts[technologyKey];
        const expenseCostConfig = game.constants.star.infrastructureExpenseMultipliers[researchCostConfig];
        const progressMultiplierConfig = expenseCostConfig * game.constants.research.progressMultiplier;

        return technologyLevel * progressMultiplierConfig;
    }

    conductExperiments(game, player) {
        // TODO: Defeated players do not conduct research or experiments?
        if (player.defeated) {
            return;
        }

        let techs = Object.keys(player.research).filter(k => {
            return k.match(/^[^_\$]/) != null;
        });

        let researchTechsCount = techs.length;

        let techKey = techs[this.randomService.getRandomNumber(researchTechsCount - 1)];
        let tech = player.research[techKey];
        let researchAmount = player.research.experimentation.level * (game.constants.research.progressMultiplier / 2);

        tech.progress += researchAmount;

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = this.getRequiredResearchProgress(game, techKey, tech.level);

        while (tech.progress >= requiredProgress) {
            tech.level++;
            tech.progress -= requiredProgress;
        }

        return {
            technology: techKey,
            amount: researchAmount
        };
    }

    calculateCurrentResearchETAInTicks(game, player) {
        let tech = player.research[player.researchingNow];
        
        let requiredProgress = this.getRequiredResearchProgress(game, player.researchingNow, tech.level);
        let remainingPoints = requiredProgress - tech.progress;

        let totalScience = this.playerService.calculateTotalScience(player, game.galaxy.stars);

        // If there is no science then there cannot be an end date to the research.
        if (totalScience === 0) {
            return null;
        }

        return Math.ceil(remainingPoints / totalScience);
    }

};
