module.exports = class StandardMapService {

    constructor(randomService, starService, starDistanceService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
    }

    generateLocations(game, starCount) {
        const locations = [];

        // To generate locations we do the following:
        // - Create a location at a random angle and distance from the current position
        // - Then pick a random location in the list of locations to be the new origin position.
        // - Repeat until we have created all of the required locations.
        let currentOrigin = {
            x: 0,
            y: 0
        };

        do {            
            const location = this.starService.generateStarPosition(game, currentOrigin.x, currentOrigin.y);

            // Stars must not be too close to eachother.
            if (this.isLocationTooCloseToOthers(game, location, locations))
                continue;

            locations.push(location);

            // Pick a new origin from a random star.
            currentOrigin = locations[this.randomService.getRandomNumberBetween(0, locations.length - 1)];
        } while (locations.length < starCount);

        return locations;
    }

    isLocationTooCloseToOthers(game, location, locations) {
        return locations.find(l => this.starDistanceService.isLocationTooClose(game, location, l)) != null;
    }

};
