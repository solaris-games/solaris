const BASE_COSTS = {
    WARP_GATE: 100,
    ECONOMY: 2.5,
    INDUSTRY: 5,
    SCIENCE: 20
};

const EXPENSE_CONFIGS = {
    cheap: 1,
    standard: 2,
    expensive: 4
};

module.exports = class UpgradeStarService {
    
    constructor(gameService, starService) {
        this.gameService = gameService;
        this.starService = starService;
    }

    async upgradeWarpGate(gameId, userId, starId) {
        let game = await this.gameService.getById(gameId);

        // Get the star.
        let star = game.galaxy.stars.find(x => x.id === starId);

        // Check whether the star is owned by the current user.
        let userPlayer = game.galaxy.players.find(x => x.userId === userId);

        if (star.ownedByPlayerId.toString() !== userPlayer.id) {
            throw new Error(`Cannot upgrade, the star is not owned by the current player.`);
        }

        if (star.warpGate) {
            throw new Error(`The star already has a warp gate.`);
        }

        const expenseConfig = EXPENSE_CONFIGS[game.settings.specialGalaxy.buildWarpgates];
        const terraformedResources = this.starService.calculateTerraformedResources(star.naturalResources, userPlayer.research.terraforming.level);
        const cost = this._calculateWarpGateCost(expenseConfig, terraformedResources);

        if (userPlayer.cash < cost) {
            throw new Error(`The player does not own enough credits to afford to upgrade.`);
        }

        star.warpGate = true;
        userPlayer.cash -= cost;

        await game.save();
    }

    _calculateWarpGateCost(expenseConfig, terraformedResources) {
        return this._calculateInfrastructureCost(BASE_COSTS.WARP_GATE, expenseConfig, 0, terraformedResources);
    }

    _calculateEconomyCost(expenseConfig, current, terraformedResources) {
        return this._calculateInfrastructureCost(BASE_COSTS.ECONOMY, expenseConfig, current, terraformedResources);
    }

    _calculateIndustryCost(expenseConfig, current, terraformedResources) {
        return this._calculateInfrastructureCost(BASE_COSTS.INDUSTRY, expenseConfig, current, terraformedResources);
    }

    _calculateScienceCost(expenseConfig, current, terraformedResources) {
        return this._calculateInfrastructureCost(BASE_COSTS.SCIENCE, expenseConfig, current, terraformedResources);
    }

    _calculateInfrastructureCost(baseCost, expenseConfig, current, terraformedResources) {
        return Math.floor((baseCost * expenseConfig * (current + 1)) / (terraformedResources / 100));
    }

};
