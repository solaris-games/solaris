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

}

export default new TechnologyHelper()
