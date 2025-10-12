const EventEmitter = require('events');
import { ValidationError } from "solaris-common";
import Repository from './repository';
import { Game } from './types/Game';
import {Player, ResearchProgress, ResearchType, ResearchTypeNotRandom} from './types/Player';
import { User } from './types/User';
import { GameTypeService } from 'solaris-common'
import PlayerStatisticsService from './playerStatistics';
import RandomService from './random';
import StarService from './star';
import { TechnologyService } from 'solaris-common';
import UserService from './user';
import StatisticsService from './statistics';

export const ResearchServiceEvents = {
    onPlayerResearchCompleted: 'onPlayerResearchCompleted'
}

export default class ResearchService extends EventEmitter {
    gameRepo: Repository<Game>;
    technologyService: TechnologyService;
    randomService: RandomService;
    playerStatisticsService: PlayerStatisticsService;
    starService: StarService;
    userService: UserService;
    gameTypeService: GameTypeService;
    statisticsService: StatisticsService;

    constructor(
        gameRepo: Repository<Game>,
        technologyService: TechnologyService,
        randomService: RandomService,
        playerStatisticsService: PlayerStatisticsService,
        starService: StarService,
        userService: UserService,
        gameTypeService: GameTypeService,
        statisticsService: StatisticsService,
    ) {
        super();
        
        this.gameRepo = gameRepo;
        this.technologyService = technologyService;
        this.randomService = randomService;
        this.playerStatisticsService = playerStatisticsService;
        this.starService = starService;
        this.userService = userService;
        this.gameTypeService = gameTypeService;
        this.statisticsService = statisticsService;
    }

