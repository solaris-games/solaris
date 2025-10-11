import type { Location } from "../types/common/location";
import type {Game} from "../types/common/game";

export class DistanceService {

    getDistanceBetweenLocations(loc1: Location, loc2: Location) {
        return Math.hypot(loc2.x - loc1.x, loc2.y - loc1.y);
    }

    getDistanceAlongLocationList(locations: Location[]) {
        if (!locations || locations.length < 2) {
            return 0;
        }

        let distance = 0;
        let last = locations[0];

        for (let i = 1; i < locations.length; i++) {
            const current = locations[i];
            distance += this.getDistanceBetweenLocations(last, current);
            last = current;
        }

        return distance;
    }

    getDistanceSquaredBetweenLocations(loc1: Location, loc2: Location)
    {
        let xs = loc2.x - loc1.x,
            ys = loc2.y - loc1.y;

        xs *= xs;
        ys *= ys;

        return xs + ys;
    }

    getClosestLocations(loc: Location, locs: Location[], amount: number): Location[] {
        let sorted = locs
            .filter(a => a.x !== loc.x && a.y !== loc.y) // Ignore the location passed in if it exists in the array.
            .sort((a, b) => {
                return this.getDistanceBetweenLocations(loc, a)
                    - this.getDistanceBetweenLocations(loc, b);
            });
        
        return sorted.slice(0, amount);
    }

    getClosestLocation(loc: Location, locs: Location[]): Location {
        return this.getClosestLocations(loc, locs, 1)[0];
    }

    getDistanceToClosestLocation(loc: Location, locs: Location[]): number {
        let closest = this.getClosestLocation(loc, locs);

        return this.getDistanceBetweenLocations(loc, closest);
    }

    getFurthestLocations(loc: Location, locs: Location[], amount: number): Location[] {
        return this.getClosestLocations(loc, locs, locs.length).reverse().slice(0, amount);
    }

    getFurthestLocation(loc: Location, locs: Location[]): Location {
        return this.getFurthestLocations(loc, locs, 1)[0];
    }

    getScanningDistance<ID>(game: Game<ID>, scanning: number): number {
        return ((scanning || 1) + 1) * game.constants.distances.lightYear;
    }
    
    getHyperspaceDistance<ID>(game: Game<ID>, hyperspace: number): number {
        return ((hyperspace || 1) + 1.5) * game.constants.distances.lightYear;
    }

    getAngleTowardsLocation(source: Location, destination: Location): number {
        let deltaX = destination.x - source.x;
        let deltaY = destination.y - source.y;

        return Math.atan2(deltaY, deltaX);
    }

    getNextLocationTowardsLocation(source: Location, destination: Location, distance: number): Location {
        let angle = this.getAngleTowardsLocation(source, destination);

        return {
            x: source.x + (distance * Math.cos(angle)),
            y: source.y + (distance * Math.sin(angle)),
        };
    }

};
