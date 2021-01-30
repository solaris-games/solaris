const EventEmitter = require('events');
const ValidationError = require('../errors/validation');

module.exports = class ResearchService extends EventEmitter {

    constructor(gameModel, technologyService, randomService, playerService, starService, userService) {
        super();
        
        this.gameModel = gameModel;
        this.technologyService = technologyService;
        this.randomService = randomService;
        this.playerService = playerService;
        this.starService = starService;
        this.userService = userService;
    }

    async updateResearchNow(game, player, preference) {
        preference = preference.toLowerCase().trim();

        if (!this.technologyService.isTechnologyEnabled(game, preference)) {
            throw new ValidationError(`Cannot change technology, the chosen tech is not researchable.`);
        }

        player.researchingNow = preference;

        await this.gameModel.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.researchingNow': preference
            }
        });

        let ticksEta = this.calculateCurrentResearchETAInTicks(game, player);
        
        return {
            ticksEta
        };
    }

    async updateResearchNext(game, player, preference) {
        preference = preference.toLowerCase().trim();

        if (preference !== 'random' && !this.technologyService.isTechnologyEnabled(game, preference)) {
            throw new ValidationError(`Cannot change technology, the chosen tech is not researchable.`);
        }

        player.researchingNext = preference;

        await this.gameModel.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.researchingNext': preference
            }
        });

        return await game.save();
    }

    async conductResearch(game, user, player) {
        let techKey = player.researchingNow;
        let tech = player.research[techKey];

        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        let totalScience = this.playerService.calculateTotalScience(playerStars);
            
        tech.progress += totalScience;

        // If the player isn't being controlled by AI then increment achievements.
        if (user && !player.defeated) {
            user.achievements.research[techKey] += totalScience;
        }

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = this.getRequiredResearchProgress(game, techKey, tech.level);

        let levelUp = false;

        if (tech.progress >= requiredProgress) {
            tech.level++;
            tech.progress -= requiredProgress;

            this.emit('onPlayerResearchCompleted', {
                game,
                player,
                technology: {name:techKey,level:tech.level}
            });

            this._setNextResearch(game, player);

            levelUp = true
        }

        let currentResearchTicksEta = this.calculateCurrentResearchETAInTicks(game, player);

        let report = {
            name: techKey,
            level: tech.level,
            progress: tech.progress,
            levelUp,
            currentResearchTicksEta
        }
        
        return report;
    }

    async conductResearchAll(game, gameUsers) {
        // Add the current level of experimentation to the current 
        // tech being researched.
        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            let user = gameUsers.find(u => u._id.equals(player.userId));
            
            await this.conductResearch(game, user, player);
        }
    }

    getRequiredResearchProgress(game, technologyKey, technologyLevel) {
        const researchCostConfig = game.settings.technology.researchCosts[technologyKey];
        const expenseCostConfig = game.constants.star.infrastructureExpenseMultipliers[researchCostConfig];
        const progressMultiplierConfig = expenseCostConfig * game.constants.research.progressMultiplier;

        return technologyLevel * progressMultiplierConfig;
    }

    conductExperiments(game, player) {
        // NOTE: Experiments do not count towards player research achievements.
        // Check if experimentation is enabled.
        let isExperimentationEnabled = this.technologyService.isTechnologyEnabled(game, 'experimentation');
        
        // NOTE: Players must own stars in order to have experiments.
        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        if (!isExperimentationEnabled || !playerStars.length) {
            return {
                technology: null,
                level: null,
                amount: null
            };
        }

        let tech = this._getRandomTechnology(game, player);

        if (!tech) {
            return;
        }

        let effectiveTechs = this.technologyService.getPlayerEffectiveTechnologyLevels(game, player);
        let researchAmount = effectiveTechs.experimentation * game.constants.research.progressMultiplier;

        tech.technology.progress += researchAmount;

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = this.getRequiredResearchProgress(game, tech.key, tech.technology.level);

        let levelUp = false;

        while (tech.technology.progress >= requiredProgress) {
            tech.technology.level++;
            tech.technology.progress -= requiredProgress;
            requiredProgress = this.getRequiredResearchProgress(game, tech.key, tech.technology.level);
            levelUp = true;
        }

        // If the technology leveled up, we need to change the research
        // to the next desired research technology.
        if (levelUp && tech.key === player.researchingNow) {
            this._setNextResearch(game, player);
        }

        return {
            technology: tech.key,
            level: tech.technology.level,
            amount: researchAmount
        };
    }

    _setNextResearch(game, player) {
        if (player.researchingNext === player.researchingNow) {
            return;
        }

        if (player.researchingNext === 'random') {
            let randomTech = this._getRandomTechnology(game, player);

            player.researchingNow = randomTech.key;
        } else {
            player.researchingNow = player.researchingNext;
        }

        return player.researchingNow;
    }

    _getRandomTechnology(game, player) {
        let techs = Object.keys(player.research).filter(k => {
            return k.match(/^[^_\$]/) != null;
        });

        techs = techs.filter(t => this.technologyService.isTechnologyEnabled(game, t));

        if (!techs.length) {
            return null;
        }

        let researchTechsCount = techs.length;

        let techKey = techs[this.randomService.getRandomNumber(researchTechsCount - 1)];
        let tech = player.research[techKey];

        return {
            key: techKey,
            technology: tech
        };
    }

    calculateCurrentResearchETAInTicks(game, player) {
        let tech = player.research[player.researchingNow];
        
        let requiredProgress = this.getRequiredResearchProgress(game, player.researchingNow, tech.level);
        let remainingPoints = requiredProgress - tech.progress;

        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        let totalScience = this.playerService.calculateTotalScience(playerStars);

        // If there is no science then there cannot be an end date to the research.
        if (totalScience === 0) {
            return null;
        }

        return Math.ceil(remainingPoints / totalScience);
    }

};