    async updateResearchNow(game: Game, player: Player, preference: ResearchTypeNotRandom) {
        if (!this.technologyService.isTechnologyResearchable(game, preference)) {
            throw new ValidationError(`Cannot change technology, the chosen tech is not researchable.`);
        }

        player.researchingNow = preference;

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.researchingNow': preference
            }
        });

        let ticksEta = this.calculateCurrentResearchETAInTicks(game, player);
        let ticksNextEta = this.calculateNextResearchETAInTicks(game, player);
        
        return {
            ticksEta,
            ticksNextEta
        };
    }

    async updateResearchNext(game: Game, player: Player, preference: ResearchType) {
        if (preference !== 'random' &&
            (!this.technologyService.isTechnologyResearchable(game, preference))) {
            throw new ValidationError(`Cannot change technology, the chosen tech is not researchable.`);
        }

        player.researchingNext = preference;

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.researchingNext': preference
            }
        });

        let ticksEta = this.calculateCurrentResearchETAInTicks(game, player);
        let ticksNextEta = this.calculateNextResearchETAInTicks(game, player);
        
        return {
            ticksEta,
            ticksNextEta
        };
    }

    conductResearch(game: Game, user: User | null, player: Player) {
        let techKey = player.researchingNow;
        let tech = player.research[techKey];

        if (!this.technologyService.isTechnologyResearchable(game, techKey)) {
            return null;
        }

        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        let totalScience = this.playerStatisticsService.calculateTotalScience(game, playerStars);
        let progressIncrease = totalScience;

        tech.progress! += progressIncrease;

        // If the player isn't being controlled by AI then increment achievements.
        if (user && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            this.statisticsService.modifyStats(game._id, player._id, (stats) => {
                stats.research[techKey] += progressIncrease;
            });
        }

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = this.getRequiredResearchProgress(game, techKey, tech.level);

        let levelUp = false;

        while (tech.progress! >= requiredProgress) {
            tech.level++;
            tech.progress! -= requiredProgress;
            
            requiredProgress = this.getRequiredResearchProgress(game, techKey, tech.level);
            levelUp = true
        }

        if (levelUp) {
            this._setNextResearch(game, player);

            this.emit(ResearchServiceEvents.onPlayerResearchCompleted, {
                gameId: game._id,
                gameTick: game.state.tick,
                playerId: player._id,
                technologyKey: techKey,
                technologyLevel: tech.level,
                technologyKeyNext: player.researchingNow,
                technologyLevelNext: player.research[player.researchingNow].level + 1
            });
        }

        let currentResearchTicksEta = this.calculateCurrentResearchETAInTicks(game, player);
        let nextResearchTicksEta = this.calculateNextResearchETAInTicks(game, player);

        let report = {
            name: techKey,
            level: tech.level,
            progress: tech.progress,
            levelUp,
            currentResearchTicksEta,
            nextResearchTicksEta
        }
        
        return report;
    }

    conductResearchAll(game: Game, gameUsers: User[]) {
        // Add the current level of experimentation to the current 
        // tech being researched.
        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            let user = gameUsers.find(u => player.userId && u._id.toString() === player.userId.toString()) || null;
            
            this.conductResearch(game, user, player);
        }
    }

    getRequiredResearchProgress(game: Game, technologyKey: ResearchTypeNotRandom, technologyLevel: number) {
        const researchCostConfig = game.settings.technology.researchCosts[technologyKey];
        const expenseCostConfig = game.constants.star.infrastructureExpenseMultipliers[researchCostConfig];
        const progressMultiplierConfig = expenseCostConfig * game.constants.research.progressMultiplier;

        if (game.settings.technology.researchCostProgression.progression === "exponential") {
            const growthFactor = game.constants.research.exponentialGrowthFactors[game.settings.technology.researchCostProgression.growthFactor];
            return Math.floor(progressMultiplierConfig * Math.pow(growthFactor, technologyLevel - 1));
        } else {
            return technologyLevel * progressMultiplierConfig;
        }
    }

    conductExperiments(game: Game, player: Player) {
        // NOTE: Experiments do not count towards player research achievements.
        // Check if experimentation is enabled.
        const isExperimentationEnabled = this.technologyService.isTechnologyEnabled(game, 'experimentation');

        const noExperimentation = {
            technology: null,
            level: null,
            amount: null,
            levelUp: null,
            researchingNext: null
        };

        if (!isExperimentationEnabled) {
            return noExperimentation;
        }

        const experimentationDistribution = game.settings.technology.experimentationDistribution;

        // NOTE: Players must own stars in order to have experiments.
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        if (!playerStars.length) {
            return noExperimentation;
        }

        let tech: { key: ResearchTypeNotRandom, technology: ResearchProgress } | null = null;

        if (experimentationDistribution === 'random') {
            tech = this._getRandomTechnology(game, player);
        } else if (experimentationDistribution === 'current_research') {
            tech = {
                key: player.researchingNow,
                technology: player.research[player.researchingNow]
            }
        }

        if (!tech) {
            return noExperimentation;
        }
        
        let techLevel = player.research.experimentation.level;
        let progressMultiplier = game.constants.research.progressMultiplier;
        let experimentationMultiplier = game.constants.research.experimentationMultiplier;
        let researchAmount;

        switch (game.settings.technology.experimentationReward) {
            case 'standard':
                researchAmount = Math.floor(techLevel * (progressMultiplier * experimentationMultiplier));
                break;
            case 'experimental':
                let totalScience = this.playerStatisticsService.calculateTotalScience(game, playerStars);
                researchAmount = Math.floor((techLevel * (progressMultiplier * experimentationMultiplier)) + (0.15 * techLevel * totalScience));
                break;
            default:
                throw new Error(`Unsupported experimentation reward ${game.settings.technology.experimentationReward}`);
        }

        tech.technology.progress = tech.technology.progress || 0;
        tech.technology.progress += researchAmount;

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = this.getRequiredResearchProgress(game, tech.key, tech.technology.level);

        let levelUp = false;
        let researchingNext;

        while (tech.technology.progress! >= requiredProgress) {
            tech.technology.level++;
            tech.technology.progress -= requiredProgress;
            requiredProgress = this.getRequiredResearchProgress(game, tech.key, tech.technology.level);
            levelUp = true;
        }

        // If the technology leveled up, we need to change the research
        // to the next desired research technology.
        if (levelUp && tech.key === player.researchingNow) {
            this._setNextResearch(game, player);
            researchingNext = player.researchingNext
        }

        return {
            technology: tech.key,
            level: tech.technology.level,
            amount: researchAmount,
            levelUp,
            researchingNext 
        };
    }

    _setNextResearch(game: Game, player: Player) {
        if (player.researchingNext === player.researchingNow) {
            return;
        }

        if (player.researchingNext === 'random') {
            let randomTech = this._getRandomTechnology(game, player);

            if (randomTech) {
                player.researchingNow = randomTech.key;
            }
        } else {
            player.researchingNow = player.researchingNext;
        }

        return player.researchingNow;
    }

    _getRandomTechnology(game: Game, player: Player): { key: ResearchTypeNotRandom, technology: ResearchProgress } | null {
        let techs = Object.keys(player.research).filter(k => {
            return k.match(/^[^_\$]/) != null;
        }) as ResearchTypeNotRandom[];

        techs = techs.filter(t => this.technologyService.isTechnologyResearchable(game, t));

        if (!techs.length) {
            return null;
        }

        const researchTechsCount = techs.length;

        const techKey = techs[this.randomService.getRandomNumber(researchTechsCount - 1)] as ResearchTypeNotRandom;
        const tech = player.research[techKey];

        return {
            key: techKey,
            technology: tech
        };
    }

    calculateCurrentResearchETAInTicks(game: Game, player: Player) {
        return this._calculateResearchETAInTicks(game, player, player.researchingNow);
    }

    calculateNextResearchETAInTicks(game: Game, player: Player) {
        if (player.researchingNext === 'random') {
          return null;
        }

        if (player.researchingNow !== player.researchingNext) {
            let currentResearchTicksEta = this.calculateCurrentResearchETAInTicks(game, player);
            let nextResearchTicksEta = this._calculateResearchETAInTicks(game, player, player.researchingNext);

            if (currentResearchTicksEta == null || nextResearchTicksEta == null) {
                return null;
            }

            return currentResearchTicksEta + nextResearchTicksEta;
        }

        return this.calculateDoubleIdenticalResearchETAInTicks(game, player)
      }

    _calculateResearchETAInTicks(game: Game, player: Player, researchKey: ResearchType) {
        if (researchKey === 'random') {
            return null;
        }

        let tech = player.research[researchKey];

        let requiredProgress = this.getRequiredResearchProgress(game, researchKey, tech.level);
        let remainingPoints = requiredProgress - tech.progress!;

        return this._calculateResearchETAInTicksByRemainingPoints(game, player, remainingPoints);
    }

    calculateDoubleIdenticalResearchETAInTicks(game: Game, player: Player)  {        
        let tech = player.research[player.researchingNow];
        
        let requiredProgress = this.getRequiredResearchProgress(game, player.researchingNow, tech.level) 
                             + this.getRequiredResearchProgress(game, player.researchingNow, tech.level + 1);
        let remainingPoints = requiredProgress - tech.progress!;

        return this._calculateResearchETAInTicksByRemainingPoints(game, player, remainingPoints);
    }

    _calculateResearchETAInTicksByRemainingPoints(game: Game, player: Player, remainingPoints: number) {
        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);
        let totalScience = this.playerStatisticsService.calculateTotalScience(game, playerStars);
        
        // If there is no science then there cannot be an end date to the research.
        if (totalScience === 0) {
            return null;
        }
        
        return Math.ceil(remainingPoints / totalScience);
    }
};
