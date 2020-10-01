const EventEmitter = require('events');
const ValidationError = require('../errors/validation');

module.exports = class StarUpgradeService extends EventEmitter {

    constructor(starService, carrierService, userService, researchService, technologyService) {
        super();
        
        this.starService = starService;
        this.carrierService = carrierService;
        this.userService = userService;
        this.researchService = researchService;
        this.technologyService = technologyService;
    }

    async buildWarpGate(game, player, starId) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the player.
        if (star.ownedByPlayerId == null || star.ownedByPlayerId.toString() !== player.id) {
            throw new ValidationError(`Cannot upgrade, the star is not owned by the current player.`);
        }

        if (star.warpGate) {
            throw new ValidationError(`The star already has a warp gate.`);
        }

        if (game.settings.specialGalaxy.warpgateCost === 'none') {
            throw new ValidationError('The game settings has disabled the building of warp gates.');
        }

        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);

        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.warpgateCost];
        const terraformedResources = this.starService.calculateTerraformedResources(star.naturalResources, effectiveTechs.terraforming);
        const cost = this.calculateWarpGateCost(game, expenseConfig, terraformedResources);

        if (player.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to upgrade.`);
        }

        star.warpGate = true;
        player.credits -= cost;

        await game.save();

        let user = await this.userService.getById(player.userId);
        user.achievements.infrastructure.warpGates++;
        await user.save();

        this.emit('onPlayerWarpGateBuilt', {
            game,
            player,
            star
        });

        return {
            starId: star._id,
            cost
        };
    }

    async destroyWarpGate(game, player, starId) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the player
        if (star.ownedByPlayerId == null || star.ownedByPlayerId.toString() !== player.id) {
            throw new ValidationError(`Cannot destroy warp gate, the star is not owned by the current player.`);
        }

        if (!star.warpGate) {
            throw new ValidationError(`The star does not have a warp gate to destroy.`);
        }

        star.warpGate = false;

        await game.save();

        let user = await this.userService.getById(player.userId);
        user.achievements.infrastructure.warpGatesDestroyed++;
        await user.save();

        this.emit('onPlayerWarpGateDestroyed', {
            game,
            player,
            star
        });
    }

    async buildCarrier(game, player, starId, ships) {
        ships = ships || 1;

        if (ships < 1) {
            throw new ValidationError(`Carrier must have 1 or more ships.`);
        }

        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the player.
        if (star.ownedByPlayerId == null || star.ownedByPlayerId.toString() !== player.id) {
            throw new ValidationError(`Cannot build carrier, the star is not owned by the current player.`);
        }

        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.carrierCost];
        const cost = this.calculateCarrierCost(game, expenseConfig);

        if (player.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to build a carrier.`);
        }

        if (Math.floor(star.garrisonActual) < ships) {
            throw new ValidationError(`The star does not have enough ships garrisoned (${ships}) to build the carrier.`);
        }

        // Create a carrier at the star.
        let carrier = this.carrierService.createAtStar(star, game.galaxy.carriers, ships);

        game.galaxy.carriers.push(carrier);

        // Deduct the cost of the carrier from the player's credits.
        player.credits -= cost;

        await game.save();

        let user = await this.userService.getById(player.userId);
        user.achievements.infrastructure.carriers++;
        await user.save();

        this.emit('onPlayerCarrierBuilt', {
            game,
            player,
            star,
            carrier
        });

        return carrier;
    }

    async _upgradeInfrastructure(game, player, starId, expenseConfigKey, economyType, calculateCostCallback) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        if (star.ownedByPlayerId == null || star.ownedByPlayerId.toString() !== player.id) {
            throw new ValidationError(`Cannot upgrade ${economyType}, the star is not owned by the current player.`);
        }

        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);

        // Calculate how much the upgrade will cost.
        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[expenseConfigKey];
        const terraformedResources = this.starService.calculateTerraformedResources(star.naturalResources, effectiveTechs.terraforming);
        const cost = calculateCostCallback(game, expenseConfig, star.infrastructure[economyType], terraformedResources);

        if (player.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to upgrade.`);
        }

        // Upgrade infrastructure.
        star.infrastructure[economyType]++;
        player.credits -= cost;

        await game.save();

        let user = await this.userService.getById(player.userId);
        user.achievements.infrastructure[economyType]++;
        await user.save();

        let nextCost = calculateCostCallback(game, expenseConfig, star.infrastructure[economyType], terraformedResources);

        // Return a report of what just went down.
        return {
            playerId: player._id,
            starId: star._id,
            infrastructure: star.infrastructure[economyType],
            cost,
            nextCost
        };
    }

    async upgradeEconomy(game, player, starId) {
        return await this._upgradeInfrastructure(game, player, starId, game.settings.player.developmentCost.economy, 'economy', this.calculateEconomyCost.bind(this));
    }

    async upgradeIndustry(game, player, starId) {
        let report = await this._upgradeInfrastructure(game, player, starId, game.settings.player.developmentCost.industry, 'industry', this.calculateIndustryCost.bind(this));

        // Append the new manufacturing speed to the report.
        let star = this.starService.getById(game, starId);
        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);

        report.manufacturing = this.starService.calculateStarShipsByTicks(effectiveTechs.manufacturing, report.infrastructure);

        return report;
    }

    async upgradeScience(game, player, starId) {
        let report = await this._upgradeInfrastructure(game, player, starId, game.settings.player.developmentCost.science, 'science', this.calculateScienceCost.bind(this));

        report.currentResearchTicksEta = this.researchService.calculateCurrentResearchETAInTicks(game, player);

        return report;
    }

    async upgradeBulk(game, player, infrastructureType, amount) {
        let upgradeSummary = {
            stars: [],
            cost: 0,
            upgraded: 0,
            infrastructureType
        };

        let expenseConfig;
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
            throw new ValidationError(`Unknown infrastructure type ${infrastructure}`)
        }

        // Get all of the player stars and what the next upgrade cost will be.
        let stars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id)
            .map(s => {
                // NOTE: Do not need to do calculations for effective tech level here as it is unnecessary because
                // the resources will scale in the same way for all stars.
                let terraformedResources = this.starService.calculateTerraformedResources(s.naturalResources, player.research.terraforming.level)

                return {
                    star: s,
                    terraformedResources,
                    infrastructureCost: calculateCostFunction(game, expenseConfig, s.infrastructure[infrastructureType], terraformedResources)
                }
            });

        while (amount) {
            // Get the next star that can be upgraded, cheapest first.
            let upgradeStar = stars
                .filter(s => s.infrastructureCost <= amount)
                .sort((a, b) => a.infrastructureCost - b.infrastructureCost)[0];

            // If no stars can be upgraded then break out here.
            if (!upgradeStar) {
                break;
            }

            let upgradedCost = await upgradeFunction(game, player, upgradeStar.star._id);

            amount -= upgradedCost.cost;

            upgradeSummary.upgraded++;
            upgradeSummary.cost += upgradedCost.cost;

            // Update the stars next infrastructure cost so next time
            // we loop we will have the most up to date info.
            upgradeStar.infrastructureCost = upgradedCost.nextCost;

            // Add the star that we upgraded to the summary result.
            let summaryStar = upgradeSummary.stars.find(x => x.starId.equals(upgradeStar.star._id));

            if (!summaryStar) {
                summaryStar = {
                    starId: upgradeStar.star._id
                }

                upgradeSummary.stars.push(summaryStar);
            }

            summaryStar.infrastructure = upgradeStar.star.infrastructure[infrastructureType];
        }

        await game.save();

        this.emit('onPlayerInfrastructureBulkUpgraded', {
            game,
            player,
            upgradeSummary
        });

        return upgradeSummary;
    }

    calculateWarpGateCost(game, expenseConfig, terraformedResources) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.warpGate, expenseConfig, 0, terraformedResources);
    }

    calculateEconomyCost(game, expenseConfig, current, terraformedResources) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.economy, expenseConfig, current, terraformedResources);
    }

    calculateIndustryCost(game, expenseConfig, current, terraformedResources) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.industry, expenseConfig, current, terraformedResources);
    }

    calculateScienceCost(game, expenseConfig, current, terraformedResources) {
        return this._calculateInfrastructureCost(game.constants.star.infrastructureCostMultipliers.science, expenseConfig, current, terraformedResources);
    }

    _calculateInfrastructureCost(baseCost, expenseConfig, current, terraformedResources) {
        return Math.floor((baseCost * expenseConfig * (current + 1)) / (terraformedResources / 100));
    }

    calculateCarrierCost(game, expenseConfig) {
        return (expenseConfig * game.constants.star.infrastructureCostMultipliers.carrier) + 5;
    }

};
