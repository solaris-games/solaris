const ValidationError = require("../../errors/validation");

module.exports = class DoughnutMapService {

    constructor(randomService, starService, starDistanceService, distanceService, resourceService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.distanceService = distanceService;
        this.resourceService = resourceService;
    }

    generateLocations(game, count, resourceDistribution) {
        let locations = this.generateCircle(count);

        locations = this.resourceService.setResources(game, locations, resourceDistribution);
        this.applyNoise(locations);
        this.applyPadding(locations);

        locations = this.scaleUp(game, locations);

        return locations;
    }

    generateCircle(locationCount) {
        const locations = [];

        let RADIUS = 5;
        let angle_delta = 2 * Math.PI / locationCount;
        let current_angle = 0;
         
        do {
            let sin = Math.sin(current_angle);
            let cos = Math.cos(current_angle);

            let x = cos * RADIUS;
            let y = sin * RADIUS;

            locations.push({
                x, y
            });

            current_angle += angle_delta;
        } while (locations.length < locationCount);

        return locations;
    }

    applyNoise(locations) {
        let SIZE = 5;

        for (let location of locations) {
            let x = location.x + Math.random() * SIZE;
            let y = location.y + Math.random() * SIZE;

            location.x = x;
            location.y = y;
        }
    }

    applyPadding(locations) {
        let MIN_D = 0.8,
            REPOS = 0.01,
            MAX_REPOS = 0.1,
            ITER = 5;

        while (ITER--){
            for (let i1 = 0; i1 < locations.length; i1++) {
                let locationA = locations[i1];

                for (let i2 = i1 + 1 ; i2 < locations.length; i2++) {
                    let locationB = locations[i2];

                    let dx = locationA.x - locationB.x;
                    let dy = locationA.y - locationB.y;

                    let distance = Math.hypot(dx, dy);

                    if (distance < MIN_D) {
                        let sin = dy / distance;
                        let cos = dx / distance;

                        let x_repos = cos * Math.min(MAX_REPOS, REPOS / distance);
                        let y_repos = sin * Math.min(MAX_REPOS, REPOS / distance);

                        locationA.x = locationA.x + x_repos;
                        locationA.y = locationA.y + y_repos;
                        locationB.x = locationB.x - x_repos;
                        locationB.y = locationB.y - y_repos;
                    }
                }
            }
        }
    }

    // TODO: This function should be shared between spiral and doughnut as they both are exactly the same.
    scaleUp(game, locations) {
        // Start out at the minimum possible galaxy size and increment up
        // in steps until ALL stars are at least minimum distance away from others.
        let C_HEIGHT = game.constants.distances.minDistanceBetweenStars;
        let C_WIDTH = game.constants.distances.minDistanceBetweenStars;
        let C_STEP = game.constants.distances.minDistanceBetweenStars;
        
        let isValidGalaxy = false;

        let locs;

        do {
            locs = JSON.parse(JSON.stringify(locations)); // Copy the locations so we can do it in isolation.

            let galaxy = this.getGalaxyMinMax(locs);

            let x_init = galaxy.x_min
            let y_init = galaxy.y_min

            let x_delta = galaxy.x_max - galaxy.x_min
            let y_delta = galaxy.y_max - galaxy.y_min

            let scale = 0;

            if (x_delta < y_delta) {
                scale =  C_HEIGHT  / y_delta 
            } else {
                scale = C_WIDTH / x_delta 
            }

            for (let i = 0; i < locs.length; i++) {
                let location = locs[i];
                let size = location.resources;

                let x_center = (location.x - x_init) * scale - size / 2
                let y_center = (location.y - y_init) * scale - size / 2
                
                location.x = x_center;
                location.y = y_center;
            }

            C_WIDTH += C_STEP;
            C_HEIGHT += C_STEP;

            isValidGalaxy = this.isValidGalaxyCheck(game, locs);
        } while (!isValidGalaxy);

        return locs;
    }

    isValidGalaxyCheck(game, locations) {
        // If the average distance to closest star is greater than the minimum distance allowed then the galaxy is valid.
        let average = 
            locations.reduce((sum, l) => sum + this.distanceService.getDistanceToClosestLocation(l, locations), 0) 
                / locations.length;

        // This galaxy type seems to need a slightly larger min average than normal otherwise
        // stars spawn too close to eachother.
        return average >= game.constants.distances.minDistanceBetweenStars * 1.5;
    }

    getGalaxyMinMax(locations) {
        let x_min = 0,
            y_min = 0,
            x_max = 0,
            y_max = 0;

        for (let i = 0; i < locations.length; i++) {
            let location = locations[i]

            x_min = Math.min(x_min, location.x);
            x_max = Math.max(x_max, location.x);
            y_min = Math.min(y_min, location.y);
            y_max = Math.max(x_max, location.y);
        }

        return {
            x_min,
            y_min,
            x_max,
            y_max
        }
    }

};
