module.exports = class StandardMapService {

    constructor(randomService, starService, starNameService, starDistanceService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starNameService = starNameService;
        this.starDistanceService = starDistanceService;
    }

    generate(starCount) {
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

};
