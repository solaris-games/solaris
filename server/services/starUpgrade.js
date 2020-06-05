const ValidationError = require('../errors/validation');

module.exports = class StarUpgradeService {

    constructor(starService, carrierService, eventService) {
        this.starService = starService;
        this.carrierService = carrierService;
        this.eventService = eventService;
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

        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.buildWarpgates];
        const terraformedResources = this.starService.calculateTerraformedResources(star.naturalResources, player.research.terraforming.level);
        const cost = this.calculateWarpGateCost(game, expenseConfig, terraformedResources);

        if (player.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to upgrade.`);
        }

        star.warpGate = true;
        player.credits -= cost;

        await game.save();

        await this.eventService.createWarpGateBuiltEvent(game, player, star);
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

        await this.eventService.createWarpGateDestroyedEvent(game, player, star);
    }

    async buildCarrier(game, player, starId) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the player.
        if (star.ownedByPlayerId == null || star.ownedByPlayerId.toString() !== player.id) {
            throw new ValidationError(`Cannot build carrier, the star is not owned by the current player.`);
        }

        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.buildCarriers];
        const cost = this.calculateCarrierCost(game, expenseConfig);

        if (player.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to build a carrier.`);
        }

        const ships = 1; // TODO: Need to get this from body?

        if (Math.floor(star.garrisonActual) < ships) {
            throw new ValidationError(`The star does not have enough ships garrisoned (${ships}) to build the carrier.`);
        }

        // Create a carrier at the star.
        let carrier = this.carrierService.createAtStar(star, game.galaxy.carriers, ships);

        game.galaxy.carriers.push(carrier);

        // Deduct the cost of the carrier from the player's credits.
        player.credits -= cost;

        await game.save();

        await this.eventService.createCarrierBuiltEvent(game, player, star, carrier);

        return carrier;
    }

    async _upgradeInfrastructure(game, player, starId, expenseConfigKey, economyType, calculateCostCallback) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        if (star.ownedByPlayerId == null || star.ownedByPlayerId.toString() !== player.id) {
            throw new ValidationError(`Cannot upgrade ${economyType}, the star is not owned by the current player.`);
        }

        // Calculate how much the upgrade will cost.
        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[expenseConfigKey];
        const terraformedResources = this.starService.calculateTerraformedResources(star.naturalResources, player.research.terraforming.level);
        const cost = calculateCostCallback(game, expenseConfig, star.infrastructure[economyType], terraformedResources);

        if (player.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to upgrade.`);
        }

        // Upgrade infrastructure.
        star.infrastructure[economyType]++;
        player.credits -= cost;

        await game.save();

        // Return a report of what just went down.
        return {
            playerId: player._id,
            starId: star._id,
            infrastructure: star.infrastructure[economyType],
            cost
        };
    }

    async upgradeEconomy(game, player, starId) {
        return await this._upgradeInfrastructure(game, player, starId, game.settings.player.developmentCost.economy, 'economy', this.calculateEconomyCost.bind(this));
    }

    async upgradeIndustry(game, player, starId) {
        return await this._upgradeInfrastructure(game, player, starId, game.settings.player.developmentCost.industry, 'industry', this.calculateIndustryCost.bind(this));
    }

    async upgradeScience(game, player, starId) {
        return await this._upgradeInfrastructure(game, player, starId, game.settings.player.developmentCost.science, 'science', this.calculateScienceCost.bind(this));
    }

    // TODO: This method is absolutely insane and needs to be refactored.
    // It is really really inefficient because it calculates the upgrade costs
    // like 10 times per star.
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

        while (amount) {
            let upgradeStar = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id)
                .filter(a => {
                    let terraformedResources = this.starService.calculateTerraformedResources(a.naturalResources, player.research.terraforming.level);
                    
                    return calculateCostFunction(game, expenseConfig, a.infrastructure[infrastructureType], terraformedResources) <= amount;
                })
                .sort((a, b) => {
                    let terraformedResources = this.starService.calculateTerraformedResources(a.naturalResources, player.research.terraforming.level);

                    let costA = calculateCostFunction(game, expenseConfig, a.infrastructure[infrastructureType], terraformedResources);
                    let costB = calculateCostFunction(game, expenseConfig, b.infrastructure[infrastructureType], terraformedResources);

                    return costA - costB;
                })[0];

            if (!upgradeStar) {
                break;
            }

            let upgradedCost = await upgradeFunction(game, player, upgradeStar._id);

            amount -= upgradedCost.cost;

            upgradeSummary.upgraded++;
            upgradeSummary.cost += upgradedCost.cost;

            // Add the star that we upgraded to the summary result.
            let summaryStar = upgradeSummary.stars.find(x => x.starId.equals(upgradeStar._id));

            if (!summaryStar) {
                summaryStar = {
                    starId: upgradeStar._id
                }

                upgradeSummary.stars.push(summaryStar);
            }

            summaryStar.infrastructure = upgradeStar.infrastructure[infrastructureType];
        }

        await game.save()

        await this.eventService.createInfrastructureBulkUpgraded(game, player, upgradeSummary);

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
