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
        // These two values should probably be ingame constants but they can for now just be plugged in here
        const starDensity = 1.3 * 10**-4
        const offset = 0.5
        // There are a few options to tweak the offset:
        // 0.5- --> now the outerranges will contain more stars than the inner ones || 0.5 --> roughly the entire map has the same star density
        // 0.5-1 --> now the inner ranges will get more stars than the outer || 1 --> now at each distance from the center there will be roughly the same amount of stars
        // 1+ --> there will be an extremely increasing amount of stars in the middle with an increasingly low amount of stars in the outerranges 
        const maxRadius = (starCount/(Math.PI*starDensity))**0.5;
        let locations = [];

        do {
            // Try to find the star location X
            while (true) {
                let location = this.randomService.getRandomPositionInCircle(maxRadius, offset);

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
