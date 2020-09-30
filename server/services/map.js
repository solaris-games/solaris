const ValidationError = require("../errors/validation");

module.exports = class MapService {

    constructor(randomService, starService, starDistanceService, nameService, 
        circularMapService, spiralMapService, doughnutMapService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.nameService = nameService;
        this.circularMapService = circularMapService;
        this.spiralMapService = spiralMapService;
        this.doughnutMapService = doughnutMapService;
    }

    generateStars(game, starCount, playerLimit, warpGatesSetting) {
        const stars = [];

        // Get an array of random star names for however many stars we want.
        const starNames = this.nameService.getRandomStarNames(starCount);

        // Generate all of the locations for stars.
        let starLocations = [];

        switch (game.settings.galaxy.galaxyType) {
            case 'circular': 
                starLocations = this.circularMapService.generateLocations(game, starCount);
                break;
            case 'spiral': 
                starLocations = this.spiralMapService.generateLocations(game, starCount);
                break;
            case 'doughnut': 
                starLocations = this.doughnutMapService.generateLocations(game, starCount);
                break;
            default:
                throw new ValidationError(`Galaxy type ${game.settings.galaxy.galaxyType} is not supported or has been disabled.`);
        }

        // Iterate over all star locations
        for (let i = 0; i < starLocations.length; i++) {
            let starLocation = starLocations[i];

            let loc = {
                x: starLocation.x,
                y: starLocation.y
            };

            const star = this.starService.generateUnownedStar(game, starNames[i], loc, starLocation.resources);

            stars.push(star);
        }

        // If warp gates are enabled, assign random stars to start as warp gates.
        if (warpGatesSetting !== 'none') {
            this.generateGates(stars, warpGatesSetting, playerLimit);
        }

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

    getGalaxyDiameter(stars) {
        let maxX = stars.sort((a, b) => b.x - a.x)[0].x;
        let maxY = stars.sort((a, b) => b.y - a.y)[0].y;
        let minX = stars.sort((a, b) => a.x - b.x)[0].x;
        let minY = stars.sort((a, b) => a.y - b.y)[0].y;

        return {
            x: Math.abs(minX) + Math.abs(maxX),
            y: Math.abs(minY) + Math.abs(maxY),
        };
    }

    getGalaxyCenter(starLocations) {
        let maxX = starLocations.sort((a, b) => b.x - a.x)[0].x;
        let maxY = starLocations.sort((a, b) => b.y - a.y)[0].y;
        let minX = starLocations.sort((a, b) => a.x - b.x)[0].x;
        let minY = starLocations.sort((a, b) => a.y - b.y)[0].y;

        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        };
    }

    getGalaxyCenterOfMass(starLocations) {
        let totalX = starLocations.reduce((total, s) => total += s.x, 0);
        let totalY = starLocations.reduce((total, s) => total += s.y, 0);

        return {
            x: totalX / starLocations.length,
            y: totalY / starLocations.length,
        };
    }

};
