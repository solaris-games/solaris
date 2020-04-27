const ValidationError = require('../errors/validation');

const BASE_COSTS = {
    WARP_GATE: 100,
    ECONOMY: 2.5,
    INDUSTRY: 5,
    SCIENCE: 20
};

module.exports = class StarUpgradeService {

    EXPENSE_CONFIGS = {
        cheap: 1,
        standard: 2,
        expensive: 4,
        veryExpensive: 8,
        crazyExpensive: 16
    };

    constructor(starService, carrierService, playerService) {
        this.starService = starService;
        this.carrierService = carrierService;
        this.playerService = playerService;
    }

    async buildWarpGate(game, userId, starId) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the current user.
        let userPlayer = this.playerService.getByUserId(game, userId);

        if (star.ownedByPlayerId.toString() !== userPlayer.id) {
            throw new ValidationError(`Cannot upgrade, the star is not owned by the current player.`);
        }

        if (star.warpGate) {
            throw new ValidationError(`The star already has a warp gate.`);
        }

        const expenseConfig = this.EXPENSE_CONFIGS[game.settings.specialGalaxy.buildWarpgates];
        const terraformedResources = this.starService.calculateTerraformedResources(star.naturalResources, userPlayer.research.terraforming.level);
        const cost = this.calculateWarpGateCost(expenseConfig, terraformedResources);

        if (userPlayer.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to upgrade.`);
        }

        star.warpGate = true;
        userPlayer.credits -= cost;

        await game.save();
    }

    async destroyWarpGate(game, userId, starId) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the current user.
        let userPlayer = this.playerService.getByUserId(game, userId);

        if (star.ownedByPlayerId.toString() !== userPlayer.id) {
            throw new ValidationError(`Cannot destroy warp gate, the star is not owned by the current player.`);
        }

        if (!star.warpGate) {
            throw new ValidationError(`The star does not have a warp gate to destroy.`);
        }

        star.warpGate = false;

        await game.save();
    }

    async buildCarrier(game, userId, starId) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the current user.
        let userPlayer = this.playerService.getByUserId(game, userId);

        if (star.ownedByPlayerId.toString() !== userPlayer.id) {
            throw new ValidationError(`Cannot build carrier, the star is not owned by the current player.`);
        }

        const expenseConfig = this.EXPENSE_CONFIGS[game.settings.specialGalaxy.buildCarriers];
        const cost = this.calculateCarrierCost(expenseConfig);

        if (userPlayer.credits < cost) {
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
        userPlayer.credits -= cost;

        await game.save();
    }

    async _upgradeInfrastructure(game, userId, starId, expenseConfigKey, economyType, calculateCostCallback) {
        // Get the star.
        let star = this.starService.getById(game, starId);

        // Check whether the star is owned by the current user.
        let userPlayer = this.playerService.getByUserId(game, userId);

        if (star.ownedByPlayerId.toString() !== userPlayer.id) {
            throw new ValidationError(`Cannot upgrade ${economyType}, the star is not owned by the current player.`);
        }

        const expenseConfig = this.EXPENSE_CONFIGS[expenseConfigKey];
        const terraformedResources = this.starService.calculateTerraformedResources(star.naturalResources, userPlayer.research.terraforming.level);
        const cost = calculateCostCallback(expenseConfig, star.infrastructure[economyType], terraformedResources);

        if (userPlayer.credits < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to upgrade.`);
        }

        star.infrastructure[economyType]++;
        userPlayer.credits -= cost;

        await game.save();

        return cost;
    }

    async upgradeEconomy(game, userId, starId) {
        return await this._upgradeInfrastructure(game, userId, starId, game.settings.player.developmentCost.economy, 'economy', this.calculateEconomyCost.bind(this));
    }

    async upgradeIndustry(game, userId, starId) {
        return await this._upgradeInfrastructure(game, userId, starId, game.settings.player.developmentCost.industry, 'industry', this.calculateIndustryCost.bind(this));
    }

    async upgradeScience(game, userId, starId) {
        return await this._upgradeInfrastructure(game, userId, starId, game.settings.player.developmentCost.science, 'science', this.calculateScienceCost.bind(this));
    }

    // TODO: This method is absolutely insane and needs to be refactored.
    // It is really really inefficient because it calculates the upgrade costs
    // like 10 times per star.
    async upgradeBulk(game, userId, infrastructureType, amount) {
        let userPlayer = this.playerService.getByUserId(game, userId);

        if (!userPlayer) {
            throw new ValidationError('Could not find player for user.');
        }

        let expenseConfig;
        let calculateCostFunction;
        let upgradeFunction;

        switch (infrastructureType) {
            case 'economy': 
                calculateCostFunction = this.calculateEconomyCost.bind(this);
                upgradeFunction = this.upgradeEconomy.bind(this);
                expenseConfig = this.EXPENSE_CONFIGS[game.settings.player.developmentCost.economy];
                break;
            case 'industry': 
                calculateCostFunction = this.calculateIndustryCost.bind(this);
                upgradeFunction = this.upgradeIndustry.bind(this);
                expenseConfig = this.EXPENSE_CONFIGS[game.settings.player.developmentCost.industry];
                break;
            case 'science': 
                calculateCostFunction = this.calculateScienceCost.bind(this);
                upgradeFunction = this.upgradeScience.bind(this);
                expenseConfig = this.EXPENSE_CONFIGS[game.settings.player.developmentCost.science];
                break;
        }

        if (!calculateCostFunction) {
            throw new ValidationError(`Unknown infrastructure type ${infrastructure}`)
        }

        while (amount) {
            let upgradeStar = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, userPlayer._id)
                .filter(a => {
                    let terraformedResources = this.starService.calculateTerraformedResources(a.naturalResources, userPlayer.research.terraforming.level);
                    
                    return calculateCostFunction(expenseConfig, a.infrastructure[infrastructureType], terraformedResources) <= amount;
                })
                .sort((a, b) => {
                    let terraformedResources = this.starService.calculateTerraformedResources(a.naturalResources, userPlayer.research.terraforming.level);

                    let costA = calculateCostFunction(expenseConfig, a.infrastructure[infrastructureType], terraformedResources);
                    let costB = calculateCostFunction(expenseConfig, b.infrastructure[infrastructureType], terraformedResources);

                    return costA - costB;
                })[0];

            if (!upgradeStar) {
                break;
            }

            let upgradedCost = await upgradeFunction(game, userId, upgradeStar._id);

            amount -= upgradedCost;
        }

        await game.save()
    }

    calculateWarpGateCost(expenseConfig, terraformedResources) {
        return this._calculateInfrastructureCost(BASE_COSTS.WARP_GATE, expenseConfig, 0, terraformedResources);
    }

    calculateEconomyCost(expenseConfig, current, terraformedResources) {
        return this._calculateInfrastructureCost(BASE_COSTS.ECONOMY, expenseConfig, current, terraformedResources);
    }

    calculateIndustryCost(expenseConfig, current, terraformedResources) {
        return this._calculateInfrastructureCost(BASE_COSTS.INDUSTRY, expenseConfig, current, terraformedResources);
    }

    calculateScienceCost(expenseConfig, current, terraformedResources) {
        return this._calculateInfrastructureCost(BASE_COSTS.SCIENCE, expenseConfig, current, terraformedResources);
    }

    _calculateInfrastructureCost(baseCost, expenseConfig, current, terraformedResources) {
        return Math.floor((baseCost * expenseConfig * (current + 1)) / (terraformedResources / 100));
    }

    calculateCarrierCost(expenseConfig) {
        return (expenseConfig * 10) + 5; // TODO: Is this right?
    }

};
