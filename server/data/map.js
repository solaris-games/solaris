const starHelper = require('./star');

function isDuplicateStarPosition(star, stars) {
    const samePositionStars = 
        stars.filter((star2) => {
            return star.location.x === star2.location.x
                && star.location.y === star2.location.y;
        });

    return samePositionStars.length > 0;
}

module.exports = {

    DISTANCES: {
        LIGHT_YEAR: 10
    },
    
    generateStars(starCount) {
        const stars = [];

        // Circle universe.
        // number of stars * ly distance / 2
        const maxRadius = (starCount * module.exports.DISTANCES.LIGHT_YEAR) / 2;

        const starNames = starHelper.getRandomStarNames(starCount);

        let index = 0;

        do {
            const starName = starNames[index];
            
            const star = starHelper.generateUnownedStar(starName, maxRadius);

            if (isDuplicateStarPosition(star, stars))
                continue;

            let isTooClose = false;

            // Stars must be at least 3 ly away from eachother.
            for(let i = 0; i < stars.length; i++) {
                let otherStar = stars[i];
                const distance = module.exports.getDistanceBetweenStars(star, otherStar);

                if (distance < module.exports.DISTANCES.LIGHT_YEAR * 3) {
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
        module.exports.sanitizeStarPositions(stars);

        return stars;
    },

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
    },

    getDistanceBetweenStars(star1, star2) {
        let xs = star2.location.x - star1.location.x,
            ys = star2.location.y - star1.location.y;

        xs *= xs;
        ys *= ys;

        return Math.sqrt(xs + ys);
    },

    getClosestStar(star, stars) {
        return module.exports.getClosestStars(star, stars, 1)[0];
    },

    getClosestStars(star, stars, amount) {
        return stars
            .filter(s => s._id !== star._id) // Exclude the current star.
            .sort((a, b) => {
                return module.exports.getDistanceBetweenStars(star, a)
                    - module.exports.getDistanceBetweenStars(star, b);
            })
            .splice(0, amount); // Splice 1 ignores the first star because it will be the current star.
    },

    getClosestUnownedStars(star, stars, amount) {
        return stars
            .filter(s => s._id !== star._id) // Exclude the current star.
            .filter(s => !s.ownedByPlayerId)
            .sort((a, b) => {
                return module.exports.getDistanceBetweenStars(star, a)
                    - module.exports.getDistanceBetweenStars(star, b);
            })
            .splice(0, amount);
    },

    getClosestOwnedStars(star, stars, amount) {
        return stars
            .filter(s => s._id !== star._id) // Exclude the current star.
            .filter(s => s.ownedByPlayerId)
            .sort((a, b) => {
                return module.exports.getDistanceBetweenStars(star, a)
                    - module.exports.getDistanceBetweenStars(star, b);
            })
            .splice(0, amount);
    },

    getScanningDistance(scanning) {
        return ((scanning || 1) + 4) * module.exports.DISTANCES.LIGHT_YEAR;
    }

};
