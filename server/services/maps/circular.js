const { max } = require("moment");
const ValidationError = require("../../errors/validation");

module.exports = class CircularMapService {

    constructor(randomService, starService, starDistanceService, distanceService, resourceService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.distanceService = distanceService;
        this.resourceService = resourceService;
    }

    generateLocations(game, starCount, resourceDistribution) {
        let locations = [];
        const starDensity = 1.3 * 10**-4
        // To generate locations we do the following:
        // - Try to create a location at a random angle and distance from the center
        // - If after X number of tries, we can't generate a location, increment the current radius.
        let maxRadius = (starCount/(Math.PI*starDensity))**0.5;

        do {
            // Try to find the star location X
            while (true) {
                let location = this.randomService.getRandomPositionInCircle(maxRadius);

                // Stars must not be too close to eachother.
                if (!this.isLocationTooCloseToOthers(game, location, locations)) {
                    locations.push(location)
                    break;
                }
            }
        } while (locations.length < starCount)

        locations = this.resourceService.setResources(game, locations, resourceDistribution);

        return locations;
    }

    isLocationTooCloseToOthers(game, location, locations) {
        // Return False if there are no stars in range, True if there is a star in range
        return locations.find(l => this.starDistanceService.isLocationTooClose(game, location, l)) != null;
    }

};
