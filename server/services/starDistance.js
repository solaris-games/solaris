module.exports = class StarDistanceService {

    constructor(distanceService) {
        this.distanceService = distanceService;
    }

    getDistanceBetweenStars(star1, star2) {
        return this.distanceService.getDistanceBetweenLocations(star1.location, star2.location);
    }

    getDistanceBetweenStarAndLocation(star, loc){
        return this.distanceService.getDistanceBetweenLocations(star.location, loc);
    }

    getClosestStar(star, stars) {
        return this.getClosestStars(star, stars, 1)[0];
    }

    getDistanceToClosestStar(star, stars) {
        let closest = this.getClosestStar(star, stars);

        return this.distanceService.getDistanceBetweenLocations(star.location, closest.location);
    }

    getClosestStars(star, stars, amount) {
        let sorted = stars
            .filter(s => s._id !== star._id) // Exclude the current star.
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });
        
        return sorted.slice(0, amount); // Slice 1 ignores the first star because it will be the current star.
    }

    getClosestUnownedStars(star, stars, amount) {
        let sorted = stars
            .filter(s => s._id !== star._id) // Exclude the current star.
            .filter(s => !s.ownedByPlayerId)
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });

        return sorted.slice(0, amount);
    }

    getClosestUnownedStar(star, stars) {
        return this.getClosestUnownedStars(star, stars, 1)[0];
    }

    getClosestOwnedStars(star, stars) {
        return stars
            .filter(s => s._id !== star._id) // Exclude the current star.
            .filter(s => s.ownedByPlayerId)
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });
    }

    getClosestPlayerOwnedStars(star, stars, player) {
        return this.getClosestOwnedStars(star, stars)
            .filter(s => s.ownedByPlayerId.equals(player._id));
    }

    getClosestPlayerOwnedStarsFromLocation(location, stars, ownedByPlayerId) {
        let sorted = stars
            .filter(s => s.ownedByPlayerId && s.ownedByPlayerId.equals(ownedByPlayerId))
            .sort((a, b) => {
                let star = {
                    location
                };

                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });

        return sorted;
    }

    getClosestPlayerOwnedStarsFromLocationWithinDistance(location, stars, ownedByPlayerId, maxDistance) {
        let sorted = stars
            .filter(s => s.ownedByPlayerId && s.ownedByPlayerId.equals(ownedByPlayerId))
            .filter(s => {
                let locationStar = { location };

                let distance = this.getDistanceBetweenStars(locationStar, s);
                
                return maxDistance >= distance;
            })
            .sort((a, b) => {
                let locationStar = { location };

                return this.getDistanceBetweenStars(locationStar, a) - this.getDistanceBetweenStars(locationStar, b);
            });

        return sorted;
    }

    getClosestUnownedStarsFromLocation(location, stars, amount) {
        let sorted = stars
            .filter(s => !s.ownedByPlayerId)
            .sort((a, b) => {
                let star = {
                    location
                };

                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });

        return sorted.slice(0, amount);
    }

    getClosestUnownedStarFromLocation(location, stars) {
        return this.getClosestUnownedStarsFromLocation(location, stars, 1)[0];
    }

    isStarTooClose(game, star, otherStar) {
        return this.isStarLocationTooClose(game, star.location, otherStar);
    }

    isStarLocationTooClose(game, location, otherStar) {
        return this.isLocationTooClose(game, location, otherStar.location);
    }

    isLocationTooClose(game, location, otherLocation) {
        const distance = this.distanceService.getDistanceBetweenLocations(location, otherLocation);

        return distance < game.constants.distances.minDistanceBetweenStars;
    }

    isDuplicateStarPosition(location, stars) {
        const samePositionStars = 
            stars.filter((star2) => {
                return location.x === star2.location.x
                    && location.y === star2.location.y;
            });
    
        return samePositionStars.length > 0;
    }

    getClosestStarFromLocation(loc, stars){
        return this.getClosestStarsFromLocation(loc, stars, 1);
    }

    getClosestStarsFromLocation(loc, stars, amount){
        let sorted = stars
        .sort((a, b) => {
            return this.getDistanceBetweenStarAndLocation(a, loc)
                - this.getDistanceBetweenStarAndLocation(b, loc);
        });
    
        return sorted.slice(0, amount); 
    }

    getFurthestStar(star, stars) {
        return this.getFurthestStars(star, stars, 1)[0];
    }

    getFurthestStars(star, stars, amount) {
        let sorted = stars
            .filter(s => s._id !== star._id) // Exclude the current star.
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, b)
                    - this.getDistanceBetweenStars(star, a);
            });
        
        return sorted.slice(0, amount); // Slice 1 ignores the first star because it will be the current star.
    }

    getDistanceToFurthestStar(star, stars) {
        let furthest = this.getFurthestStar(star, stars);

        return this.distanceService.getDistanceBetweenLocations(star.location, furthest.location);
    }

    getFurthestStarFromLocation(loc, stars){
        return this.getFurthestStarsFromLocation(loc, stars, 1)[0];
    }

    getFurthestStarsFromLocation(loc, stars, amount){
        let sorted = stars
        .sort((a, b) => {
            return this.getDistanceBetweenStarAndLocation(b, loc)
                - this.getDistanceBetweenStarAndLocation(a, loc);
        });
    
        return sorted.slice(0, amount);
    }

    getMaxGalaxyDiameter(stars, galacticCenter) {
        // galacticCenter = galacticCenter || {x: 0, y: 0};

        // const star = this.starDistanceService.getFurthestStarFromLocation(galacticCenter, stars);

        // return 2 * this.starDistanceService.getDistanceBetweenStarAndLocation(star, galacticCenter);

        // TODO: Is this the same as the above?
        const locations = stars.map(s => s.location);
        const diameter = this.getGalaxyDiameter(locations);

        return diameter.x > diameter.y ? diameter.x : diameter.y;
    }

    getGalaxyDiameter(locations) {
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
    
};
