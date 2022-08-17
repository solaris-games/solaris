import {Carrier} from "./types/Carrier";

const EventEmitter = require('events');
import { DBObjectId } from './types/DBObjectId';
import ValidationError from '../errors/validation';
import Repository from './repository';
import { BulkUpgradeReport, InfrastructureUpgradeCosts, InfrastructureUpgradeReport } from './types/InfrastructureUpgrade';
import { Game, GameInfrastructureExpenseMultiplier } from './types/Game';
import { Player } from './types/Player';
import { InfrastructureType, NaturalResources, Star, TerraformedResources } from './types/Star';
import AchievementService from './achievement';
import CarrierService from './carrier';
import GameTypeService from './gameType';
import ResearchService from './research';
import StarService from './star';
import TechnologyService from './technology';
import PlayerCreditsService from './playerCredits';
const Heap = require('qheap');

export const StarUpgradeServiceEvents = {
    onPlayerInfrastructureBulkUpgraded: 'onPlayerInfrastructureBulkUpgraded'
};

export default class StarUpgradeService extends EventEmitter {
    gameRepo: Repository<Game>;
    starService: StarService;
    carrierService: CarrierService;
    achievementService: AchievementService;
    researchService: ResearchService;
    technologyService: TechnologyService;
    playerCreditsService: PlayerCreditsService;
    gameTypeService: GameTypeService;

    constructor(
        gameRepo: Repository<Game>,
        starService: StarService,
        carrierService: CarrierService,
        achievementService: AchievementService,
        researchService: ResearchService,
        technologyService: TechnologyService,
        playerCreditsService: PlayerCreditsService,
        gameTypeService: GameTypeService
    ) {
        super();

        this.gameRepo = gameRepo;
        this.starService = starService;
        this.carrierService = carrierService;
        this.achievementService = achievementService;
        this.researchService = researchService;
        this.technologyService = technologyService;
        this.playerCreditsService = playerCreditsService;
        this.gameTypeService = gameTypeService;
    }

    async buildWarpGate(game: Game, player: Player, starId: DBObjectId) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the player.
        if (star.ownedByPlayerId == null || star.ownedByPlayerId.toString() !== player._id.toString()) {
            throw new ValidationError(`Cannot upgrade, the star is not owned by the current player.`);
        }

        if (star.warpGate) {
            throw new ValidationError(`The star already has a warp gate.`);
        }

        if (game.settings.specialGalaxy.warpgateCost === 'none') {
            throw new ValidationError('The game settings has disabled the building of warp gates.');
        }

