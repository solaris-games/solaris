const ValidationError = require('../errors/validation');

module.exports = class ResearchService {

    constructor(technologyService, randomService, playerService, eventService, userService) {
        this.technologyService = technologyService;
        this.randomService = randomService;
        this.playerService = playerService;
        this.eventService = eventService;
        this.userService = userService;
    }

    async updateResearchNow(game, player, preference) {
        if (!this.technologyService.isTechnologyEnabled(game, preference)) {
            throw new ValidationError(`Cannot change technology, the chosen tech is not researchable.`);
        }

        player.researchingNow = preference;

        await game.save();

        let ticksEta = this.calculateCurrentResearchETAInTicks(game, player);
        
        return {
            ticksEta
        };
    }

    async updateResearchNext(game, player, preference) {
        if (!this.technologyService.isTechnologyEnabled(game, preference)) {
            throw new ValidationError(`Cannot change technology, the chosen tech is not researchable.`);
        }

        player.researchingNext = preference;

        return await game.save();
    }

    async conductResearch(game, player) {
        // TODO: Defeated players do not conduct research or experiments?
        if (player.defeated) {
            return;
        }
        
        let user = await this.userService.getById(player.userId);

        let techKey = player.researchingNow;
        let tech = player.research[techKey];
            
        tech.progress += player.research.experimentation.level;
        user.achievements.research[techKey] += player.research.experimentation.level;

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = this.getRequiredResearchProgress(game, techKey, tech.level);

        if (tech.progress >= requiredProgress) {
            tech.level++;
            tech.progress -= requiredProgress;

            let eventTech = {
                name: techKey,
                level: tech.level
            };

            await this.eventService.createResearchCompleteEvent(game, player, eventTech);

            player.researchingNow = player.researchingNext;
        }

        await user.save();
    }

    getRequiredResearchProgress(game, technologyKey, technologyLevel) {
        const researchCostConfig = game.settings.technology.researchCosts[technologyKey];
        const expenseCostConfig = game.constants.star.infrastructureExpenseMultipliers[researchCostConfig];
        const progressMultiplierConfig = expenseCostConfig * game.constants.research.progressMultiplier;

        return technologyLevel * progressMultiplierConfig;
    }

    async conductExperiments(game, player) {
        // TODO: Defeated players do not conduct research or experiments?
        if (player.defeated) {
            return;
        }

        let techs = Object.keys(player.research).filter(k => {
            return k.match(/^[^_\$]/) != null;
        });

        techs = techs.filter(t => this.technologyService.isTechnologyEnabled(game, t));

        if (!techs.length) {
            return;
        }

        let user = await this.userService.getById(player.userId);

        let researchTechsCount = techs.length;

        let techKey = techs[this.randomService.getRandomNumber(researchTechsCount - 1)];
        let tech = player.research[techKey];
        let researchAmount = player.research.experimentation.level * (game.constants.research.progressMultiplier / 2);

        tech.progress += researchAmount;
        user.achievements.research[techKey] += researchAmount;

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = this.getRequiredResearchProgress(game, techKey, tech.level);

        while (tech.progress >= requiredProgress) {
            tech.level++;
            tech.progress -= requiredProgress;
        }

        await user.save();

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
