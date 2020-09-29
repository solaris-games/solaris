const simplexNoise = require('simplex-noise');

module.exports = class SpiralMapService {

    constructor(randomService, starService, starDistanceService, distanceService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.distanceService = distanceService;
    }

    generateLocations(game, count) {
        let branchCount = Math.max(4, game.settings.general.playerLimit);
        let locations = this.generateSpiral(count, branchCount);

        // TODO: Temporarily removed this as it screws with player positioning.
        // This service should be responsible for plotting where player home stars are as
        // the current logic doesn't really work well when galaxies are stretched.
        //this.applyQuadraticStretch(locations);
        this.setResources(game, locations);
        this.applyNoise(locations);

        locations = this.scaleUp(game, locations);

        return locations;
    }

    generateSpiral(locationCount, branchCount) {
        const locations = [];

        let BRANCHES = branchCount;
        let COPIES = 2;

        let DISTANCE_FACTOR = 0.15;
        let ANGLE_DELTA = 1;

        let i = 0;
        let c_i = 0;

        do {
            c_i++;

            if (c_i == COPIES) {
                i++
                c_i  = 0
            }

            let current_branch = i % BRANCHES
            let distance = i / BRANCHES * DISTANCE_FACTOR
            let angle = (current_branch / BRANCHES)  * 2 * Math.PI + distance * ANGLE_DELTA
            let sin = Math.sin(angle)
            let cos = Math.cos(angle)

            let x = sin * distance
            let y = cos * distance

            locations.push({
                x, y
            });
        } while (locations.length < locationCount);

        return locations;
    }

    applyQuadraticStretch(locations) {
        let RADIUS = 3

        let X_BASE = 2
        let X_EXP  = 1.2
        let X_EXP2= 2
        let Y_BASE = 2
        let Y_EXP = 0.1
        let Y_EXP2 = 2

        for (let i = 0; i < locations.length; i++){
            let location = locations[i]

            let x_init =  location.x
            let y_init =  location.y

            let vector = Math.hypot(x_init, y_init);
            let vectorScale = (RADIUS - vector) / RADIUS;

            let x = x_init * Math.pow(X_BASE, X_EXP * Math.pow(vectorScale, X_EXP2));
            let y = y_init * Math.pow(Y_BASE, Y_EXP * Math.pow(vectorScale, Y_EXP2));

            location.x = x;
            location.y = y;
        }
    }

    applyNoise(locations) {
        let seed = Math.floor(Math.random() * 10000)
        let simplex = new simplexNoise(seed);
        
        let DELTA_DISTANCE = 0.01;
        let DISTANCE_CHECKING_DIRECTIONS = 1;
        let ITERATION_COUNT = 10;
        let PERLIN_SCALE = 1;
        let PERLIN_GRAVITY = 0.01;
        let PERLIN_BROWNIAN_MOTION = 0.05;

        // perlin modifications
        for (let i = 0; i < ITERATION_COUNT; i++) {
            for (var s_i = 0;s_i < locations.length; s_i++ ) {
                let location = locations[s_i]
                let d_x = 0;
                let d_y = 0;
                let s_x = location.x * PERLIN_SCALE
                let s_y = location.y * PERLIN_SCALE

                let val_at_loc = simplex.noise2D(s_x , s_y)

                // get gradient in perlin noise
                for (let d_i = 0; d_i < DISTANCE_CHECKING_DIRECTIONS; d_i ++) { 
                    // now we get sin and cos for our absolute vector
                    let angle = d_i * Math.pi / DISTANCE_CHECKING_DIRECTIONS
                    let av_x = Math.sin(angle)
                    let av_y = Math.cos(angle)
                    let val_at_offset = simplex.noise2D(s_x + av_x * DELTA_DISTANCE, s_y + av_y * DELTA_DISTANCE)

                    d_x += (val_at_loc - val_at_offset ) * PERLIN_GRAVITY;
                    d_y += (val_at_loc - val_at_offset ) * PERLIN_GRAVITY;
                }

                // apply force to location
                location.x += d_x + PERLIN_BROWNIAN_MOTION * Math.random();
                location.y += d_y + PERLIN_BROWNIAN_MOTION * Math.random();
            }
        }
    }

    setResources(game, locations) {
        // TODO: Weighted resources?
        // let RMIN = game.constants.star.resources.minNaturalResources;
        // let RRANGE = game.constants.star.resources.maxNaturalResources - RMIN;
        // let RADIUS = 3;

        // let BASE = 2;
        // let EXP = 2;
        // let EXP2 = 2;

        // for (let i = 0; i < locations.length; i++){
        //     let location = locations[i];

        //     let x_init = location.x;
        //     let y_init = location.y;

        //     let vector = Math.hypot(x_init, y_init);
        //     let vectorScale = (RADIUS - vector) / RADIUS;

        //     let r = (RMIN + (RRANGE * Math.pow(BASE, EXP * Math.pow(vectorScale, EXP2)))) / RADIUS;

        //     location.resources = Math.floor(r);
        // }

        // Allocate random resources.
        let RMIN = game.constants.star.resources.minNaturalResources;
        let RMAX = game.constants.star.resources.maxNaturalResources;

        for (let location of locations) {
            let r = this.randomService.getRandomNumberBetween(RMIN, RMAX);

            location.resources = Math.floor(r);
        }
    }

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

        return average >= game.constants.distances.minDistanceBetweenStars;
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
