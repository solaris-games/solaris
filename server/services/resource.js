module.exports = class ResourceService {

    constructor(randomService, distanceService, starDistanceService) {
        this.randomService = randomService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
    }

    distribute(game, locations, resourceDistribution) {
        // Note: Always distribute randomly for doughnut and irregular regardless of setting.
        const forcedRandom = ['doughnut', 'irregular'].includes(game.settings.galaxy.galaxyType);

        if (resourceDistribution !== 'random' && !forcedRandom) {
            return this._distributeWeightedCenter(game, locations);
        }

        // In all other cases, random.
        return this._distributeRandom(game, locations);
    }

    _distributeRandom(game, locations) {
        // Allocate random resources.
        let minResources = game.constants.star.resources.minNaturalResources;
        let maxResources = game.constants.star.resources.maxNaturalResources;

        if (game.settings.galaxy.galaxyType === 'circular-balanced') {
            this._distributeRandomMirrored(game, locations, minResources, maxResources);
        } else {
            this._distributeRandomAny(game, locations, minResources, maxResources);
        }
    }

    _distributeRandomMirrored(game, locations, minResources, maxResources) {
        let playerCount = game.settings.general.playerLimit;

        for (let i = 0; i < locations.length / playerCount; i++) {
            let r = this.randomService.getRandomNumberBetween(minResources, maxResources);

            for (let j = 0; j < playerCount; j++) {
                locations[i*playerCount+j].resources = Math.floor(r);
            }
        }
    }

    _distributeRandomAny(game, locations, minResources, maxResources) {
        for (let location of locations) {
            let r = this.randomService.getRandomNumberBetween(minResources, maxResources);
            location.resources = Math.floor(r);
        }
    }

    _distributeWeightedCenter(game, locations) {
        // The closer to the center of the galaxy, the more likely (exponentially) to find stars with higher resources.
        let minResources = game.constants.star.resources.minNaturalResources;
        let maxResources = game.constants.star.resources.maxNaturalResources;
        let galaxyRadius = this.starDistanceService.getMaxGalaxyDiameter(locations) / 2;
        let galacticCenter = { x: 0, y: 0 };

        if (game.settings.galaxy.galaxyType == 'circular-balanced') {
            this._distributeWeightedCenterMirrored(game, locations, minResources, maxResources, galaxyRadius, galacticCenter);
        } else {
            this._distributeWeightedCenterAny(game, locations, minResources, maxResources, galaxyRadius, galacticCenter);
        }
    }

    _distributeWeightedCenterMirrored(game, locations, minResources, maxResources, galaxyRadius, galacticCenter) {
        let playerCount = game.settings.general.playerLimit;
        
        for (let i = 0; i < locations.length / playerCount; i++) {
            let radius = this.distanceService.getDistanceBetweenLocations(galacticCenter, locations[i*playerCount]);
            let resources = this.randomService.getRandomNumberBetweenEXP(minResources, maxResources, radius/galaxyRadius);

            for (let j = 0; j < playerCount; j++) {
                locations[i*playerCount + j].resources = resources;
            }
        }
    }

    _distributeWeightedCenterAny(game, locations, minResources, maxResources, galaxyRadius, galacticCenter) {
        for (let location of locations) {
            let radius = this.distanceService.getDistanceBetweenLocations(galacticCenter, location);
            
            // The * 0.6 + 0.2 in the function prevents values like 0 or 1, in which case randomisation is gone, and the outcome can only be a min or a max value
            // If you want the differences to be more extreme you can increase the 0.6 and decrease the 0.2 notice how: 1 - 0.6 = 2 * 0.2, keep that relation intact.
            // So for example a good tweak to make the center even stronger and the edges weaker would be to pick * 0.8 + 0.1, and notice again how 1 - 0.8 = 2 * 0.1 
            let resources = this.randomService.getRandomNumberBetweenEXP(minResources, maxResources, radius/galaxyRadius * 0.6 + 0.2);

            location.resources = resources;
        }
    }

}