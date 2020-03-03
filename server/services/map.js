const StarService = require('./star');
const RandomService = require('./random');

function isDuplicateStarPosition(star, stars) {
    const samePositionStars = 
        stars.filter((star2) => {
            return star.location.x === star2.location.x
                && star.location.y === star2.location.y;
        });

    return samePositionStars.length > 0;
}

module.exports = class MapService {

    constructor() {
        this.randomService = new RandomService();
        this.starService = new StarService();
    }

    DISTANCES = {
        LIGHT_YEAR: 10,
        MIN_DISTANCE_BETWEEN_STARS: 5,
        BASE_SHIP_SPEED: 1  // 0.1 ly per tick
    }
    
    generateStars(starCount) {
        const stars = [];

        // Circle universe.
        const maxRadius = starCount * Math.PI;

        const starNames = this.starService.getRandomStarNames(starCount);

        let index = 0;

        do {
            // TODO: Figure out how to randomize resources and weight them.
            // so that we can configure sparse, standard and plentiful resources.
            
            const starName = starNames[index];
            
            const star = this.starService.generateUnownedStar(starName, maxRadius);

            if (isDuplicateStarPosition(star, stars))
                continue;

            let isTooClose = false;

            // Stars must be at least 3 ly away from eachother.
            for(let i = 0; i < stars.length; i++) {
                let otherStar = stars[i];
                const distance = this.getDistanceBetweenStars(star, otherStar);

                if (distance < this.DISTANCES.MIN_DISTANCE_BETWEEN_STARS) {
                    isTooClose = true;
                    break;
                }
            }

            if (isTooClose)
                continue;

            stars.push(star);

            index++;
        } while (stars.length < starCount);

        // We need to sanitize all star positions to make sure that all
        // x's and y's are positive integers otherwise rendering is a bitch.
        this.sanitizeStarPositions(stars);

        return stars;
    }

    generateGates(stars, type, playerCount) {
        let gateCount = 0;

        switch(type) {
            case 'rare': gateCount = playerCount; break;            // 1 per player
            case 'common': gateCount = stars.length / playerCount; break;  // fucking loads
        }

        // Pick stars at random and set them to be warp gates.
        do {
            let star = stars[this.randomService.getRandomNumberBetween(0, stars.length - 1)];

            if (star.warpGate) {
                gateCount++; // Increment because the while loop will decrement.
            } else {
                star.warpGate = true;
            }
        } while (gateCount--);
    }

    sanitizeStarPositions(stars) {
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

    getDistanceBetweenStars(star1, star2) {
        return this.getDistanceBetweenLocations(star1.location, star2.location);
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

    getGalaxyDiameter(stars) {
        let starLocations = stars.map(s => s.location);

        // Calculate the furthest distance between two stars, that's the diameter.
        let diameter = stars.reduce((distance, star) => {
            let furthest = this.getFurthestLocation(star.location, starLocations);
            let newDistance = this.getDistanceBetweenLocations(star.location, furthest);

            if (newDistance > distance) {
                distance = newDistance;
            }

            return distance;
        }, 0);

        return diameter;
    }

    getScanningDistance(scanning) {
        return ((scanning || 1) + 2) * this.DISTANCES.LIGHT_YEAR;
    }
    
    getHyperspaceDistance(hyperspace) {
        return ((hyperspace || 1) + 3) * this.DISTANCES.LIGHT_YEAR;
    }

};
