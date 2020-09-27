const simplexNoise = require('simplex-noise');

module.exports = class SpiralMapService {

    constructor(randomService, starService, starDistanceService, distanceService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.distanceService = distanceService;
    }

    generateLocations(game, count) {
        const locations = this.generateSpiral(count);

        this.doWhateverTheFuckThisIs(locations);
        this.applyNoise(locations);
        this.scaleUp(locations);

        return locations;
    }

    generateSpiral(locationCount) {
        const locations = [];

        let BRANCHES = 8; // TODO: Number of players?
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

    // TODO: Rename this.
    doWhateverTheFuckThisIs(locations) {
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

    scaleUp(locations) {
        // TODO: Figure out how to sensibly scale the galaxy based
        // on number of players and star count?
        // TODO: Need to make sure that the scaled up galaxy is within
        // bounds of the min and max star distances.
        const C_HEIGHT = 1500
        const C_WIDTH = 1500

        let galaxy = this.getGalaxyMinMax(locations);

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

        for (let i = 0; i < locations.length; i++) {
            let location = locations[i];
            let size = 10;

            let x_center = (location.x - x_init) * scale - size / 2
            let y_center = (location.y - y_init) * scale - size / 2
            
            location.x = x_center;
            location.y = y_center;
        }
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
