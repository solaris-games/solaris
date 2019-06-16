const mongoose = require('mongoose');

const colours = require('./db/misc/colours');
const random = require('./random');

const mapHelper = require('./map');
const starHelper = require('./star');
const carrierHelper = require('./carrier');

const Player = require('./db/models/schemas/player');

function isTooCloseStartingPosition(homeStar, stars) {
    let closestStar = mapHelper.getClosestOwnedStars(homeStar, stars, 1)[0];
    let distanceToClosest = mapHelper.getDistanceBetweenStars(homeStar, closestStar);
    
    return distanceToClosest > 1000;
}

module.exports = {
    
    createEmptyPlayer(gameSettings) {
        return {
            _id: mongoose.Types.ObjectId(),
            userId: null,
            alias: 'Empty Slot',
            cash: gameSettings.player.startingCash,
            carriers: []
        };
    },

    createEmptyPlayers(gameSettings, allStars) {
        let players = [];

        for(let i = 0; i < gameSettings.general.playerLimit; i++) {
            player = module.exports.createEmptyPlayer(gameSettings);

            // Set the players colour based on their index position in the array.
            player.colour = colours[i];

            // Find a starting position for the player by picking a random
            // home star.
            let homeStar;

            do {
                homeStar = allStars[random.getRandomNumberBetween(0, allStars.length)];
            }
            while (homeStar.ownedByPlayerId 
                && !isTooCloseStartingPosition(homeStar, allStars));

            // Set up the home star
            homeStar.ownedByPlayerId = player._id;
            homeStar.garrison = gameSettings.player.startingShips;
            homeStar.naturalResources = starHelper.DEFAULTS.MAX_NATURAL_RESOURCES; // Home stars should always get max resources.
            
            // ONLY the home star gets the starting infrastructure.
            homeStar.economy = gameSettings.player.startingInfrastructure.economy;
            homeStar.industry = gameSettings.player.startingInfrastructure.industry;
            homeStar.science = gameSettings.player.startingInfrastructure.science;

            // Create a carrier for the home star.
            let homeCarrier = carrierHelper.createAtStar(homeStar);

            player.carriers.push(homeCarrier);

            // Get X closest stars to the home star and also give those to
            // the player.
            let closestStarsToHome = mapHelper.getClosestUnownedStars(homeStar, allStars, gameSettings.player.startingStars - 1);

            // Set up the closest stars.
            closestStarsToHome.forEach(s => {
                s.ownedByPlayerId = player._id;
                s.garrison = gameSettings.player.startingShips;
            });

            players.push(player);
        }

        return players;
    }
    
}