const EventEmitter = require('events');
const ValidationError = require('../errors/validation');

module.exports = class ResearchService extends EventEmitter {

    constructor(gameModel, technologyService, randomService, playerService, userService) {
        super();
        
        this.gameModel = gameModel;
        this.technologyService = technologyService;
        this.randomService = randomService;
        this.playerService = playerService;
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

    async conductResearch(game, player) {
        // TODO: Defeated players do not conduct research or experiments?
        if (player.defeated) {
            return;
        }
        
        let user = await this.userService.getById(player.userId);

        let techKey = player.researchingNow;
        let tech = player.research[techKey];

        let totalScience = this.playerService.calculateTotalScience(player, game.galaxy.stars);
            
        tech.progress += totalScience;
        user.achievements.research[techKey] += totalScience;

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

        await user.save();

        let report = {
            name: techKey,
            level: tech.level,
            progress: tech.progress,
            levelUp,
            currentResearchTicksEta
        }
        
        return report;
    }

    async conductResearchAll(game, report) {
        // Add the current level of experimentation to the current 
        // tech being researched.
        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            // TODO: Defeated players do not conduct research or experiments?
            if (player.defeated) {
                continue;
            }
            
            let researchReport = await this.conductResearch(game, player);

            researchReport.playerId = player._id;

            report.playerResearch.push(researchReport);
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

        // TODO: Defeated players do not conduct research or experiments?
        if (player.defeated) {
            return;
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
            levelUp = true;
        }

        // If the technology leveled up, we need to change the research
        // to the next desired research technology.
        if (levelUp) {
            this._setNextResearch(game, player);
        }

        // The current research may have been the one experimented on, so make sure we get the ETA of it.
        let currentResearchTicksEta = this.calculateCurrentResearchETAInTicks(game, player);

        return {
            technology: tech.key,
            level: tech.technology.level,
            // TODO: Return effective tech level
            progress: tech.technology.progress,
            amount: researchAmount,
            levelUp,
            currentResearchTicksEta
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

        let totalScience = this.playerService.calculateTotalScience(player, game.galaxy.stars);

        // If there is no science then there cannot be an end date to the research.
        if (totalScience === 0) {
            return null;
        }

        return Math.ceil(remainingPoints / totalScience);
    }

};
