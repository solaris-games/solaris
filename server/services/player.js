const mongoose = require('mongoose');

const colours = require('../config/game/colours');

module.exports = class PlayerService {
    
    constructor(randomService, mapService, starService, carrierService, starDistanceService) {
        this.randomService = randomService;
        this.mapService = mapService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.starDistanceService = starDistanceService;
    }

    createEmptyPlayer(gameSettings, colour) {
        return {
            _id: mongoose.Types.ObjectId(),
            userId: null,
            alias: 'Empty Slot',
            colour: colour,
            cash: gameSettings.player.startingCash,
            carriers: [],
            research: {
                terraforming: { level: gameSettings.technology.startingTechnologyLevel.terraforming },
                experimentation: { level: gameSettings.technology.startingTechnologyLevel.experimentation },
                scanning: { level: gameSettings.technology.startingTechnologyLevel.scanning },
                hyperspace: { level: gameSettings.technology.startingTechnologyLevel.hyperspace },
                manufacturing: { level: gameSettings.technology.startingTechnologyLevel.manufacturing },
                banking: { level: gameSettings.technology.startingTechnologyLevel.banking },
                weapons: { level: gameSettings.technology.startingTechnologyLevel.weapons }
            }
        };
    }

    // TODO: This needs to be refactored to not rely on objects being passed in as parameters
    createEmptyPlayers(gameSettings, allStars) {
        let players = [];

        let minDistance = this.calculateStartingDistance(gameSettings, allStars);

        for(let i = 0; i < gameSettings.general.playerLimit; i++) {
            // Set the players colour based on their index position in the array.
            let colour = colours[i];

            let player = this.createEmptyPlayer(gameSettings, colour);

            let isTooClose = false;
        
            // Find a starting position for the player by picking a random
            // home star.
            let homeStar;

            do {
                homeStar = allStars[this.randomService.getRandomNumberBetween(0, allStars.length - 1)]; // star length - 1 because between is inclusive

                isTooClose = this.isTooCloseStartingPosition(minDistance, homeStar, allStars);
            }
            while (homeStar.ownedByPlayerId || isTooClose);

            // Set up the home star
            this.starService.setupHomeStar(homeStar, player, gameSettings);

            // Create a carrier for the home star.
            let homeCarrier = this.carrierService.createAtStar(homeStar);

            player.carriers.push(homeCarrier);

            // Get X closest stars to the home star and also give those to
            // the player.
            let closestStarsToHome = this.starDistanceService.getClosestUnownedStars(homeStar, allStars, gameSettings.player.startingStars - 1);

            // Set up the closest stars.
            closestStarsToHome.forEach(s => {
                s.ownedByPlayerId = player._id;
                s.garrison = gameSettings.player.startingShips;
            });

            players.push(player);
        }

        return players;
    }

    calculateTotalShipsForPlayer(stars, player) {
        let ownedStars = this.starService.listStarsOwnedByPlayer(stars, player._id);

        return ownedStars.reduce((sum, s) => sum + s.garrison, 0) 
            + player.carriers.reduce((sum, c) => sum + c.ships, 0);
    }

    isTooCloseStartingPosition(distanceAllowed, homeStar, stars) {
        let closestStar = this.starDistanceService.getClosestOwnedStars(homeStar, stars, 1)[0];
    
        // If there is no closest owned star then we're all good, no need to check.
        if (!closestStar)
            return false;
    
        let distanceToClosest = this.starDistanceService.getDistanceBetweenStars(homeStar, closestStar);
        
        return distanceToClosest < distanceAllowed;
    }
    
    calculateStartingDistance(gameSettings, stars) {
        let galaxyDiameter = this.mapService.getGalaxyDiameter(stars);
        let playerCount = gameSettings.general.playerLimit;
        let minDistance;
    
        switch (gameSettings.galaxy.startingDistance) {
            case 'close': minDistance = galaxyDiameter / (playerCount * 4); break;
            case 'medium': minDistance = galaxyDiameter / (playerCount * 2); break;
            case 'far': minDistance = galaxyDiameter / playerCount; break;
        }
    
        return minDistance;
    }

}
