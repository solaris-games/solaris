class TechnologyHelper {

    FRIENDLY_NAMES = {
        scanning: 'Scanning',
        hyperspace: 'Hyperspace Range',
        terraforming: 'Terraforming',
        experimentation: 'Experimentation',
        weapons: 'Weapons',
        banking: 'Banking',
        manufacturing: 'Manufacturing',
        scanning: 'Scanning'
    }

    getFriendlyName(technologyKey) {
        return this.FRIENDLY_NAMES[technologyKey]
    }

    isTechnologyEnabled (game, technologyKey) {
        return game.settings.technology.researchCosts[technologyKey] !== 'none'
    }

    getRequiredResearchProgress (game, technologyKey, technologyLevel) {
        const researchCostConfig = game.settings.technology.researchCosts[technologyKey];
        const expenseCostConfig = game.constants.star.infrastructureExpenseMultipliers[researchCostConfig];
        const progressMultiplierConfig = expenseCostConfig * game.constants.research.progressMultiplier;

        return technologyLevel * progressMultiplierConfig;
    }
    
    getIcon (technologyKey) {
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
                return 'fighter-jet'
            case 'banking':
                return 'money-bill-alt'
            case 'manufacturing':
                return 'industry'
        }

        return 'question'
    }
}

export default new TechnologyHelper()