        if (this.starService.isDeadStar(star)) {
            throw new ValidationError('Cannot build a warp gate on a dead star.');
        }

        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);

        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.warpgateCost];
        const terraformedResources = this.starService.calculateTerraformedResources(star, effectiveTechs.terraforming);
        const averageTerraformedResources = this.calculateAverageTerraformedResources(terraformedResources);
        const cost = this.calculateWarpGateCost(game, expenseConfig, averageTerraformedResources);

        if (player.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to upgrade.`);
        }

        star.warpGate = true;
        player.credits -= cost;

        // Update the DB.
        await this.gameRepo.bulkWrite([
            await this._getDeductPlayerCreditsDBWrite(game, player, cost),
            this._getSetStarWarpGateDBWrite(game, star, true)
        ]);

        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementWarpGatesBuilt(player.userId);
        }

        return {
            starId: star._id,
            cost
        };
    }

    async destroyWarpGate(game: Game, player: Player, starId: DBObjectId) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the player
        if (star.ownedByPlayerId == null || star.ownedByPlayerId.toString() !== player._id.toString()) {
            throw new ValidationError(`Cannot destroy warp gate, the star is not owned by the current player.`);
        }

        if (!star.warpGate) {
            throw new ValidationError(`The star does not have a warp gate to destroy.`);
        }

        // Update the DB.
        await this.gameRepo.bulkWrite([
            this._getSetStarWarpGateDBWrite(game, star, false)
        ]);

        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementWarpGatesDestroyed(player.userId);
        }
    }

    async buildCarrier(game: Game, player: Player, starId: DBObjectId, ships: number, writeToDB: boolean = true): Promise<{carrier: Carrier, starShips: number}> {
        ships = ships || 1;

        if (ships < 1) {
            throw new ValidationError(`Carrier must have 1 or more ships.`);
        }

        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the player.
        if (star.ownedByPlayerId == null || star.ownedByPlayerId.toString() !== player._id.toString()) {
            throw new ValidationError(`Cannot build carrier, the star is not owned by the current player.`);
        }

        if (this.starService.isDeadStar(star)) {
            throw new ValidationError('Cannot build a carrier on a dead star.');
        }

        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.carrierCost];
        const cost = this.calculateCarrierCost(game, expenseConfig);

        if (player.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to build a carrier.`);
        }

        if (Math.floor(star.shipsActual!) < ships) {
            throw new ValidationError(`The star does not have enough ships garrisoned (${ships}) to build the carrier.`);
        }

        // Create a carrier at the star.
        let carrier = this.carrierService.createAtStar(star, game.galaxy.carriers, ships);

        game.galaxy.carriers.push(carrier);

        // Deduct the cost of the carrier from the player's credits.
        player.credits -= cost;

        // Update the DB.
        if (writeToDB) {
            await this.gameRepo.bulkWrite([
                await this._getDeductPlayerCreditsDBWrite(game, player, cost),
                {
                    updateOne: {
                        filter: {
                            _id: game._id,
                            'galaxy.stars._id': star._id
                        },
                        update: {
                            'galaxy.stars.$.shipsActual': star.shipsActual,
                            'galaxy.stars.$.ships': star.ships
                        }
                    }
                },
                {
                    updateOne: {
                        filter: {
                            _id: game._id
                        },
                        update: {
                            $push: {
                                'galaxy.carriers': carrier
                            }
                        }
                    }
                }
            ]);
        }

        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementCarriersBuilt(player.userId);
        }

        return {
            carrier,
            starShips: star.ships || 0
        };
    }

    _calculateUpgradeInfrastructureCost(game: Game, star: Star, expenseConfigKey: GameInfrastructureExpenseMultiplier, economyType: InfrastructureType, calculateCostCallback) {
        if (this.starService.isDeadStar(star)) {
            return null;
        }

        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);

        // Calculate how much the upgrade will cost.
        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[expenseConfigKey];
        const terraformedResources = this.starService.calculateTerraformedResource(star.naturalResources[economyType], effectiveTechs.terraforming);

        const cost = calculateCostCallback(game, expenseConfig, star.infrastructure[economyType], terraformedResources);

        return cost;
    }

    async _upgradeInfrastructureUpdateDB(game: Game, player: Player, star: Star, cost: number, economyType: InfrastructureType) {
        let dbWrites: any[] = [
            await this._getDeductPlayerCreditsDBWrite(game, player, cost)
        ];

        switch (economyType) {
            case 'economy':
                dbWrites.push({
                    updateOne: {
                        filter: {
                            _id: game._id,
                            'galaxy.stars._id': star._id
                        },
                        update: {
                            $inc: {
                                'galaxy.stars.$.infrastructure.economy': 1
                            }
                        }
                    }
                });
                break;
            case 'industry':
                dbWrites.push({
                    updateOne: {
                        filter: {
                            _id: game._id,
                            'galaxy.stars._id': star._id
                        },
                        update: {
                            $inc: {
                                'galaxy.stars.$.infrastructure.industry': 1
                            }
                        }
                    }
                });
                break;
            case 'science':
                dbWrites.push({
                    updateOne: {
                        filter: {
                            _id: game._id,
                            'galaxy.stars._id': star._id
                        },
                        update: {
                            $inc: {
                                'galaxy.stars.$.infrastructure.science': 1
                            }
                        }
                    }
                });
                break;
        }

        // Update the DB.
        await this.gameRepo.bulkWrite(dbWrites);

        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementInfrastructureBuilt(economyType, player.userId);
        }
    }

    async _upgradeInfrastructure(game: Game, player: Player, starId: DBObjectId, expenseConfigKey: GameInfrastructureExpenseMultiplier, economyType: InfrastructureType, calculateCostCallback, writeToDB: boolean = true): Promise<InfrastructureUpgradeReport> {
        // Get the star.
        let star = this.starService.getById(game, starId);

        if (star.ownedByPlayerId == null || star.ownedByPlayerId.toString() !== player._id.toString()) {
            throw new ValidationError(`Cannot upgrade ${economyType}, the star is not owned by the current player.`);
        }

        if (this.starService.isDeadStar(star)) {
            throw new ValidationError('Cannot build infrastructure on a dead star.');
        }

        let cost = this._calculateUpgradeInfrastructureCost(game, star, expenseConfigKey, economyType, calculateCostCallback);

        if (writeToDB && player.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to upgrade.`);
        }

        // Upgrade infrastructure.
        star.infrastructure[economyType]!++;

        if (writeToDB) {
            player.credits -= cost;

            await this._upgradeInfrastructureUpdateDB(game, player, star, cost, economyType);
        }

        let nextCost = this._calculateUpgradeInfrastructureCost(game, star, expenseConfigKey, economyType, calculateCostCallback);

        // Return a report of what just went down.
        return {
            playerId: player._id,
            starId: star._id,
            starName: star.name,
            infrastructure: star.infrastructure[economyType]!,
            cost,
            nextCost
        };
    }

    async upgradeEconomy(game: Game, player: Player, starId: DBObjectId, writeToDB: boolean = true) {
        return await this._upgradeInfrastructure(game, player, starId, game.settings.player.developmentCost.economy, 'economy', this.calculateEconomyCost.bind(this), writeToDB);
    }

    async upgradeIndustry(game: Game, player: Player, starId: DBObjectId, writeToDB: boolean = true) {
        let report = await this._upgradeInfrastructure(game, player, starId, game.settings.player.developmentCost.industry, 'industry', this.calculateIndustryCost.bind(this), writeToDB);

        // Append the new manufacturing speed to the report.
        let star = this.starService.getById(game, starId);
        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);

        report.manufacturing = this.starService.calculateStarShipsByTicks(effectiveTechs.manufacturing, report.infrastructure, 1, game.settings.galaxy.productionTicks);

        return report;
    }

    async upgradeScience(game: Game, player: Player, starId: DBObjectId, writeToDB: boolean = true) {
        let report = await this._upgradeInfrastructure(game, player, starId, game.settings.player.developmentCost.science, 'science', this.calculateScienceCost.bind(this), writeToDB);

        report.currentResearchTicksEta = this.researchService.calculateCurrentResearchETAInTicks(game, player);
        report.nextResearchTicksEta = this.researchService.calculateNextResearchETAInTicks(game, player);

        return report;
    }

    _getStarsWithNextUpgradeCost(game: Game, player: Player, infrastructureType: InfrastructureType, includeIgnored: boolean = true) {
        let expenseConfig: number;
        let calculateCostFunction;
        let upgradeFunction;

        switch (infrastructureType) {
            case 'economy':
                calculateCostFunction = this.calculateEconomyCost.bind(this);
                upgradeFunction = this.upgradeEconomy.bind(this);
                expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.economy];
                break;
            case 'industry':
                calculateCostFunction = this.calculateIndustryCost.bind(this);
                upgradeFunction = this.upgradeIndustry.bind(this);
                expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.industry];
                break;
            case 'science':
                calculateCostFunction = this.calculateScienceCost.bind(this);
                upgradeFunction = this.upgradeScience.bind(this);
                expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.science];
                break;
        }

        if (!calculateCostFunction) {
            throw new ValidationError(`Unknown infrastructure type ${infrastructureType}`)
        }

        // Get all of the player stars and what the next upgrade cost will be.
        return this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id)
            .filter(s => {
                if (this.starService.isDeadStar(s)) {
                    return false;
                }

                if (includeIgnored) {
                    return true;
                }

                return !s.ignoreBulkUpgrade![infrastructureType];
            })
            .map(s => {
                const effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, s);
                const terraformedResources = this.starService.calculateTerraformedResource(s.naturalResources[infrastructureType], effectiveTechs.terraforming);

                return {
                    star: s,
                    terraformedResources,
                    infrastructureCost: calculateCostFunction(game, expenseConfig, s.infrastructure[infrastructureType], terraformedResources),
                    upgrade: upgradeFunction
                }
            });
    }

    async upgradeBulk(game: Game, player: Player, upgradeStrategy: string, infrastructureType: InfrastructureType, amount: number, writeToDB: boolean = true) {
        if (!amount || amount <= 0) {
            throw new ValidationError(`Invalid upgrade amount given`);
        }

        const upgradeSummary = await this.generateUpgradeBulkReport(game, player, upgradeStrategy, infrastructureType, amount);

        // Check that the amount the player wants to spend isn't more than the amount he has
        if (player.credits < upgradeSummary.cost) {
            throw new ValidationError(`The player does not own enough credits to afford to bulk upgrade.`);
        }

        // Double check that the bulk upgrade report actually upgraded something.
        if (upgradeSummary.cost <= 0) {
            return upgradeSummary;
        }

        if (writeToDB) {
            // Generate the DB writes for all the stars to upgrade, including deducting the credits
            // for the player and also updating the player's achievement statistics.
            let dbWrites: any[] = [
                await this._getDeductPlayerCreditsDBWrite(game, player, upgradeSummary.cost)
            ];

            for (let star of upgradeSummary.stars) {
                switch (infrastructureType) {
                    case 'economy':
                        dbWrites.push({
                            updateOne: {
                                filter: {
                                    _id: game._id,
                                    'galaxy.stars._id': star.starId
                                },
                                update: {
                                    $set: {
                                        'galaxy.stars.$.infrastructure.economy': star.infrastructure
                                    }
                                }
                            }
                        });
                        break;
                    case 'industry':
                        dbWrites.push({
                            updateOne: {
                                filter: {
                                    _id: game._id,
                                    'galaxy.stars._id': star.starId
                                },
                                update: {
                                    $set: {
                                        'galaxy.stars.$.infrastructure.industry': star.infrastructure
                                    }
                                }
                            }
                        });
                        break;
                    case 'science':
                        dbWrites.push({
                            updateOne: {
                                filter: {
                                    _id: game._id,
                                    'galaxy.stars._id': star.starId
                                },
                                update: {
                                    $set: {
                                        'galaxy.stars.$.infrastructure.science': star.infrastructure
                                    }
                                }
                            }
                        });
                        break;
                }
            }

            // Update the DB.
            await this.gameRepo.bulkWrite(dbWrites);
        }

        // Check for AI control.
        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementInfrastructureBuilt(infrastructureType, player.userId, upgradeSummary.upgraded);
        }

        player.credits -= upgradeSummary.cost;

        this.emit(StarUpgradeServiceEvents.onPlayerInfrastructureBulkUpgraded, {
            gameId: game._id,
            gameTick: game.state.tick,
            player,
            upgradeSummary
        });

        if (infrastructureType === 'science') {
            upgradeSummary.currentResearchTicksEta = this.researchService.calculateCurrentResearchETAInTicks(game, player);
            upgradeSummary.nextResearchTicksEta = this.researchService.calculateNextResearchETAInTicks(game, player);
        }

        return upgradeSummary;
    }

    async generateUpgradeBulkReport(game: Game, player: Player, upgradeStrategy: string, infrastructureType: InfrastructureType, amount: number): Promise<BulkUpgradeReport> {
        if (!amount || amount <= 0) {
            throw new ValidationError(`Invalid upgrade amount given`);
        }

        // Get all of the player stars and what the next upgrade cost will be.
        if (upgradeStrategy === 'totalCredits') {
            return await this.generateUpgradeBulkReportTotalCredits(game, player, infrastructureType, amount)
        } else if (upgradeStrategy === 'infrastructureAmount') {
            return await this.generateUpgradeBulkReportInfrastructureAmount(game, player, infrastructureType, amount)
        } else if (upgradeStrategy === 'belowPrice') {
            return await this.generateUpgradeBulkReportBelowPrice(game, player, infrastructureType, amount)
        }

        throw new Error(`Unsupported upgrade strategy: ${upgradeStrategy}`);
    }

    _createUpgradeQueue(size: number) {
        return new Heap({
            comparBefore: (s1, s2) => s1.infrastructureCost < s2.infrastructureCost,
            compar: (s1, s2) => s1.infrastructureCost - s2.infrastructureCost,
            freeSpace: false,
            size
        })
    }

    async _upgradeStarAndSummary(game: Game, player: Player, upgradeSummary: BulkUpgradeReport, upgradeStar, infrastructureType: InfrastructureType) {
        let summaryStar = upgradeSummary.stars.find(x => x.starId.toString() === upgradeStar.star._id.toString());

        if (!summaryStar) {
            summaryStar = {
                starId: upgradeStar.star._id,
                starName: upgradeStar.star.name,
                naturalResources: upgradeStar.star.naturalResources,
                infrastructureCurrent: upgradeStar.star.infrastructure[infrastructureType],
                infrastructureCostTotal: 0,
                infrastructure: infrastructureType
            }

            upgradeSummary.stars.push(summaryStar);
        }

        const upgradeReport = await upgradeStar.upgrade(game, player, upgradeStar.star._id, false);

        upgradeSummary.upgraded++;
        upgradeSummary.cost += upgradeReport.cost;
        summaryStar.infrastructureCostTotal += upgradeReport.cost;

        // Update the stars next infrastructure cost so next time
        // we loop we will have the most up to date info.
        upgradeStar.infrastructureCost = upgradeReport.nextCost;
        summaryStar.infrastructureCost = upgradeReport.nextCost;

        if (upgradeReport.manufacturing != null) {
            summaryStar.manufacturing = upgradeReport.manufacturing;
        }

        summaryStar.infrastructure = upgradeStar.star.infrastructure[infrastructureType];

        return upgradeReport.cost;
    }

    async generateUpgradeBulkReportBelowPrice(game: Game, player: Player, infrastructureType: InfrastructureType, amount: number): Promise<BulkUpgradeReport> {
        const ignoredCount = this.starService.listStarsOwnedByPlayerBulkIgnored(game.galaxy.stars, player._id, infrastructureType).length;
        const stars = this._getStarsWithNextUpgradeCost(game, player, infrastructureType, false);

        const upgradeSummary = {
            budget: amount,
            stars: [],
            cost: 0,
            upgraded: 0,
            infrastructureType,
            ignoredCount
        };

        const affordableStars = stars.filter(s => s.infrastructureCost <= amount);
        const upgradeQueue = this._createUpgradeQueue(stars.length);
        affordableStars.forEach(star => {
            upgradeQueue.insert(star)
        });

        // Make sure we are not spending enormous amounts of time on this
        while (upgradeSummary.upgraded <= 200) {
            const nextStar = upgradeQueue.dequeue();
            if (!nextStar) {
                break;
            }

            await this._upgradeStarAndSummary(game, player, upgradeSummary, nextStar, infrastructureType);

            if (nextStar.infrastructureCost <= amount) {
                upgradeQueue.insert(nextStar);
            }
        }

        return upgradeSummary
    }

    async generateUpgradeBulkReportInfrastructureAmount(game: Game, player: Player, infrastructureType: InfrastructureType, amount: number): Promise<BulkUpgradeReport> {
        //Enforce some max size constraint
        amount = Math.min(amount, 200);
        const ignoredCount = this.starService.listStarsOwnedByPlayerBulkIgnored(game.galaxy.stars, player._id, infrastructureType).length;
        const stars = this._getStarsWithNextUpgradeCost(game, player, infrastructureType, false);

        const upgradeSummary = {
            budget: amount,
            stars: [],
            cost: 0,
            upgraded: 0,
            infrastructureType,
            ignoredCount
        };

        const upgradeQueue = this._createUpgradeQueue(stars.length);
        stars.forEach(star => {
            upgradeQueue.insert(star);
        });

        for (let i = 0; i < amount; i++) {
            let upgradeStar = upgradeQueue.dequeue();

            // If no stars can be upgraded then break out here.
            if (!upgradeStar) {
                break;
            }

            await this._upgradeStarAndSummary(game, player, upgradeSummary, upgradeStar, infrastructureType);

            upgradeQueue.insert(upgradeStar)
        }

        return upgradeSummary;
    }

    async generateUpgradeBulkReportTotalCredits(game: Game, player: Player, infrastructureType: InfrastructureType, budget: number): Promise<BulkUpgradeReport> {
        let ignoredCount = this.starService.listStarsOwnedByPlayerBulkIgnored(game.galaxy.stars, player._id, infrastructureType).length;
        let stars = this._getStarsWithNextUpgradeCost(game, player, infrastructureType, false);

        budget = Math.min(budget, player.credits + 10000); // Prevent players from generating reports for stupid amounts of credits

        let upgradeSummary = {
            budget,
            stars: [],
            cost: 0,
            upgraded: 0,
            infrastructureType,
            ignoredCount
        };

        const upgradeStars = this._createUpgradeQueue(stars.length);
        stars.forEach(star => {
            upgradeStars.insert(star)
        });

        while (budget > 0) {
            // Get the next star that can be upgraded, cheapest first.
            let upgradeStar = upgradeStars.dequeue();

            // If no stars can be upgraded then break out here.
            if (!upgradeStar || upgradeStar.infrastructureCost > budget) {
                break;
            }

            budget -= await this._upgradeStarAndSummary(game, player, upgradeSummary, upgradeStar, infrastructureType);
            upgradeStars.insert(upgradeStar)
        }

        return upgradeSummary;
    }



    calculateAverageTerraformedResources(terraformedResources: TerraformedResources){
        return Math.floor((terraformedResources.economy + terraformedResources.industry + terraformedResources.science) / 3);
    }

    calculateWarpGateCost(game: Game, expenseConfig: number, terraformedResources: number) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.warpGate, expenseConfig, 0, terraformedResources);
    }

    calculateEconomyCost(game: Game, expenseConfig: number, current: number, terraformedResources: number) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.economy, expenseConfig, current, terraformedResources);
    }

    calculateIndustryCost(game: Game, expenseConfig: number, current: number, terraformedResources: number) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.industry, expenseConfig, current, terraformedResources);
    }

    calculateScienceCost(game: Game, expenseConfig: number, current: number, terraformedResources: number) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.science, expenseConfig, current, terraformedResources);
    }

    _calculateInfrastructureCost(baseCost: number, expenseConfig: number, current: number, terraformedResources: number) {
        return Math.max(1, Math.floor((baseCost * expenseConfig * (current + 1)) / (terraformedResources / 100)));
    }

    calculateCarrierCost(game: Game, expenseConfig: number) {
        return (expenseConfig * game.constants.star.infrastructureCostMultipliers.carrier) + 5;
    }

    setUpgradeCosts(game: Game, star: Star, terraformedResources: TerraformedResources) {
        const economyExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.economy];
        const industryExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.industry];
        const scienceExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.science];
        const warpGateExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.warpgateCost];
        const carrierExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.carrierCost];

        // Calculate upgrade costs for the star.
        const upgradeCosts: InfrastructureUpgradeCosts = {
            economy: null,
            industry: null,
            science: null,
            warpGate: null,
            carriers: null
        };

        if (!this.starService.isDeadStar(star)) {
            let averageTerraformedResources = this.calculateAverageTerraformedResources(terraformedResources);

            upgradeCosts.economy = this.calculateEconomyCost(game, economyExpenseConfig, star.infrastructure.economy!, terraformedResources.economy);
            upgradeCosts.industry = this.calculateIndustryCost(game, industryExpenseConfig, star.infrastructure.industry!, terraformedResources.industry);
            upgradeCosts.science = this.calculateScienceCost(game, scienceExpenseConfig, star.infrastructure.science!, terraformedResources.science);
            upgradeCosts.warpGate = this.calculateWarpGateCost(game, warpGateExpenseConfig, averageTerraformedResources); // Note: Warpgates in split resources use the average of all infrastructure.
            upgradeCosts.carriers = this.calculateCarrierCost(game, carrierExpenseConfig);
        }

        // TODO: Do not assign to star object?
        star.upgradeCosts = upgradeCosts;

        return upgradeCosts;
    }

    async _getDeductPlayerCreditsDBWrite(game: Game, player: Player, cost: number) {
        return await this.playerCreditsService.addCredits(game, player, -cost, false);
    }

    _getSetStarWarpGateDBWrite(game: Game, star: Star, warpGate: boolean) {
        return {
            updateOne: {
                filter: {
                    _id: game._id,
                    'galaxy.stars._id': star._id
                },
                update: {
                    'galaxy.stars.$.warpGate': warpGate
                }
            }
        }
    }
};
