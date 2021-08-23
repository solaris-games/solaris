const ValidationError = require("../errors/validation");

module.exports = class MapService {

    constructor(randomService, starService, starDistanceService, nameService,
        circularMapService, spiralMapService, doughnutMapService, circularBalancedMapService, irregularMapService, customMapService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.nameService = nameService;
        this.circularMapService = circularMapService;
        this.spiralMapService = spiralMapService;
        this.doughnutMapService = doughnutMapService;
        this.circularBalancedMapService = circularBalancedMapService;
        this.irregularMapService = irregularMapService;
        this.customMapService = customMapService;
    }

    generateStars(game, starCount, playerLimit, warpGatesSetting) {
        let stars = [];

        // Get an array of random star names for however many stars we want.
        const starNames = this.nameService.getRandomStarNames(starCount);

        // Generate all of the locations for stars.
        let starLocations = [];

        switch (game.settings.galaxy.galaxyType) {
            case 'circular':
                starLocations = this.circularMapService.generateLocations(game, starCount, game.settings.specialGalaxy.resourceDistribution);
                break;
            case 'spiral':
                starLocations = this.spiralMapService.generateLocations(game, starCount, game.settings.specialGalaxy.resourceDistribution);
                break;
            case 'doughnut':
                starLocations = this.doughnutMapService.generateLocations(game, starCount, game.settings.specialGalaxy.resourceDistribution);
                break;
            case 'circular-balanced':
                starLocations = this.circularBalancedMapService.generateLocations(game, starCount, game.settings.specialGalaxy.resourceDistribution, playerLimit);
                break;
            case 'irregular':
                starLocations = this.irregularMapService.generateLocations(game, starCount, game.settings.specialGalaxy.resourceDistribution, playerLimit);
                break;
            case 'custom':
                return this.customMapService.generateLocations(game, starCount, playerLimit)
            default:
                throw new ValidationError(`Galaxy type ${game.settings.galaxy.galaxyType} is not supported or has been disabled.`);
        }

        // Iterate over all star locations
        let starNamesIndex = 0;

        let unlinkedStars = starLocations.filter(l => !l.linked);

        for (let i = 0; i < unlinkedStars.length; i++) {
            let starLocation = unlinkedStars[i];

            let loc = {
                x: starLocation.x,
                y: starLocation.y
            };

            let star = this.starService.generateUnownedStar(game, starNames[starNamesIndex++], loc, starLocation.resources);

            stars.push(star);

            if (starLocation.homeStar) {
                let linkedStars = [];

                for (let linkedLocation of starLocation.linkedLocations) {
                    let linkedStar = this.starService.generateUnownedStar(game, starNames[starNamesIndex++], linkedLocation, linkedLocation.resources);
                    stars.push(linkedStar);
                    linkedStars.push(linkedStar._id);
                }

                game.galaxy.homeStars.push(star._id)
                game.galaxy.linkedStars.push(linkedStars);
            }
        }

        // If warp gates are enabled, assign random stars to start as warp gates.
        if (warpGatesSetting !== 'none') {
            this.generateGates(stars, warpGatesSetting, playerLimit);
        }

        return stars;
    }

    generateGates(stars, type, playerCount) {
        let gateCount = 0;

        switch (type) {
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
        if (!starLocations.length) {
            return {
                x: 0,
                y: 0
            };
        }

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
        if (!starLocations.length) {
            return {
                x: 0,
                y: 0
            };
        }

        let totalX = starLocations.reduce((total, s) => total += s.x, 0);
        let totalY = starLocations.reduce((total, s) => total += s.y, 0);

        return {
            x: totalX / starLocations.length,
            y: totalY / starLocations.length,
        };
    }

};
