const ValidationError = require('../errors/validation');

const BASE_COSTS = {
    WARP_GATE: 100,
    ECONOMY: 2.5,
    INDUSTRY: 5,
    SCIENCE: 20
};

function getStar(game, starId) {
    return game.galaxy.stars.find(x => x.id === starId);
}

function getUserPlayer(game, userId) {
    return game.galaxy.players.find(x => x.userId === userId);
}

module.exports = class StarUpgradeService {

    EXPENSE_CONFIGS = {
        cheap: 1,
        standard: 2,
        expensive: 4
    };

    constructor(starService) {
        this.starService = starService;
    }

    async upgradeWarpGate(game, userId, starId) {
        // Get the star.
        let star = getStar(game, starId);

        // Check whether the star is owned by the current user.
        let userPlayer = getUserPlayer(game, userId);

        if (star.ownedByPlayerId.toString() !== userPlayer.id) {
            throw new ValidationError(`Cannot upgrade, the star is not owned by the current player.`);
        }

        if (star.warpGate) {
            throw new ValidationError(`The star already has a warp gate.`);
        }

        const expenseConfig = this.EXPENSE_CONFIGS[game.settings.specialGalaxy.buildWarpgates];
        const terraformedResources = this.starService.calculateTerraformedResources(star.naturalResources, userPlayer.research.terraforming.level);
        const cost = this.calculateWarpGateCost(expenseConfig, terraformedResources);

        if (userPlayer.cash < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to upgrade.`);
        }

        star.warpGate = true;
        userPlayer.cash -= cost;

        await game.save();
    }

    async destroyWarpGate(game, userId, starId) {
        // Get the star.
        let star = getStar(game, starId);

        // Check whether the star is owned by the current user.
        let userPlayer = getUserPlayer(game, userId);

        if (star.ownedByPlayerId.toString() !== userPlayer.id) {
            throw new ValidationError(`Cannot destroy warp gate, the star is not owned by the current player.`);
        }

        if (!star.warpGate) {
            throw new ValidationError(`The star does not have a warp gate to destroy.`);
        }

        star.warpGate = false;

        await game.save();
    }

    async _upgradeInfrastructure(game, userId, starId, economyType, calculateCostCallback) {
        // Get the star.
        let star = getStar(game, starId);

        // Check whether the star is owned by the current user.
        let userPlayer = getUserPlayer(game, userId);

        if (star.ownedByPlayerId.toString() !== userPlayer.id) {
            throw new ValidationError(`Cannot upgrade ${economyType}, the star is not owned by the current player.`);
        }

        const expenseConfig = this.EXPENSE_CONFIGS[game.settings.specialGalaxy.buildWarpgates];
        const terraformedResources = this.starService.calculateTerraformedResources(star.naturalResources, userPlayer.research.terraforming.level);
        const cost = calculateCostCallback(expenseConfig, star[economyType], terraformedResources);

        if (userPlayer.cash < cost) {
            throw new ValidationError(`The player does not own enough credits to afford to upgrade.`);
        }

        star[economyType]++;
        userPlayer.cash -= cost;

        await game.save();
    }

    async upgradeEconomy(game, userId, starId) {
        return await this._upgradeInfrastructure(game, userId, starId, 'economy', this.calculateEconomyCost.bind(this));
    }

    async upgradeIndustry(game, userId, starId) {
        return await this._upgradeInfrastructure(game, userId, starId, 'industry', this.calculateIndustryCost.bind(this));
    }

    async upgradeScience(game, userId, starId) {
        return await this._upgradeInfrastructure(game, userId, starId, 'science', this.calculateScienceCost.bind(this));
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

};
