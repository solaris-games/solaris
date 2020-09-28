module.exports = class StarDistanceService {

    constructor(distanceService) {
        this.distanceService = distanceService;
    }

    getDistanceBetweenStars(star1, star2) {
        return this.distanceService.getDistanceBetweenLocations(star1.location, star2.location);
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
    
};
