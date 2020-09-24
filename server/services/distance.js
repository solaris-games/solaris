const moment = require('moment');

module.exports = class DistanceService {

    getDistanceBetweenLocations(loc1, loc2) {
        let xs = loc2.x - loc1.x,
            ys = loc2.y - loc1.y;

        xs *= xs;
        ys *= ys;

        return Math.sqrt(xs + ys);
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
        let angle = this.getAngleTowardsLocation(source, destination);

        return {
            x: source.x + (distance * Math.cos(angle)),
            y: source.y + (distance * Math.sin(angle)),
        };
    }

};
