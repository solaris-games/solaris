module.exports = class CircularMapService {

    constructor(randomService, starService, starDistanceService, distanceService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.distanceService = distanceService;
    }

    generateLocations(game, starCount) {
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

        this.setResources(game, locations);

        return locations;
    }

    setResources(game, locations) {
        // Work out how large the radius of the circle used to determine natural resources.
        // The closer to the center of the galaxy, the more likely to find stars with higher resources.
        const resourceRadius = this.getGalaxyDiameter(locations).x / 3;
        
        for (let location of locations) {
            let resources = this.randomService.generateStarNaturalResources(resourceRadius, location.x, location.y, 
                game.constants.star.resources.minNaturalResources, game.constants.star.resources.maxNaturalResources, true);
            
            location.resources = resources;
        }
    }

    getGalaxyDiameter(locations) {
        let maxX = locations.sort((a, b) => b.x - a.x)[0].x;
        let maxY = locations.sort((a, b) => b.y - a.y)[0].y;
        let minX = locations.sort((a, b) => a.x - b.x)[0].x;
        let minY = locations.sort((a, b) => a.y - b.y)[0].y;

        return {
            x: Math.abs(minX) + Math.abs(maxX),
            y: Math.abs(minY) + Math.abs(maxY),
        };
    }

    isLocationTooCloseToOthers(game, location, locations) {
        return locations.find(l => this.starDistanceService.isLocationTooClose(game, location, l)) != null;
    }

};
