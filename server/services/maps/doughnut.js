module.exports = class DoughnutMapService {

    constructor(randomService, starService, starDistanceService, distanceService, resourceService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.distanceService = distanceService;
        this.resourceService = resourceService;
    }

    generateLocations(game, starCount, resourceDistribution) {
        // The starDensity constant can really be a setting, once it is turned into an intuitive variable...
        const starDensity = 1.3 * 10**-4;
        const maxRadius = ((4 * starCount) / (3 * Math.PI * starDensity))**0.5;
        const locations = [];

        // Generating locations for each star on the map
        do {
            // Try and find a suitable position for star X
            while(true) {
                let location = this.randomService.getRandomPositionInDoughnut(0.5*maxRadius, maxRadius);

                if (!this.isLocationTooCloseToOthers(game, location, locations)) {
                    locations.push(location)
                    break;
                }
            }

        } while(locations.length < starCount)

        // Giving each star its resources
        this.resourceService.setResources(game, locations, resourceDistribution);

        return locations;
    }

    isLocationTooCloseToOthers(game, location, locations) {
        // Return False if there are no stars in range, True if there is a star in range
        return locations.find(l => this.starDistanceService.isLocationTooClose(game, location, l)) != null;
    }

};
