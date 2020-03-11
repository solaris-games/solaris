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

    getClosestOwnedStars(star, stars, amount) {
        let sorted = stars
            .filter(s => s._id !== star._id) // Exclude the current star.
            .filter(s => s.ownedByPlayerId)
            .sort((a, b) => {
                return this.getDistanceBetweenStars(star, a)
                    - this.getDistanceBetweenStars(star, b);
            });

        return sorted.slice(0, amount);
    }

    isStarTooClose(star, otherStar) {
        const distance = this.distanceService.getDistanceBetweenStars(star, otherStar);

        return distance < this.distanceService.DISTANCES.MIN_DISTANCE_BETWEEN_STARS;
    }

    isDuplicateStarPosition(star, stars) {
        const samePositionStars = 
            stars.filter((star2) => {
                return star.location.x === star2.location.x
                    && star.location.y === star2.location.y;
            });
    
        return samePositionStars.length > 0;
    }

    sanitizeStarPositions(stars) {
        // TODO: Use Math.floor
        
        // Get the min X and min Y and add them onto all stars.
        // This will ensure that all stars have a positive x and y coordinate.
        let minX = stars.sort((a, b) => a.location.x - b.location.x)[0].location.x;
        let minY = stars.sort((a, b) => a.location.y - b.location.y)[0].location.y;

        if (minX < 0) minX *= -1;
        if (minY < 0) minY *= -1;

        for(let i = 0; i < stars.length; i++) {
            let star = stars[i];
            star.location.x += minX;
            star.location.y += minY;
        }
    }
};
