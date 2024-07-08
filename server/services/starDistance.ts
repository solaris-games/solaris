import { DBObjectId } from "./types/DBObjectId";
import { Game } from "./types/Game";
import { Location } from "./types/Location";
import { MapObject } from "./types/Map";
import { Player } from "./types/Player";
import { Star } from "./types/Star";
import DistanceService from "./distance";

export default class StarDistanceService {
    distanceService: DistanceService;

    constructor(
        distanceService: DistanceService
    ) {
        this.distanceService = distanceService;
    }

    getDistanceBetweenStars(star1: MapObject, star2: MapObject) {
        return this.distanceService.getDistanceBetweenLocations(star1.location, star2.location);
    }

    getDistanceBetweenStarAndLocation(star: Star, loc: Location){
        return this.distanceService.getDistanceBetweenLocations(star.location, loc);
    }

    getClosestStar(star: Star, stars: Star[]) {
        return this.getClosestStars(star, stars, 1)[0];
    }

    getDistanceToClosestStar(star: Star, stars: Star[]) {
        let closest = this.getClosestStar(star, stars);

        return this.distanceService.getDistanceBetweenLocations(star.location, closest.location);
    }

    getClosestStars(star: Star, stars: Star[], amount: number) {
        let sorted = stars
            .filter(s => s._id.toString() !== star._id.toString()) // Exclude the current star.
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });
        
        return sorted.slice(0, amount); // Slice 1 ignores the first star because it will be the current star.
    }

    getClosestUnownedStars(star: Star, stars: Star[], amount: number) {
        let sorted = stars
            .filter(s => s._id.toString() !== star._id.toString()) // Exclude the current star.
            .filter(s => !s.ownedByPlayerId)
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });

        return sorted.slice(0, amount);
    }

    getClosestUnownedStar(star: Star, stars: Star[]) {
        return this.getClosestUnownedStars(star, stars, 1)[0];
    }

    getClosestOwnedStars(star: Star, stars: Star[]) {
        return stars
            .filter(s => s._id.toString() !== star._id.toString()) // Exclude the current star.
            .filter(s => s.ownedByPlayerId)
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });
    }

    getClosestPlayerOwnedStars(star: Star, stars: Star[], player: Player) {
        return this.getClosestOwnedStars(star, stars)
            .filter(s => s.ownedByPlayerId && s.ownedByPlayerId.toString() === player._id.toString());
    }

    getClosestPlayerOwnedStarsFromLocation(location: Location, stars: Star[], ownedByPlayerId: DBObjectId) {
        let sorted = stars
            .filter(s => s.ownedByPlayerId && s.ownedByPlayerId.toString() === ownedByPlayerId.toString())
            .sort((a, b) => this.getDistanceBetweenStarAndLocation(a, location) - this.getDistanceBetweenStarAndLocation(b, location));

        return sorted;
    }

    getClosestPlayerOwnedStarsFromLocationWithinDistance(location: Location, stars: Star[], ownedByPlayerId: DBObjectId, maxDistance: number) {
        let sorted = stars
            .filter(s => s.ownedByPlayerId && s.ownedByPlayerId.toString() === ownedByPlayerId.toString())
            .filter(s => {
                let distance = this.getDistanceBetweenStarAndLocation(s, location);
                
                return maxDistance >= distance;
            })
            .sort((a, b) => this.getDistanceBetweenStarAndLocation(a, location) - this.getDistanceBetweenStarAndLocation(b, location));

        return sorted;
    }

    getClosestUnownedStarsFromLocation(location: Location, stars: Star[], amount: number) {
        let sorted = stars
            .filter(s => !s.ownedByPlayerId)
            .sort((a, b) => this.getDistanceBetweenStarAndLocation(a, location) - this.getDistanceBetweenStarAndLocation(b, location));

        return sorted.slice(0, amount);
    }

    getClosestUnownedStarFromLocation(location: Location, stars: Star[]) {
        return this.getClosestUnownedStarsFromLocation(location, stars, 1)[0];
    }

    getStarsWithinRadiusOfStar(star: Star, stars: Star[], radius: number) {
        let nearby = stars
            .filter(s => (s._id.toString() !== star._id.toString()) && (this.getDistanceBetweenStars(star, s) <= radius))
        
        return nearby;
    }

    isStarTooClose(game: Game, star: Star, otherStar: Star) {
        return this.isStarLocationTooClose(game, star.location, otherStar);
    }

    isStarLocationTooClose(game: Game, location: Location, otherStar: Star) {
        return this.isLocationTooClose(game, location, otherStar.location);
    }

    isLocationTooClose(game: Game, location: Location, otherLocation: Location) {
        const distance = this.distanceService.getDistanceBetweenLocations(location, otherLocation);

        return distance < game.constants.distances.minDistanceBetweenStars;
    }

    isDuplicateStarPosition(location: Location, stars: Star[]) {
        const samePositionStars = 
            stars.filter((star2) => {
                return location.x === star2.location.x
                    && location.y === star2.location.y;
            });
    
        return samePositionStars.length > 0;
    }

    getClosestStarFromLocation(loc: Location, stars: Star[]){
        return this.getClosestStarsFromLocation(loc, stars, 1);
    }

    getClosestStarsFromLocation(loc: Location, stars: Star[], amount: number){
        let sorted = stars
        .sort((a, b) => {
            return this.getDistanceBetweenStarAndLocation(a, loc)
                - this.getDistanceBetweenStarAndLocation(b, loc);
        });
    
        return sorted.slice(0, amount); 
    }

    getFurthestStarsFromLocation(loc: Location, stars: Star[], amount: number){
        let sorted = stars
        .sort((a, b) => {
            return this.getDistanceBetweenStarAndLocation(b, loc)
                - this.getDistanceBetweenStarAndLocation(a, loc);
        });
    
        return sorted.slice(0, amount);
    }

    getMaxGalaxyDiameter(locations: Location[]) {
        const diameter = this.getGalaxyDiameter(locations);

        return diameter.x > diameter.y ? diameter.x : diameter.y;
    }

    getGalaxyDiameter(locations: Location[]) {
        let xArray = locations.map((location) => { return location.x; });
        let yArray = locations.map((location) => { return location.y; });

        let maxX = Math.max(...xArray);
        let maxY = Math.max(...yArray);

        let minX = Math.min(...xArray);
        let minY = Math.min(...yArray);

        return {
            x: maxX - minX,
            y: maxY - minY
        };
    }

    getGalacticCenter(): Location {
        return {
            x: 0,
            y: 0
        };
    }
    
};
