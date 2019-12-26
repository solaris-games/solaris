const mongoose = require('mongoose');

const colours = require('./db/misc/colours');
const random = require('./random');

const mapHelper = require('./map');
const starHelper = require('./star');
const carrierHelper = require('./carrier');

function isTooCloseStartingPosition(distanceAllowed, homeStar, stars) {
    let closestStar = mapHelper.getClosestOwnedStars(homeStar, stars, 1)[0];

    // If there is no closest owned star then we're all good, no need to check.
    if (!closestStar)
        return false;

    let distanceToClosest = mapHelper.getDistanceBetweenStars(homeStar, closestStar);
    
    return distanceToClosest < distanceAllowed;
}

function calculateStartingDistance(gameSettings, stars) {
    let galaxyDiameter = mapHelper.getGalaxyDiameter(stars);
    let playerCount = gameSettings.general.playerLimit;
    let minDistance;

    switch (gameSettings.galaxy.startingDistance) {
        case 'close': minDistance = galaxyDiameter / (playerCount * 4); break;
        case 'medium': minDistance = galaxyDiameter / (playerCount * 2); break;
        case 'far': minDistance = galaxyDiameter / playerCount; break;
    }

    return minDistance;
}

module.exports = {
    
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
    },

    createEmptyPlayers(gameSettings, allStars) {
        let players = [];

        let minDistance = calculateStartingDistance(gameSettings, allStars);

        for(let i = 0; i < gameSettings.general.playerLimit; i++) {
            // Set the players colour based on their index position in the array.
            let colour = colours[i];

            player = module.exports.createEmptyPlayer(gameSettings, colour);

            let isTooClose = false;
        
            // Find a starting position for the player by picking a random
            // home star.
            let homeStar;

            do {
                homeStar = allStars[random.getRandomNumberBetween(0, allStars.length)];

                isTooClose = isTooCloseStartingPosition(minDistance, homeStar, allStars);
            }
            while (homeStar.ownedByPlayerId || isTooClose);

            // Set up the home star
            starHelper.setupHomeStar(homeStar, player, gameSettings);

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
    },

    calculateTotalShipsForPlayer(stars, player) {
        let ownedStars = starHelper.listStarsOwnedByPlayer(stars, player._id);

        return ownedStars.reduce((sum, s) => sum + s.garrison, 0) 
            + player.carriers.reduce((sum, c) => sum + c.ships, 0);
    },

    research: {
        updateResearchNow(gameId, userId, preference, callback) {
            gameHelper.getByIdAll(gameId, (err, game) => {
                if (err) {
                    return callback(err);
                }
    
                // Get the user's player and update their research preference.
                let userPlayer = game.galaxy.players.find(p => p.userId === userId);
    
                userPlayer.researchingNow = preference;
    
                game.save((err, doc) => {
                    if (err) {
                        return callback(err);
                    }
    
                    return callback(null);
                });
            });
        },
    
        updateResearchNext(gameId, userId, preference, callback) {
            gameHelper.getByIdAll(gameId, (err, game) => {
                if (err) {
                    return callback(err);
                }
    
                // Get the user's player and update their research preference.
                let userPlayer = game.galaxy.players.find(p => p.userId === userId);
    
                userPlayer.researchingNext = preference;
    
                game.save((err, doc) => {
                    if (err) {
                        return callback(err);
                    }
    
                    return callback(null);
                });
            });
        }
    }

}