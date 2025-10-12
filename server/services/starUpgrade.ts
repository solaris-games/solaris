import {Carrier} from "./types/Carrier";

const EventEmitter = require('events');
import {DBObjectId} from './types/DBObjectId';
import { ValidationError } from "solaris-common";
import Repository from './repository';
import {
    BulkUpgradeReport,
    InfrastructureUpgradeCosts,
    InfrastructureUpgradeReport,
    StarUpgradeReport
} from './types/InfrastructureUpgrade';
import {Game} from './types/Game';
import {Player} from './types/Player';
import {InfrastructureType, Star, TerraformedResources} from './types/Star';
import UserAchievementService from './userAchievement';
import CarrierService from './carrier';
import { GameTypeService } from 'solaris-common'
import ResearchService from './research';
import StarService from './star';
import { TechnologyService } from 'solaris-common';
import PlayerCreditsService from './playerCredits';
import ShipService from "./ship";
import StatisticsService from "./statistics";
import {GameInfrastructureExpenseMultiplier} from "solaris-common";

const Heap = require('qheap');

type UpgradeStar = {
    readonly star: Star;
    readonly infrastructureAmount: number;
    readonly infrastructureCost: number;
    readonly terraformedResources: number;
}

type UpgradeStarContext = {
    readonly stars: UpgradeStar[];
    readonly upgradeStar: (star: UpgradeStar) => UpgradeStar;
}

export const StarUpgradeServiceEvents = {
    onPlayerInfrastructureBulkUpgraded: 'onPlayerInfrastructureBulkUpgraded'
};

export default class StarUpgradeService extends EventEmitter {
    gameRepo: Repository<Game>;
    starService: StarService;
    carrierService: CarrierService;
    achievementService: UserAchievementService;
    researchService: ResearchService;
    technologyService: TechnologyService;
    playerCreditsService: PlayerCreditsService;
    gameTypeService: GameTypeService;
    shipService: ShipService;
    statisticsService: StatisticsService;

