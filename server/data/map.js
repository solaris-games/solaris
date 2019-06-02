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
    
    generateStars(starCount) {
        const stars = [];

        const maxXY = starCount * 3; // Square universe.

        const starNames = starHelper.getRandomStarNames(starCount);

        let index = 0;

        do {
            const starName = starNames[index];
            
            const star = starHelper.generateUnownedStar(starName, maxXY, maxXY);

            if (isDuplicateStarPosition(star, stars)) {
                continue;
            }

            stars.push(star);

            index++;
        } while (stars.length < starCount);

        return stars;
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
        return stars.sort((a, b) => {
            return module.exports.getDistanceBetweenStars(star, a)
                - module.exports.getDistanceBetweenStars(star, b);
        })
        .splice(1, amount);
    }

};
