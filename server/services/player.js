const mongoose = require('mongoose');
const moment = require('moment');

module.exports = class PlayerService {
    
    constructor(randomService, mapService, starService, carrierService, starDistanceService) {
        this.randomService = randomService;
        this.mapService = mapService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.starDistanceService = starDistanceService;
    }

    getByObjectId(game, playerId) {
        return game.galaxy.players.find(p => p._id.equals(playerId));
    }

    getById(game, playerId) {
        return game.galaxy.players.find(p => p._id.toString() === playerId.toString());
    }

    getByUserId(game, userId) {
        return game.galaxy.players.find(p => p.userId.toString() === userId.toString());
    }

    createEmptyPlayer(game, colour) {
        return {
            _id: mongoose.Types.ObjectId(),
            userId: null,
            alias: 'Empty Slot',
            colour: colour,
            credits: game.settings.player.startingCredits,
            carriers: [],
            research: {
                terraforming: { level: game.settings.technology.startingTechnologyLevel.terraforming },
                experimentation: { level: game.settings.technology.startingTechnologyLevel.experimentation },
                scanning: { level: game.settings.technology.startingTechnologyLevel.scanning },
                hyperspace: { level: game.settings.technology.startingTechnologyLevel.hyperspace },
                manufacturing: { level: game.settings.technology.startingTechnologyLevel.manufacturing },
                banking: { level: game.settings.technology.startingTechnologyLevel.banking },
                weapons: { level: game.settings.technology.startingTechnologyLevel.weapons }
            }
        };
    }

    // TODO: Refactor as game already contains game settings.
    createEmptyPlayers(game, allStars) {
        let players = [];

        // Divide the galaxy into equal chunks, each player will spawned
        // at near equal distance from the center of the galaxy.

        // Calculate the center point of the galaxy as we need to add it onto the starting location.
        let galaxyCenter = this.mapService.getGalaxyCenterOfMass(allStars);

        // The desired distance from the center is half way from the galaxy center and the edge.
        const distanceFromCenter = this.mapService.getGalaxyDiameter(allStars).x / 2 / 2;

        let radians = this._getPlayerStartingLocationRadians(game.settings.general.playerLimit);

        let colours = require('../config/game/colours').slice();

        // Create each player starting at angle 0 at a distance of half the galaxy radius
        for(let i = 0; i < game.settings.general.playerLimit; i++) {
            // Get a random colour to assign to the player.
            let colour = colours.splice(this.randomService.getRandomNumber(colours.length - 1), 1)[0];

            let player = this.createEmptyPlayer(game, colour);

            // Get the player's starting location.
            let startingLocation = this._getPlayerStartingLocation(radians, galaxyCenter, distanceFromCenter);

            // Find the star that is closest to this location, that will be the player's home star.
            let homeStar = this.starDistanceService.getClosestUnownedStarFromLocation(startingLocation, allStars);

            // Set up the home star
            this.starService.setupHomeStar(game, homeStar, player, game.settings);

            players.push(player);
        }

        // Now that all players have a home star, the fairest way to distribute stars to players is to
        // iterate over each player and give them 1 star at a time, this is arguably the fairest way
        // otherwise we'll end up with the last player potentially having a really bad position as their
        // stars could be miles away from their home star.
        let starsToDistribute = game.settings.player.startingStars - 1;

        while (starsToDistribute--) {
            for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
                let player = players[playerIndex];
                let homeStar = allStars.find(s => player.homeStarId.equals(s._id));

                // Get X closest stars to the home star and also give those to
                // the player.
                let s = this.starDistanceService.getClosestUnownedStar(homeStar, allStars);

                // Set up the closest star.
                s.ownedByPlayerId = player._id;
                s.garrisonActual = game.settings.player.startingShips;
                s.garrison = s.garrisonActual;
            }
        }

        return players;
    }

    _getPlayerStartingLocationRadians(playerCount) {
        const increment = 360 / playerCount * Math.PI / 180;
        let current = 0;

        let radians = [];

        for (let i = 0; i < playerCount; i++) {
            radians.push(current);
            current += increment;
        }

        return radians;
    }

    _getPlayerStartingLocation(radians, galaxyCenter, distanceFromCenter) {
        // Pick a random radian for the player's starting position.
        let radianIndex = this.randomService.getRandomNumber(radians.length);
        let currentRadians = radians.splice(radianIndex, 1)[0];

        // Get the desired player starting location.
        let startingLocation = {
            x: distanceFromCenter * Math.cos(currentRadians),
            y: distanceFromCenter * Math.sin(currentRadians)
        };

        // Add the galaxy center x and y so that the desired location is relative to the center.
        startingLocation.x += galaxyCenter.x;
        startingLocation.y += galaxyCenter.y;

        return startingLocation;
    }

    createEmptyPlayerCarriers(allStars, players) {
        let carriers = [];

        for (let i = 0; i < players.length; i++) {
            let player = players[i];

            let homeStar = this.starService.getPlayerHomeStar(allStars, player);

            if (!homeStar) {
                throw new Error('The player must have a home star in order to set up a carrier');
            }

            // Create a carrier for the home star.
            let homeCarrier = this.carrierService.createAtStar(homeStar, carriers);

            carriers.push(homeCarrier);
        }

        return carriers;
    }

    calculateTotalStars(player, stars) {
        let playerStars = this.starService.listStarsOwnedByPlayer(stars, player._id);

        return playerStars.length;
    }

    calculateTotalShips(player, stars, carriers) {
        let ownedStars = this.starService.listStarsOwnedByPlayer(stars, player._id);
        let ownedCarriers = this.carrierService.listCarriersOwnedByPlayer(carriers, player._id);

        return ownedStars.reduce((sum, s) => sum + Math.floor(s.garrisonActual), 0) 
            + ownedCarriers.reduce((sum, c) => sum + c.ships, 0);
    }

    calculateTotalEconomy(player, stars) {
        let playerStars = this.starService.listStarsOwnedByPlayer(stars, player._id);

        let totalEconomy = playerStars.reduce((sum, s) => sum + s.infrastructure.economy, 0);

        return totalEconomy;
    }

    calculateTotalIndustry(player, stars) {
        let playerStars = this.starService.listStarsOwnedByPlayer(stars, player._id);

        let totalIndustry = playerStars.reduce((sum, s) => sum + s.infrastructure.industry, 0);

        return totalIndustry;
    }

    calculateTotalScience(player, stars) {
        let playerStars = this.starService.listStarsOwnedByPlayer(stars, player._id);

        let totalScience = playerStars.reduce((sum, s) => sum + s.infrastructure.science, 0);

        return totalScience;
    }

    calculateTotalManufacturing(player, stars) {
        let playerStars = this.starService.listStarsOwnedByPlayer(stars, player._id);

        // Calculate the manufacturing level for all of the stars the player owns.
        playerStars.forEach(s => s.manufacturing = this.starService.calculateStarShipsByTicks(player.research.manufacturing.level, s.infrastructure.industry));

        let totalManufacturing = playerStars.reduce((sum, s) => sum + s.manufacturing, 0);

        return totalManufacturing;
    }

    calculateTotalCarriers(player, carriers) {
        let playerCarriers = this.carrierService.listCarriersOwnedByPlayer(carriers, player._id);

        return playerCarriers.length;
    }

    getStats(game, player) {
        return {
            totalStars: this.calculateTotalStars(player, game.galaxy.stars),
            totalCarriers: this.calculateTotalCarriers(player, game.galaxy.carriers),
            totalShips: this.calculateTotalShips(player, game.galaxy.stars, game.galaxy.carriers),
            totalEconomy: this.calculateTotalEconomy(player, game.galaxy.stars),
            totalIndustry: this.calculateTotalIndustry(player, game.galaxy.stars),
            totalScience: this.calculateTotalScience(player, game.galaxy.stars),
            newShips: this.calculateTotalManufacturing(player, game.galaxy.stars)
        };
    }

    async updateLastSeen(game, player) {
        player.lastSeen = moment();

        await game.save();
    }

}
