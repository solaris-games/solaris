const mongoose = require('mongoose');

const random = require('./random');
const mapHelper = require('./map');

const Player = require('./db/models/schemas/player');

module.exports = {
    
    createEmptyPlayer(gameSettings) {
        return {
            _id: mongoose.Types.ObjectId(),
            userId: null,
            alias: '',
            cash: gameSettings.player.startingCash
        };
    },

    createEmptyPlayers(gameSettings, allStars) {
        let players = [];

        for(let i = 0; i < gameSettings.general.playerLimit; i++) {
            player = module.exports.createEmptyPlayer(gameSettings);

            // Find a starting position for the player by picking a random
            // home star.
            let homeStar;

            do {
                homeStar = allStars[random.getRandomNumberBetween(0, allStars.length)];
            }
            while (homeStar.ownedByPlayerId);

            // Set up the home star
            homeStar.ownedByPlayerId = player._id;
            homeStar.garrison = gameSettings.player.startingShips;
            
            // ONLY the home star gets the starting infrastructure.
            homeStar.economy = gameSettings.player.startingInfrastructure.economy;
            homeStar.industry = gameSettings.player.startingInfrastructure.industry;
            homeStar.science = gameSettings.player.startingInfrastructure.science;

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