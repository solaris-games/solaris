import { Game } from "../types/Game";
import { Location } from "../types/Location";

export default class DistanceService {  

    getDistanceBetweenLocations(loc1: Location, loc2: Location) {
        // Math.hypot returns the root of the squared values of its variables. So this is sqrt( (x2 - x1)^2 + (y2 - y1)^2 ), much shorter than the older version
        return Math.hypot(loc2.x - loc1.x, loc2.y - loc1.y);
    }

    getClosestLocations(loc: Location, locs: Location[], amount: number) {
        let sorted = locs
            .filter(a => a.x !== loc.x && a.y !== loc.y) // Ignore the location passed in if it exists in the array.
            .sort((a, b) => {
                return this.getDistanceBetweenLocations(loc, a)
                    - this.getDistanceBetweenLocations(loc, b);
            });
        
        return sorted.slice(0, amount);
    }

    getClosestLocation(loc: Location, locs: Location[]) {
        return this.getClosestLocations(loc, locs, 1)[0];
    }

    getDistanceToClosestLocation(loc: Location, locs: Location[]) {
        let closest = this.getClosestLocation(loc, locs);

        return this.getDistanceBetweenLocations(loc, closest);
    }

    getFurthestLocations(loc: Location, locs: Location[], amount: number) {
        return this.getClosestLocations(loc, locs, locs.length).reverse().slice(0, amount);
    }

    getFurthestLocation(loc: Location, locs: Location[]) {
        return this.getFurthestLocations(loc, locs, 1)[0];
    }

    getScanningDistance(game: Game, scanning: number) {
        return ((scanning || 1) + 1) * game.constants.distances.lightYear;
    }
    
    getHyperspaceDistance(game: Game, hyperspace: number) {
        return ((hyperspace || 1) + 1.5) * game.constants.distances.lightYear;
    }

    getAngleTowardsLocation(source: Location, destination: Location) {
        let deltaX = destination.x - source.x;
        let deltaY = destination.y - source.y;

        return Math.atan2(deltaY, deltaX);
    }

    getNextLocationTowardsLocation(source: Location, destination: Location, distance: number) {
        let angle = this.getAngleTowardsLocation(source, destination);

        return {
            x: source.x + (distance * Math.cos(angle)),
            y: source.y + (distance * Math.sin(angle)),
        };
    }

};
