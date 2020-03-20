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

        // TODO: Do we have to do this here? Can the star service take care of it?
        const starNames = this.starNameService.getRandomStarNames(starCount);

        let index = 0;

        do {
            // TODO: Figure out how to randomize resources and weight them.
            // so that we can configure sparse, standard and plentiful resources.
            
            const starName = starNames[index];
            
            const star = this.starService.generateUnownedStar(starName, maxRadius);

            if (this.isStarADuplicatePosition(star, stars))
                continue;

            // Stars must not be too close to eachother.
            if (this.isStarTooCloseToOthers(star, stars))
                continue;

            stars.push(star);

            index++;
        } while (stars.length < starCount);

        // We need to sanitize all star positions to make sure that all
        // x's and y's are positive integers otherwise rendering is a bitch.
        this.starDistanceService.sanitizeStarPositions(stars);

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
        let starLocations = stars.map(s => s.location);

        // Calculate the furthest distance between two stars, that's the diameter.
        let diameter = stars.reduce((distance, star) => {
            let furthest = this.distanceService.getFurthestLocation(star.location, starLocations);
            let newDistance = this.distanceService.getDistanceBetweenLocations(star.location, furthest);

            if (newDistance > distance) {
                distance = newDistance;
            }

            return distance;
        }, 0);

        return diameter;
    }

};
