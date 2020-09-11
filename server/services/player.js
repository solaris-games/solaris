const mongoose = require('mongoose');
const moment = require('moment');

module.exports = class PlayerService {
    
    constructor(randomService, mapService, starService, carrierService, starDistanceService, technologyService) {
        this.randomService = randomService;
        this.mapService = mapService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.starDistanceService = starDistanceService;
        this.technologyService = technologyService;
    }

    getByObjectId(game, playerId) {
        return game.galaxy.players.find(p => p._id.equals(playerId));
    }

    getById(game, playerId) {
        return game.galaxy.players.find(p => p._id.toString() === playerId.toString());
    }

    getByUserId(game, userId) {
        return game.galaxy.players.find(p => p.userId && p.userId.toString() === userId.toString());
    }
    
    getPlayersWithinScanningRangeOfStar(game, starId) {
        let star = this.starService.getById(game, starId);

        let playersWithinRange = game.galaxy.players.filter(p => {
            return this.starService.isStarInScanningRangeOfPlayer(game, star, p);
        });

        return playersWithinRange;
    }

    createEmptyPlayer(game, colour) {
        return {
            _id: mongoose.Types.ObjectId(),
            userId: null,
            alias: 'Empty Slot',
            colour: colour,
            credits: game.settings.player.startingCredits,
            renownToGive: game.settings.general.playerLimit,
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

    createEmptyPlayers(game) {
        let players = [];

        // Divide the galaxy into equal chunks, each player will spawned
        // at near equal distance from the center of the galaxy.

        const starLocations = game.galaxy.stars.map(s => s.location);

        // Calculate the center point of the galaxy as we need to add it onto the starting location.
        let galaxyCenter = this.mapService.getGalaxyCenterOfMass(starLocations);

        // The desired distance from the center is half way from the galaxy center and the edge.
        const distanceFromCenter = this.mapService.getGalaxyDiameter(starLocations).x / 2 / 2;

        let radians = this._getPlayerStartingLocationRadians(game.settings.general.playerLimit);

        let colours = require('../config/game/colours').slice();

        // Create each player starting at angle 0 at a distance of half the galaxy radius
        for(let i = 0; i < game.settings.general.playerLimit; i++) {
            // Get a random colour to assign to the player.
            let colour = colours.splice(this.randomService.getRandomNumber(colours.length - 1), 1)[0];

            let player = this.createEmptyPlayer(game, colour);

            this._setDefaultResearchTechnology(game, player);

            // Get the player's starting location.
            let startingLocation = this._getPlayerStartingLocation(radians, galaxyCenter, distanceFromCenter);

            // Find the star that is closest to this location, that will be the player's home star.
            let homeStar = this.starDistanceService.getClosestUnownedStarFromLocation(startingLocation, game.galaxy.stars);

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
                let homeStar = game.galaxy.stars.find(s => player.homeStarId.equals(s._id));

                // Get X closest stars to the home star and also give those to
                // the player.
                let s = this.starDistanceService.getClosestUnownedStar(homeStar, game.galaxy.stars);

                // Set up the closest star.
                this.setupStarForGameStart(game, s, player);
            }
        }

        return players;
    }

    setupStarForGameStart(game, star, player) {
        if (player.homeStarId.equals(star._id)) {
            this.starService.setupHomeStar(game, star, player, game.settings);
        } else {
            star.ownedByPlayerId = player._id;
            star.garrisonActual = game.settings.player.startingShips;
            star.garrison = star.garrisonActual;
            star.warpGate = false;
            star.infrastructure.economy = 0;
            star.infrastructure.industry = 0;
            star.infrastructure.science = 0;
        }
    }

    resetPlayerForGameStart(game, player) {
        player.userId = null;
        player.alias = "Empty Slot";
        player.credits = game.settings.player.startingCredits;

        // Reset the player's research
        this._setDefaultResearchTechnology(game, player);

        // Reset the player's stars.
        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        for (let star of playerStars) {
            this.setupStarForGameStart(game, star, player);
        }

        // Reset the player's carriers
        this.carrierService.clearPlayerCarriers(game, player);

        let homeCarrier = this.createHomeStarCarrier(game, player);
        
        game.galaxy.carriers.push(homeCarrier);
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

    _setDefaultResearchTechnology(game, player) {
        let enabledTechs = this.technologyService.getEnabledTechnologies(game);

        player.researchingNow = enabledTechs[0] || 'weapons';
        player.researchingNext = player.researchingNow;
    }

    createHomeStarCarriers(game) {
        let carriers = [];

        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            let homeCarrier = this.createHomeStarCarrier(game, player);

            carriers.push(homeCarrier);
        }

        return carriers;
    }

    createHomeStarCarrier(game, player) {
        let homeStar = this.starService.getPlayerHomeStar(game.galaxy.stars, player);

        if (!homeStar) {
            throw new Error('The player must have a home star in order to set up a carrier');
        }

        // Create a carrier for the home star.
        let homeCarrier = this.carrierService.createAtStar(homeStar, game.galaxy.carriers);

        return homeCarrier;
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

    calculateTotalManufacturing(game, player, stars) {
        let playerStars = this.starService.listStarsOwnedByPlayer(stars, player._id);

        // Calculate the manufacturing level for all of the stars the player owns.
        playerStars.forEach(s => {
            let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, s);

            s.manufacturing = this.starService.calculateStarShipsByTicks(effectiveTechs.manufacturing, s.infrastructure.industry)
        });

        let totalManufacturing = playerStars.reduce((sum, s) => sum + s.manufacturing, 0);

        return Math.round((totalManufacturing + Number.EPSILON) * 100) / 100
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
            newShips: this.calculateTotalManufacturing(game, player, game.galaxy.stars)
        };
    }

    updateLastSeen(player) {
        player.lastSeen = moment().utc();
    }

}
