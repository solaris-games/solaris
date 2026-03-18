import type {GameResearchCost, ResearchType} from "@solaris-common";
import type {Game} from "@/types/game";

// TODO: Deduplicate with common library
class TechnologyHelper {
  FRIENDLY_NAMES = {
    scanning: 'Scanning',
    hyperspace: 'Hyperspace Range',
    terraforming: 'Terraforming',
    experimentation: 'Experimentation',
    weapons: 'Weapons',
    banking: 'Banking',
    manufacturing: 'Manufacturing',
    specialists: 'Specialists'
  }

  getFriendlyName(technologyKey: ResearchType) {
    return this.FRIENDLY_NAMES[technologyKey];
  }

  isTechnologyEnabled(game: Game, technologyKey: ResearchType) {
    return game.settings.technology.startingTechnologyLevel[technologyKey] > 0;
  }

  isTechnologyResearchable(game: Game, technologyKey: ResearchType) {
    return game.settings.technology.researchCosts[technologyKey] !== 'none';
  }

  getRequiredResearchProgress(game: Game, technologyKey: ResearchType, technologyLevel: number) {
    const researchCostConfig: GameResearchCost = game.settings.technology.researchCosts[technologyKey];
    const expenseCostConfig: number = game.constants.star.infrastructureExpenseMultipliers[researchCostConfig];
    const progressMultiplierConfig = expenseCostConfig * game.constants.research.progressMultiplier;

    const progression = game.settings.technology.researchCostProgressions[technologyKey];

    if (progression.progression === "exponential") {
      const growthFactor = game.constants.research.exponentialGrowthFactors[progression.growthFactor];
      return Math.floor(progressMultiplierConfig * Math.pow(growthFactor, technologyLevel - 1));
    } else {
      return technologyLevel * progressMultiplierConfig;
    }
  }

  getIcon(technologyKey: ResearchType) {
    switch (technologyKey) {
      case 'scanning':
        return 'binoculars'
      case 'hyperspace':
        return 'gas-pump'
      case 'terraforming':
        return 'globe-europe'
      case 'experimentation':
        return 'microscope'
      case 'weapons':
        return 'gun'
      case 'banking':
        return 'money-bill-alt'
      case 'manufacturing':
        return 'industry'
      case 'specialists':
        return 'user-astronaut'
    }

    return 'question'
  }
}

export default new TechnologyHelper()
