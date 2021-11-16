const moment = require('moment');

module.exports = class DistanceService {

    getDistanceBetweenLocations(loc1, loc2) {
        // Math.hypot returns the root of the squared values of its variables. So this is sqrt( (x2 - x1)^2 + (y2 - y1)^2 ), much shorter than the older version
        return Math.hypot(loc2.x - loc1.x, loc2.y - loc1.y);
    }

    getClosestLocations(loc, locs, amount) {
        let sorted = locs
            .filter(a => a.x !== loc.x && a.y !== loc.y) // Ignore the location passed in if it exists in the array.
            .sort((a, b) => {
                return this.getDistanceBetweenLocations(loc, a)
                    - this.getDistanceBetweenLocations(loc, b);
            });
        
        return sorted.slice(0, amount);
    }

    getClosestLocation(loc, locs) {
        return this.getClosestLocations(loc, locs, 1)[0];
    }

    getDistanceToClosestLocation(loc, locs) {
        let closest = this.getClosestLocation(loc, locs);

        return this.getDistanceBetweenLocations(loc, closest);
    }

    getFurthestLocations(loc, locs, amount) {
        return this.getClosestLocations(loc, locs, locs.length).reverse().slice(0, amount);
    }

    getFurthestLocation(loc, locs) {
        return this.getFurthestLocations(loc, locs, 1)[0];
    }

    getScanningDistance(game, scanning) {
        return ((scanning || 1) + 1) * game.constants.distances.lightYear;
    }
    
    getHyperspaceDistance(game, hyperspace) {
        return ((hyperspace || 1) + 1.5) * game.constants.distances.lightYear;
    }

    getAngleTowardsLocation(source, destination) {
        let deltaX = destination.x - source.x;
        let deltaY = destination.y - source.y;

        return Math.atan2(deltaY, deltaX);
    }

    getNextLocationTowardsLocation(source, destination, distance) {
        // SUPER IMPORTANT: This moves the object just in the direction of the destination by the input distance, meaning it can totally overshoot when using this formula!!!
        // Uses of this formula however catch this case and fix it, but be aware when picking it for a new function. 
        let angle = this.getAngleTowardsLocation(source, destination);

        return {
            x: source.x + (distance * Math.cos(angle)),
            y: source.y + (distance * Math.sin(angle)),
        };
    }

};
