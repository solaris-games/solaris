const mongoose = require('mongoose');

const colours = require('../config/game/colours');

const RandomService = require('./random');
const MapService = require('./map');
const StarService = require('./star');
const CarrierService = require('./carrier');

function isTooCloseStartingPosition(distanceAllowed, homeStar, stars) {
    let closestStar = this.mapService.getClosestOwnedStars(homeStar, stars, 1)[0];

    // If there is no closest owned star then we're all good, no need to check.
    if (!closestStar)
        return false;

    let distanceToClosest = this.mapService.getDistanceBetweenStars(homeStar, closestStar);
    
    return distanceToClosest < distanceAllowed;
}

function calculateStartingDistance(gameSettings, stars) {
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

module.exports = class PlayerService {
    
    constructor() {
        this.randomService = new RandomService();
        this.mapService = new MapService();
        this.starService = new StarService();
        this.carrierService = new CarrierService();
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

    createEmptyPlayers(gameSettings, allStars) {
        let players = [];

        let minDistance = calculateStartingDistance(gameSettings, allStars);

        for(let i = 0; i < gameSettings.general.playerLimit; i++) {
            // Set the players colour based on their index position in the array.
            let colour = colours[i];

            player = this.createEmptyPlayer(gameSettings, colour);

            let isTooClose = false;
        
            // Find a starting position for the player by picking a random
            // home star.
            let homeStar;

            do {
                homeStar = allStars[this.randomService.getRandomNumberBetween(0, allStars.length)];

                isTooClose = isTooCloseStartingPosition(minDistance, homeStar, allStars);
            }
            while (homeStar.ownedByPlayerId || isTooClose);

            // Set up the home star
            this.starService.setupHomeStar(homeStar, player, gameSettings);

            // Create a carrier for the home star.
            let homeCarrier = this.carrierService.createAtStar(homeStar);

            player.carriers.push(homeCarrier);

            // Get X closest stars to the home star and also give those to
            // the player.
            let closestStarsToHome = this.mapService.getClosestUnownedStars(homeStar, allStars, gameSettings.player.startingStars - 1);

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

}