    constructor(
        gameRepo: Repository<Game>,
        starService: StarService,
        carrierService: CarrierService,
        achievementService: UserAchievementService,
        researchService: ResearchService,
        technologyService: TechnologyService,
        playerCreditsService: PlayerCreditsService,
        gameTypeService: GameTypeService,
        shipService: ShipService,
        statisticsService: StatisticsService,
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
        this.shipService = shipService;
        this.statisticsService = statisticsService;
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
        const cost = this.calculateWarpGateCost(game, expenseConfig, averageTerraformedResources)!;

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
            await this.statisticsService.modifyStats(game._id, player._id, (stats) => {
                stats.infrastructure.warpGates += 1;
            });
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
            await this.statisticsService.modifyStats(game._id, player._id, (stats) => {
                stats.infrastructure.warpGatesDestroyed += 1;
            });
        }
    }

    async buildCarrier(game: Game, player: Player, starId: DBObjectId, ships: number, writeToDB: boolean = true): Promise<{
        carrier: Carrier,
        starShips: number
    }> {
        ships = ships || 1;

        if (ships < 1) {
            throw new ValidationError(`Carrier must have 1 or more ships.`);
        }

        if (ships !== parseInt(ships.toString())) {
            throw new ValidationError(`Carrier ships must be a whole number.`);
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

        // check if player has allowed carrier count

        const carrierCount = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id).length;
        const carrierLimit = this.carrierService.getCarrierLimit(game, player);

        if (!player.defeated && carrierCount + 1 > carrierLimit) {
            throw new ValidationError(`The player has reached the carrier limit: ${carrierLimit}.`);
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
            await this.statisticsService.modifyStats(game._id, player._id, (stats) => {
                stats.infrastructure.carriers += 1;
            });
        }

        carrier.effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(game, carrier, true);

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
            await this.statisticsService.modifyStats(game._id, player._id, (stats) => {
                stats.infrastructure[economyType] += 1;
            });
        }
    }

    async _upgradeInfrastructure(game: Game, player: Player, starId: DBObjectId, expenseConfigKey: GameInfrastructureExpenseMultiplier, economyType: InfrastructureType, calculateCostCallback, writeToDB: boolean = true): Promise<InfrastructureUpgradeReport> {
        if (expenseConfigKey === 'none') {
            throw new ValidationError(`Cannot upgrade ${economyType} as it has been disabled.`);
        }

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

        report.manufacturing = this.shipService.calculateStarShipsByTicks(effectiveTechs.manufacturing, report.infrastructure, 1, game.settings.galaxy.productionTicks);

        return report;
    }

    async upgradeScience(game: Game, player: Player, starId: DBObjectId, writeToDB: boolean = true) {
        let report = await this._upgradeInfrastructure(game, player, starId, game.settings.player.developmentCost.science, 'science', this.calculateScienceCost.bind(this), writeToDB);

        report.currentResearchTicksEta = this.researchService.calculateCurrentResearchETAInTicks(game, player);
        report.nextResearchTicksEta = this.researchService.calculateNextResearchETAInTicks(game, player);

        return report;
    }

    _getStarsWithNextUpgradeCost(game: Game, player: Player, infrastructureType: InfrastructureType, includeIgnored: boolean = true): UpgradeStarContext {
        let expenseConfig: number | null;
        let calculateCostFunction: (game: Game, expenseConfig: number | null, current: number, terraformedResources: number) => null | number;

        switch (infrastructureType) {
            case 'economy':
                calculateCostFunction = this.calculateEconomyCost.bind(this);
                expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.economy] || null;
                break;
            case 'industry':
                calculateCostFunction = this.calculateIndustryCost.bind(this);
                expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.industry] || null;
                break;
            case 'science':
                calculateCostFunction = this.calculateScienceCost.bind(this);
                expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.science] || null;
                break;
        }

        if (!calculateCostFunction) {
            throw new ValidationError(`Unknown infrastructure type ${infrastructureType}`)
        }

        const upgradeStar = (star: UpgradeStar) => {
            const newInfra = star.infrastructureAmount + 1;
            const infrastructureCost = calculateCostFunction(game, expenseConfig, newInfra, star.terraformedResources)!;

            return {
                star: star.star,
                infrastructureAmount: newInfra,
                infrastructureCost,
                terraformedResources: star.terraformedResources
            }
        }

        const mapStarToUpgrade = (s: Star): UpgradeStar => {
            const effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, s);
            const terraformedResources = this.starService.calculateTerraformedResource(s.naturalResources[infrastructureType], effectiveTechs.terraforming);
            const infrastructureCost = calculateCostFunction(game, expenseConfig, s.infrastructure[infrastructureType]!, terraformedResources)!;

            return {
                star: s,
                infrastructureCost,
                infrastructureAmount: s.infrastructure[infrastructureType]!,
                terraformedResources
            };
        }

        const upgradeableStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id)
            .filter(s => {
                if (this.starService.isDeadStar(s)) {
                    return false;
                }

                if (includeIgnored) {
                    return true;
                }

                return !s.ignoreBulkUpgrade![infrastructureType];
            }).map(mapStarToUpgrade);

        return {
            stars: upgradeableStars,
            upgradeStar
        }
    }

    async upgradeBulk(game: Game, player: Player, upgradeStrategy: string, infrastructureType: InfrastructureType, amount: number, writeToDB: boolean = true) {
        if (!amount || amount <= 0) {
            throw new ValidationError(`Invalid upgrade amount given`);
        }

        if (game.settings.player.developmentCost[infrastructureType] === 'none') {
            throw new ValidationError(`Cannot upgrade ${infrastructureType} as it has been disabled.`);
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

        // make sure the game model is up to date for further calculations. This is ok since the game model is lean and these changes will not be committed to the database.
        await this.executeBulkUpgradeReport(game, player, upgradeSummary);

        // Check for AI control.
        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.statisticsService.modifyStats(game._id, player._id, (stats) => {
                stats.infrastructure[infrastructureType] += upgradeSummary.upgraded;
            });
        }

        if (infrastructureType === 'science') {
            upgradeSummary.currentResearchTicksEta = this.researchService.calculateCurrentResearchETAInTicks(game, player);
            upgradeSummary.nextResearchTicksEta = this.researchService.calculateNextResearchETAInTicks(game, player);
        }

        return upgradeSummary;
    }

    // this does not write directly to db
    async executeBulkUpgradeReport(game: Game, player: Player, upgradeSummary: BulkUpgradeReport) {
        upgradeSummary.stars.forEach(starUpgrade => {
            const star = this.starService.getById(game, starUpgrade.starId);
            switch (upgradeSummary.infrastructureType) {
                case 'economy':
                    star.infrastructure.economy = starUpgrade.infrastructure;
                    break;
                case 'industry':
                    star.infrastructure.industry = starUpgrade.infrastructure;
                    break;
                case 'science':
                    star.infrastructure.science = starUpgrade.infrastructure;
                    break;
            }

            player.credits -= starUpgrade.infrastructureCostTotal;
        });

        // Check for AI control.
        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.statisticsService.modifyStats(game._id, player._id, (stats) => {
                stats.infrastructure[upgradeSummary.infrastructureType] += upgradeSummary.upgraded;
            });
        }

        this.emit(StarUpgradeServiceEvents.onPlayerInfrastructureBulkUpgraded, {
            gameId: game._id,
            gameTick: game.state.tick,
            player,
            upgradeSummary
        });
    }

    generateUpgradeBulkReport(game: Game, player: Player, upgradeStrategy: string, infrastructureType: InfrastructureType, amount: number): BulkUpgradeReport {
        if (!amount || amount <= 0) {
            throw new ValidationError(`Invalid upgrade amount given`);
        }

        if (game.settings.player.developmentCost[infrastructureType] === 'none') {
            throw new ValidationError(`Cannot upgrade ${infrastructureType} as it has been disabled.`);
        }

        // Get all of the player stars and what the next upgrade cost will be.
        if (upgradeStrategy === 'totalCredits') {
            return this.generateUpgradeBulkReportTotalCredits(game, player, infrastructureType, amount);
        } else if (upgradeStrategy === 'percentageOfCredits') {
            return this.generateUpgradeBulkReportPercentageOfCredits(game, player, infrastructureType, amount);
        } else if (upgradeStrategy === 'infrastructureAmount') {
            return this.generateUpgradeBulkReportInfrastructureAmount(game, player, infrastructureType, amount);
        } else if (upgradeStrategy === 'belowPrice') {
            return this.generateUpgradeBulkReportBelowPrice(game, player, infrastructureType, amount);
        }

        throw new Error(`Unsupported upgrade strategy: ${upgradeStrategy}`);
    }

    _createUpgradeQueue(size: number) {
        return new Heap({
            comparBefore: (s1: UpgradeStar, s2: UpgradeStar) => s1.infrastructureCost < s2.infrastructureCost,
            compar: (s1: UpgradeStar, s2: UpgradeStar) => s1.infrastructureCost - s2.infrastructureCost,
            freeSpace: false,
            size
        })
    }

    _upgradeStarAndSummary(game: Game, player: Player, upgradeContext: UpgradeStarContext, upgradeSummary: BulkUpgradeReport, starToUpgrade: UpgradeStar, infrastructureType: InfrastructureType): UpgradeStar {
        let summaryStar: StarUpgradeReport | undefined = upgradeSummary.stars.find(x => x.starId.toString() === starToUpgrade.star._id.toString());

        if (!summaryStar) {
            const infrastructureCurrent = starToUpgrade.star.infrastructure[infrastructureType]!;

            summaryStar = {
                starId: starToUpgrade.star._id,
                starName: starToUpgrade.star.name,
                naturalResources: starToUpgrade.star.naturalResources,
                infrastructureCurrent,
                nextInfrastructureCost: 0,
                infrastructureCostTotal: 0,
                infrastructure: starToUpgrade.infrastructureAmount,
            }

            upgradeSummary.stars.push(summaryStar);
        }

        const upgradedStar = upgradeContext.upgradeStar(starToUpgrade);

        upgradeSummary.upgraded++;
        upgradeSummary.cost += starToUpgrade.infrastructureCost;
        summaryStar.infrastructureCostTotal += starToUpgrade.infrastructureCost;
        summaryStar.infrastructure = upgradedStar.infrastructureAmount;

        summaryStar.nextInfrastructureCost = this.calculateNextInfrastructureUpgradeCost(game, upgradedStar, infrastructureType, summaryStar.infrastructure);

        if (infrastructureType === 'industry') {
            summaryStar.manufacturing = this.shipService.calculateManufacturingForIndustry(game, starToUpgrade.star, summaryStar.infrastructure);
        }

        return upgradedStar;
    }

    private calculateNextInfrastructureUpgradeCost(game: Game, upgradeStar: UpgradeStar, infrastructureType: InfrastructureType, currentInfrastructureCount: number): number {
        switch (infrastructureType) {
            case 'economy': {
                return this.calculateEconomyCost(game, game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.economy], currentInfrastructureCount, upgradeStar.terraformedResources)!;
            }
            case 'industry': {
                return this.calculateIndustryCost(game, game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.industry], currentInfrastructureCount, upgradeStar.terraformedResources)!;
            }
            case 'science': {
                return this.calculateScienceCost(game, game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.science], currentInfrastructureCount, upgradeStar.terraformedResources)!;
            }
            default:
                throw new ValidationError(`Unknown infrastructureType: ${infrastructureType}`);
        }
    }

    generateUpgradeBulkReportBelowPrice(game: Game, player: Player, infrastructureType: InfrastructureType, amount: number): BulkUpgradeReport {
        const ignoredCount = this.starService.listStarsOwnedByPlayerBulkIgnored(game.galaxy.stars, player._id, infrastructureType).length;
        const upgradeContext = this._getStarsWithNextUpgradeCost(game, player, infrastructureType, false);

        const upgradeSummary: BulkUpgradeReport = {
            budget: amount,
            stars: [],
            cost: 0,
            upgraded: 0,
            infrastructureType,
            ignoredCount
        };

        const affordableStars = upgradeContext.stars.filter(s => s.infrastructureCost <= amount);
        const upgradeQueue = this._createUpgradeQueue(upgradeContext.stars.length);
        affordableStars.forEach(star => {
            upgradeQueue.insert(star)
        });

        // Make sure we are not spending enormous amounts of time on this
        while (upgradeSummary.upgraded <= 200) {
            const nextStar: UpgradeStar = upgradeQueue.dequeue();
            if (!nextStar) {
                break;
            }

            const newStar = this._upgradeStarAndSummary(game, player, upgradeContext, upgradeSummary, nextStar, infrastructureType);

            if (newStar.infrastructureCost <= amount) {
                upgradeQueue.insert(newStar);
            }
        }

        return upgradeSummary
    }

    generateUpgradeBulkReportInfrastructureAmount(game: Game, player: Player, infrastructureType: InfrastructureType, amount: number): BulkUpgradeReport {
        //Enforce some max size constraint
        amount = Math.min(amount, 200);
        const ignoredCount = this.starService.listStarsOwnedByPlayerBulkIgnored(game.galaxy.stars, player._id, infrastructureType).length;
        const upgradeContext = this._getStarsWithNextUpgradeCost(game, player, infrastructureType, false);

        const upgradeSummary: BulkUpgradeReport = {
            budget: amount,
            stars: [],
            cost: 0,
            upgraded: 0,
            infrastructureType,
            ignoredCount
        };

        const upgradeQueue = this._createUpgradeQueue(upgradeContext.stars.length);
        upgradeContext.stars.forEach(star => {
            upgradeQueue.insert(star);
        });

        for (let i = 0; i < amount; i++) {
            const upgradeStar = upgradeQueue.dequeue();

            // If no stars can be upgraded then break out here.
            if (!upgradeStar) {
                break;
            }

            const newStar = this._upgradeStarAndSummary(game, player, upgradeContext, upgradeSummary, upgradeStar, infrastructureType);

            upgradeQueue.insert(newStar)
        }

        return upgradeSummary;
    }

    generateUpgradeBulkReportTotalCredits(game: Game, player: Player, infrastructureType: InfrastructureType, budget: number): BulkUpgradeReport {
        const ignoredCount = this.starService.listStarsOwnedByPlayerBulkIgnored(game.galaxy.stars, player._id, infrastructureType).length;
        const upgradeContext = this._getStarsWithNextUpgradeCost(game, player, infrastructureType, false);

        budget = Math.min(budget, player.credits + 10000); // Prevent players from generating reports for stupid amounts of credits

        let upgradeSummary = {
            budget,
            stars: [],
            cost: 0,
            upgraded: 0,
            infrastructureType,
            ignoredCount
        };

        const upgradeQueue = this._createUpgradeQueue(upgradeContext.stars.length);
        upgradeContext.stars.forEach(star => {
            upgradeQueue.insert(star);
        });

        while (budget > 0) {
            // Get the next star that can be upgraded, cheapest first.
            const upgradeStar: UpgradeStar | null = upgradeQueue.dequeue();

            // If no stars can be upgraded then break out here.
            if (!upgradeStar || upgradeStar.infrastructureCost > budget) {
                break;
            }

            const newStar = this._upgradeStarAndSummary(game, player, upgradeContext, upgradeSummary, upgradeStar, infrastructureType);
            budget -= upgradeStar.infrastructureCost;

            upgradeQueue.insert(newStar);
        }

        return upgradeSummary;
    }

    generateUpgradeBulkReportPercentageOfCredits(game: Game, player: Player, infrastructureType: InfrastructureType, percentage: number): BulkUpgradeReport {
        percentage = Math.min(100, Math.max(0, percentage));
        const budget = Math.ceil(player.credits * percentage / 100);
        return this.generateUpgradeBulkReportTotalCredits(game, player, infrastructureType, budget);
    }

    calculateAverageTerraformedResources(terraformedResources: TerraformedResources) {
        return Math.floor((terraformedResources.economy + terraformedResources.industry + terraformedResources.science) / 3);
    }

    calculateWarpGateCost(game: Game, expenseConfig: number, terraformedResources: number) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.warpGate, expenseConfig, 0, terraformedResources);
    }

    calculateEconomyCost(game: Game, expenseConfig: number | null, current: number, terraformedResources: number) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.economy, expenseConfig, current, terraformedResources);
    }

    calculateIndustryCost(game: Game, expenseConfig: number | null, current: number, terraformedResources: number) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.industry, expenseConfig, current, terraformedResources);
    }

    calculateScienceCost(game: Game, expenseConfig: number | null, current: number, terraformedResources: number) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.science, expenseConfig, current, terraformedResources);
    }

    _calculateInfrastructureCost(baseCost: number, expenseConfig: number | null, current: number, terraformedResources: number) {
        if (expenseConfig == null) {
            return null;
        }

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
