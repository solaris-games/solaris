import type { Game } from "../types/common/game";
import type { ResearchTypeNotRandom } from "../types/common/player";

export class ResearchProgressService {
    getRequiredResearchProgress<ID>(
        game: Game<ID>,
        technologyKey: ResearchTypeNotRandom,
        technologyLevel: number,
    ): number {
        const researchCostConfig =
            game.settings.technology.researchCosts[technologyKey];

        if (researchCostConfig === "none") {
            throw new Error(
                `Technology '${technologyKey}' is not researchable`,
            );
        }

        const expenseCostConfig =
            game.constants.star.infrastructureExpenseMultipliers[
                researchCostConfig
            ];
        const progressMultiplierConfig =
            expenseCostConfig * game.constants.research.progressMultiplier;

        const progression =
            game.settings.technology.researchCostProgressions[technologyKey];

        if (progression.progression === "exponential") {
            const growthFactor =
                game.constants.research.exponentialGrowthFactors[
                    progression.growthFactor
                ];
            return Math.floor(
                progressMultiplierConfig *
                    Math.pow(growthFactor, technologyLevel - 1),
            );
        } else if (progression.progression === "cumulative") {
            return (
                0.5 *
                    progressMultiplierConfig *
                    progression.scalingFactor *
                    (technologyLevel * (technologyLevel + 1)) +
                progressMultiplierConfig * (1 - progression.scalingFactor)
            );
        } else {
            return technologyLevel * progressMultiplierConfig;
        }
    }
}
