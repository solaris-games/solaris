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
        const locations = [];

        // To generate locations we do the following:
        // - Try to create a location at a random angle and distance from the center
        // - If after X number of tries, we can't generate a location, increment the current radius.
        let currentRadius = game.constants.distances.minDistanceBetweenStars;
        let radiusStep = game.constants.distances.minDistanceBetweenStars;
        let maxTries = 5;

        do {
            let createdLocation = false;

            // Try to find the star location X number of times.
            for (let i = 0; i < maxTries; i++) {
                const location = this.starService.generateStarPosition(game, 0, 0, currentRadius);

                // Stars must not be too close to eachother.
                if (this.isLocationTooCloseToOthers(game, location, locations))
                    continue;

                locations.push(location);
                createdLocation = true;
                break;
            }

            // If we didn't find a valid location, increase radius.
            if (!createdLocation) {
                currentRadius += radiusStep;
            }
        } while (locations.length < starCount)

        this.resourceService.distribute(game, locations, resourceDistribution);

        return locations;
    }

    isLocationTooCloseToOthers(game, location, locations) {
        return locations.find(l => this.starDistanceService.isLocationTooClose(game, location, l)) != null;
    }

};
