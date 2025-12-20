import type {ResearchType} from "@solaris-common";
import type {Game} from "@/types/game";

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
    const researchCostConfig = game.settings.technology.researchCosts[technologyKey];
    const expenseCostConfig = game.constants.star.infrastructureExpenseMultipliers[researchCostConfig];
    const progressMultiplierConfig = expenseCostConfig * game.constants.research.progressMultiplier;

    if (game.settings.technology.researchCostProgression.progression === 'exponential') {
      const growthFactor = game.constants.research.exponentialGrowthFactors[game.settings.technology.researchCostProgression.growthFactor];
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
