const ValidationError = require("../errors/validation");

module.exports = class MapService {

    constructor(randomService, starService, starDistanceService, nameService, 
        circularMapService, spiralMapService, doughnutMapService, circularBalancedMapService, irregularMapService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.nameService = nameService;
        this.circularMapService = circularMapService;
        this.spiralMapService = spiralMapService;
        this.doughnutMapService = doughnutMapService;
        this.circularBalancedMapService = circularBalancedMapService;
        this.irregularMapService = irregularMapService;
    }

    generateStars(game, starCount, playerLimit) {
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
        if (game.settings.specialGalaxy.randomWarpGates) {
            this.generateGates(stars, game.settings.specialGalaxy.randomWarpGates);
        }

        // If worm holes are enabled, assign random warp gates to start as worm hole pairs
        if (game.settings.specialGalaxy.randomWormHoles) {
            this.generateWormHoles(stars, game.settings.specialGalaxy.randomWormHoles);
        }

        // If nebulas are enabled, assign random nebulas to start
        if (game.settings.specialGalaxy.randomNebulas) {
            this.generateNebulas(stars, game.settings.specialGalaxy.randomNebulas);
        }

        // If asteroid fields are enabled, assign random asteroid fields to start
        if (game.settings.specialGalaxy.randomAsteroidFields) {
            this.generateAsteroidFields(game, stars, game.settings.specialGalaxy.randomAsteroidFields);
        }

        // If black holes are enabled, assign random black holes to start
        if (game.settings.specialGalaxy.randomBlackHoles) {
            this.generateBlackHoles(game, stars, game.settings.specialGalaxy.randomBlackHoles);
        }
        
        return stars;
    }

    generateGates(stars, percentage) {
        let gateCount = Math.floor(stars.length / 100 * percentage);

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

    generateWormHoles(stars, percentage) {
        let wormHoleCount = Math.floor(stars.length / 2 / 100 * percentage); // Worm homes come in pairs so its half of stars

        // Pick stars at random and pair them up with another star to create a worm hole.
        while (wormHoleCount--) {
            const remaining = stars.filter(s => !s.wormHoleToStarId);

            let starA = remaining[this.randomService.getRandomNumberBetween(0, remaining.length - 1)];
            let starB = remaining[this.randomService.getRandomNumberBetween(0, remaining.length - 1)];

            // Check validity of the ramdom selection.
            if (starA._id.equals(starB._id) || starA.wormHoleToStarId || starB.wormHoleToStarId) {
                wormHoleCount++; // Increment because the while loop will decrement.
            } else {
                starA.wormHoleToStarId = starB._id;
                starB.wormHoleToStarId = starA._id;
            }
        }
    }

    generateNebulas(stars, percentage) {
        let count = Math.floor(stars.length / 100 * percentage);

        // Pick stars at random and set them to be nebulas
        do {
            let star = stars[this.randomService.getRandomNumberBetween(0, stars.length - 1)];

            if (star.isNebula) {
                count++; // Increment because the while loop will decrement.
            } else {
                star.isNebula = true;
            }
        } while (count--);
    }

    generateAsteroidFields(game, stars, percentage) {
        let count = Math.floor(stars.length / 100 * percentage);

        // Pick stars at random and set them to be asteroid fields
        do {
            let star = stars[this.randomService.getRandomNumberBetween(0, stars.length - 1)];

            if (star.isAsteroidField) {
                count++; // Increment because the while loop will decrement.
            } else {
                star.isAsteroidField = true;

                // Overwrite the natural resources
                let minResources = game.constants.star.resources.maxNaturalResources * 1.5;
                let maxResources = game.constants.star.resources.maxNaturalResources * 3;

                star.naturalResources = this.randomService.getRandomNumberBetween(minResources, maxResources);;
            }
        } while (count--);
    }

    generateBlackHoles(game, stars, percentage) {
        let count = Math.floor(stars.length / 100 * percentage);

        // Pick stars at random and set them to be asteroid fields
        do {
            let star = stars[this.randomService.getRandomNumberBetween(0, stars.length - 1)];

            if (star.isBlackHole) {
                count++; // Increment because the while loop will decrement.
            } else {
                star.isBlackHole = true;
                star.naturalResources = 0;
            }
        } while (count--);
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
