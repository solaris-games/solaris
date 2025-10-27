import type {DistanceService} from './distance';
import type {MapObject} from "../types/common/map";
import type {Star} from "../types/common/star";
import type {Location} from "../types/common/location";
import type {Id} from "../types/id";
import type {Player} from "../types/common/player";
import type {Game} from "../types/common/game";

export class StarDistanceService {
    distanceService: DistanceService;

    constructor(
        distanceService: DistanceService
    ) {
        this.distanceService = distanceService;
    }

    getDistanceBetweenStars<ID extends Id>(star1: MapObject<ID>, star2: MapObject<ID>) {
        return this.distanceService.getDistanceBetweenLocations(star1.location, star2.location);
    }

    getDistanceBetweenStarAndLocation<ID extends Id>(star: Star<ID>, loc: Location){
        return this.distanceService.getDistanceBetweenLocations(star.location, loc);
    }

    getClosestStar<ID extends Id>(star: Star<ID>, stars: Star<ID>[]) {
        return this.getClosestStars(star, stars, 1)[0];
    }

    getDistanceToClosestStar<ID extends Id>(star: Star<ID>, stars: Star<ID>[]) {
        let closest = this.getClosestStar(star, stars);

        return this.distanceService.getDistanceBetweenLocations(star.location, closest.location);
    }

    getClosestStars<ID extends Id>(star: Star<ID>, stars: Star<ID>[], amount: number) {
        let sorted = stars
            .filter(s => s._id.toString() !== star._id.toString()) // Exclude the current star.
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });
        
        return sorted.slice(0, amount); // Slice 1 ignores the first star because it will be the current star.
    }

    getClosestUnownedStars<ID extends Id>(star: Star<ID>, stars: Star<ID>[], amount: number) {
        let sorted = stars
            .filter(s => s._id.toString() !== star._id.toString()) // Exclude the current star.
            .filter(s => !s.ownedByPlayerId)
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });

        return sorted.slice(0, amount);
    }

    getClosestUnownedStar<ID extends Id>(star: Star<ID>, stars: Star<ID>[]) {
        return this.getClosestUnownedStars(star, stars, 1)[0];
    }

    getClosestOwnedStars<ID extends Id>(star: Star<ID>, stars: Star<ID>[]) {
        return stars
            .filter(s => s._id.toString() !== star._id.toString()) // Exclude the current star.
            .filter(s => s.ownedByPlayerId)
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });
    }

    getClosestPlayerOwnedStars<ID extends Id>(star: Star<ID>, stars: Star<ID>[], player: Player<ID>) {
        return this.getClosestOwnedStars(star, stars)
            .filter(s => s.ownedByPlayerId && s.ownedByPlayerId.toString() === player._id.toString());
    }

    getClosestPlayerOwnedStarsFromLocation<ID extends Id>(location: Location, stars: Star<ID>[], ownedByPlayerId: ID) {
        return stars
            .filter(s => s.ownedByPlayerId && s.ownedByPlayerId.toString() === ownedByPlayerId.toString())
            .sort((a, b) => this.getDistanceBetweenStarAndLocation(a, location) - this.getDistanceBetweenStarAndLocation(b, location));
    }

    getClosestPlayerOwnedStarsFromLocationWithinDistance<ID extends Id>(location: Location, stars: Star<ID>[], ownedByPlayerId: ID, maxDistance: number) {
        return stars
            .filter(s => s.ownedByPlayerId && s.ownedByPlayerId.toString() === ownedByPlayerId.toString())
            .filter(s => {
                let distance = this.getDistanceBetweenStarAndLocation(s, location);

                return maxDistance >= distance;
            })
            .sort((a, b) => this.getDistanceBetweenStarAndLocation(a, location) - this.getDistanceBetweenStarAndLocation(b, location));
    }

    getClosestUnownedStarsFromLocation<ID extends Id>(location: Location, stars: Star<ID>[], amount: number) {
        const sorted = stars
            .filter(s => !s.ownedByPlayerId)
            .sort((a, b) => this.getDistanceBetweenStarAndLocation(a, location) - this.getDistanceBetweenStarAndLocation(b, location));

        return sorted.slice(0, amount);
    }

    getClosestUnownedStarFromLocation<ID extends Id>(location: Location, stars: Star<ID>[]) {
        return this.getClosestUnownedStarsFromLocation(location, stars, 1)[0];
    }

    getStarsWithinRadiusOfStar<ID extends Id>(star: Star<ID>, stars: Star<ID>[], radius: number) {
        return stars
            .filter(s => (s._id.toString() !== star._id.toString()) && (this.getDistanceBetweenStars(star, s) <= radius));
    }

    isStarTooClose<ID extends Id>(game: Game<ID>, star: Star<ID>, otherStar: Star<ID>) {
        return this.isStarLocationTooClose(game, star.location, otherStar);
    }

    isStarLocationTooClose<ID extends Id>(game: Game<ID>, location: Location, otherStar: Star<ID>) {
        return this.isLocationTooClose(game, location, otherStar.location);
    }

    isLocationTooClose<ID extends Id>(game: Game<ID>, location: Location, otherLocation: Location) {
        const distance = this.distanceService.getDistanceBetweenLocations(location, otherLocation);

        return distance < game.constants.distances.minDistanceBetweenStars;
    }

    isDuplicateStarPosition<ID extends Id>(location: Location, stars: Star<ID>[]) {
        const samePositionStars = 
            stars.filter((star2) => {
                return location.x === star2.location.x
                    && location.y === star2.location.y;
            });
    
        return samePositionStars.length > 0;
    }

    getClosestStarFromLocation<ID extends Id>(loc: Location, stars: Star<ID>[]){
        return this.getClosestStarsFromLocation(loc, stars, 1);
    }

    getClosestStarsFromLocation<ID extends Id>(loc: Location, stars: Star<ID>[], amount: number){
        let sorted = stars
        .sort((a, b) => {
            return this.getDistanceBetweenStarAndLocation(a, loc)
                - this.getDistanceBetweenStarAndLocation(b, loc);
        });
    
        return sorted.slice(0, amount); 
    }

    getFurthestStarsFromLocation<ID extends Id>(loc: Location, stars: Star<ID>[], amount: number){
        let sorted = stars
        .sort((a, b) => {
            return this.getDistanceBetweenStarAndLocation(b, loc)
                - this.getDistanceBetweenStarAndLocation(a, loc);
        });
    
        return sorted.slice(0, amount);
    }

    getMaxGalaxyRadius(locations: Location[]) {
        const center = this.getGalaxyCenterOfMass(locations);

        let maxDistance = 0;

        for (const loc of locations) {
            const distance = this.distanceService.getDistanceBetweenLocations(center, loc);

            if (distance > maxDistance) {
                maxDistance = distance;
            }
        }

        return maxDistance;
    }

    getGalaxyCenterOfMass(starLocations: Location[]) {
        if (!starLocations.length) {
            return {
                x: 0,
                y: 0
            };
        }

        const totalX = starLocations.reduce((total, s) => total + s.x, 0);
        const totalY = starLocations.reduce((total, s) => total + s.y, 0);

        const x = totalX / starLocations.length;
        const y = totalY / starLocations.length;

        return {
            x,
            y,
        };
    }
};
