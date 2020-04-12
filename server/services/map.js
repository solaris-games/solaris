module.exports = class MapService {

    constructor(randomService, starService, distanceService, starDistanceService, starNameService) {
        this.randomService = randomService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.starNameService = starNameService;
    }

    generateStars(starCount) {
        const stars = [];

        // Circle universe.
        const maxRadius = starCount * Math.PI;

        // Get an array of random star names for however many stars we want.
        const starNames = this.starNameService.getRandomStarNames(starCount);

        let index = 0;

        // To generate stars we do the following:
        // - Create a star at a random angle and distance from the current position
        // - Then pick a random star in the list of stars to be the new origin position.
        // - Repeat until we have created all of the required stars.
        let currentOrigin = {
            x: 0,
            y: 0
        };

        do {            
            const starName = starNames[index];
            
            const star = this.starService.generateUnownedStar(starName, 
                currentOrigin.x, currentOrigin.y);

            if (this.isStarADuplicatePosition(star, stars))
                continue;

            // Stars must not be too close to eachother.
            if (this.isStarTooCloseToOthers(star, stars))
                continue;

            stars.push(star);

            // Pick a new origin from a random star.
            currentOrigin = stars[this.randomService.getRandomNumberBetween(0, stars.length - 1)].location;

            index++;
        } while (stars.length < starCount);

        return stars;
    }

    isStarADuplicatePosition(star, stars) {
        return this.starDistanceService.isDuplicateStarPosition(star, stars);
    }

    isStarTooCloseToOthers(star, stars) {
        return stars.find(s => 
            this.starDistanceService.isStarTooClose(star, s)) != null;
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

    getGalaxyDiameter(stars) {
        let maxX = stars.sort((a, b) => b.location.x - a.location.x)[0].location.x;
        let maxY = stars.sort((a, b) => b.location.y - a.location.y)[0].location.y;
        let minX = stars.sort((a, b) => a.location.x - b.location.x)[0].location.x;
        let minY = stars.sort((a, b) => a.location.y - b.location.y)[0].location.y;

        return {
            x: Math.abs(minX) + Math.abs(maxX),
            y: Math.abs(minY) + Math.abs(maxY),
        };
    }

    getGalaxyCenter(stars) {
        let maxX = stars.sort((a, b) => b.location.x - a.location.x)[0].location.x;
        let maxY = stars.sort((a, b) => b.location.y - a.location.y)[0].location.y;
        let minX = stars.sort((a, b) => a.location.x - b.location.x)[0].location.x;
        let minY = stars.sort((a, b) => a.location.y - b.location.y)[0].location.y;

        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        };
    }

};
