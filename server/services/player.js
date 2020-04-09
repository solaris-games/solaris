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

        // Divide the galaxy into equal chunks, each player will spawned
        // at near equal distance from the center of the galaxy.
        // Note: This logic assumes that the center of the galaxy is position 0,0
        const distanceFromCenter = this.mapService.getGalaxyDiameter(allStars) / 2 / 2;
        const incrementAngle = 360 / (gameSettings.general.playerLimit);
        let currentAngle = 0;

        // Create each player starting at angle 0 at a distance of half the galaxy radius
        for(let i = 0; i < gameSettings.general.playerLimit; i++) {
            // Set the players colour based on their index position in the array.
            let colour = colours[i];

            let player = this.createEmptyPlayer(gameSettings, colour);

            // Get the desired player starting location.
            // TODO: Seems to generate maps correctly but is this correct?
            let startingLocation = {
                x: distanceFromCenter * Math.cos(currentAngle),
                y: distanceFromCenter * Math.sin(currentAngle)
            }

            currentAngle += incrementAngle;

            // Find the star that is closest to this location, that will be the player's home star.
            let homeStar = this.starDistanceService.getClosestUnownedStarFromLocation(startingLocation, allStars);

            // Set up the home star
            this.starService.setupHomeStar(homeStar, player, gameSettings);

            players.push(player);
        }

        // Now that all players have a home star, the fairest way to distribute stars to players is to
        // iterate over each player and give them 1 star at a time, this is arguably the fairest way
        // otherwise we'll end up with the last player potentially having a really bad position as their
        // stars could be miles away from their home star.
        let starsToDistribute = gameSettings.player.startingStars - 1;

        while (starsToDistribute--) {
            for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
                let player = players[playerIndex];
                let homeStar = allStars.find(s => player.homeStarId == s._id);

                // Get X closest stars to the home star and also give those to
                // the player.
                let s = this.starDistanceService.getClosestUnownedStar(homeStar, allStars);

                // Set up the closest star.
                s.ownedByPlayerId = player._id;
                s.garrison = gameSettings.player.startingShips;
            }
        }

        return players;
    }

    createEmptyPlayerCarriers(allStars, players) {
        let carriers = [];

        for (let i = 0; i < players.length; i++) {
            let player = players[i];

            let homeStar = this.starService.getPlayerHomeStar(allStars, player._id);

            if (!homeStar) {
                throw new Error('The player must have a home star in order to set up a carrier');
            }

            // Create a carrier for the home star.
            let homeCarrier = this.carrierService.createAtStar(homeStar);

            carriers.push(homeCarrier);
        }

        return carriers;
    }

    calculateTotalShipsForPlayer(stars, carriers, player) {
        let ownedStars = this.starService.listStarsOwnedByPlayer(stars, player._id);
        let ownedCarriers = this.carrierService.listCarriersOwnedByPlayer(carriers, player._id);

        return ownedStars.reduce((sum, s) => sum + s.garrison, 0) 
            + ownedCarriers.reduce((sum, c) => sum + c.ships, 0);
    }

}
