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
    
}

export default new TechnologyHelper()
