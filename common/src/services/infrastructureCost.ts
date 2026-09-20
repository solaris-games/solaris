import type { Game } from "../types/common/game";
import type { Id } from "../types/id";
import type { TerraformedResources } from "../types/common/star";

export class InfrastructureCostService<ID extends Id> {
    _calculateInfrastructureCost(
        baseCost: number,
        expenseConfig: number,
        current: number,
        terraformedResources: number,
    ) {
        return Math.max(
            1,
            Math.floor(
                (baseCost * expenseConfig * (current + 1)) /
                    (terraformedResources / 100),
            ),
        );
    }

    calculateCarrierCost(game: Game<ID>, expenseConfig: number) {
        return (
            expenseConfig *
                game.constants.star.infrastructureCostMultipliers.carrier +
            5
        );
    }

    calculateAverageTerraformedResources(
        terraformedResources: TerraformedResources,
    ) {
        return Math.floor(
            (terraformedResources.economy +
                terraformedResources.industry +
                terraformedResources.science) /
                3,
        );
    }

    calculateWarpGateCost(
        game: Game<ID>,
        expenseConfig: number,
        terraformedResources: number,
    ) {
        return this._calculateInfrastructureCost(
            game.constants.star.infrastructureCostMultipliers.warpGate,
            expenseConfig,
            0,
            terraformedResources,
        );
    }

    calculateEconomyCost(
        game: Game<ID>,
        expenseConfig: number,
        current: number,
        terraformedResources: number,
    ) {
        return this._calculateInfrastructureCost(
            game.constants.star.infrastructureCostMultipliers.economy,
            expenseConfig,
            current,
            terraformedResources,
        );
    }

    calculateIndustryCost(
        game: Game<ID>,
        expenseConfig: number,
        current: number,
        terraformedResources: number,
    ) {
        return this._calculateInfrastructureCost(
            game.constants.star.infrastructureCostMultipliers.industry,
            expenseConfig,
            current,
            terraformedResources,
        );
    }

    calculateScienceCost(
        game: Game<ID>,
        expenseConfig: number,
        current: number,
        terraformedResources: number,
    ) {
        return this._calculateInfrastructureCost(
            game.constants.star.infrastructureCostMultipliers.science,
            expenseConfig,
            current,
            terraformedResources,
        );
    }
}
