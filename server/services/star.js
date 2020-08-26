const EventEmitter = require('events');
const mongoose = require('mongoose');
const ValidationError = require('../errors/validation');

module.exports = class StarService extends EventEmitter {

    constructor(randomService, nameService, distanceService, starDistanceService) {
        super();
        
        this.randomService = randomService;
        this.nameService = nameService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
    }

    generateUnownedStar(game, name, location, galaxyRadius) {
        let naturalResources = this.randomService.generateStarNaturalResources(galaxyRadius, location.x, location.y, 
            game.constants.star.resources.minNaturalResources, game.constants.star.resources.maxNaturalResources, true);

        return {
            _id: mongoose.Types.ObjectId(),
            name,
            naturalResources,
            location,
            infrastructure: { }
        };
    }

    generateStarPosition(game, originX, originY, radius) {
        if (radius == null) {
            radius = game.constants.distances.maxDistanceBetweenStars;
        }

        return this.randomService.getRandomPositionInCircleFromOrigin(originX, originY, radius);
    }

    getByObjectId(game, id) {
        return game.galaxy.stars.find(s => s._id.equals(id));
    }

    getById(game, id) {
        return game.galaxy.stars.find(s => s._id.toString() === id.toString());
    }

    setupHomeStar(game, homeStar, player, gameSettings) {
        // Set up the home star
        player.homeStarId = homeStar._id;
        homeStar.ownedByPlayerId = player._id;
        homeStar.garrisonActual = gameSettings.player.startingShips;
        homeStar.garrison = homeStar.garrisonActual;
        homeStar.naturalResources = game.constants.star.resources.maxNaturalResources; // Home stars should always get max resources.
        homeStar.warpGate = false;
        
        // ONLY the home star gets the starting infrastructure.
        homeStar.infrastructure.economy = gameSettings.player.startingInfrastructure.economy;
        homeStar.infrastructure.industry = gameSettings.player.startingInfrastructure.industry;
        homeStar.infrastructure.science = gameSettings.player.startingInfrastructure.science;
    }

    getPlayerHomeStar(stars, player) {
        return this.listStarsOwnedByPlayer(stars, player._id).find(s => s._id.equals(player.homeStarId));
    }

    listStarsOwnedByPlayer(stars, playerId) {
        return stars.filter(s => s.ownedByPlayerId && s.ownedByPlayerId.equals(playerId));
    }

    getStarsWithinScanningRangeOfStar(game, starId) {
        // Get all of the stars owned by the player
        let star = this.getById(game, starId);

        if (star.ownedByPlayerId == null) {
            return [];
        }

        let player = game.galaxy.players.find(x => x._id.equals(star.ownedByPlayerId));
        let scanningRangeDistance = this.distanceService.getScanningDistance(game, player.research.scanning.level);

        // Go through all stars and find each star that is in scanning range.
        let starsInRange = game.galaxy.stars.filter(s => {
            return s._id.toString() !== starId.toString() && // Not the current star
                this.starDistanceService.getDistanceBetweenStars(s, star) <= scanningRangeDistance;
        });

        return starsInRange;
    }

    filterStarsByScanningRange(game, player) {
        let playerStars = this.listStarsOwnedByPlayer(game.galaxy.stars, player._id);
        let scanningRangeDistance = this.distanceService.getScanningDistance(game, player.research.scanning.level);

        let starsInRange = game.galaxy.stars.filter(s => {
            return (s.ownedByPlayerId != null && s.ownedByPlayerId.equals(player._id))   // Owned by the current player
                // Or any of the stars that the player owns is within scanning range
                || playerStars.find(ps => this.starDistanceService.getDistanceBetweenStars(ps, s) <= scanningRangeDistance) != null;
        });

        return starsInRange;
    }

    // sanitizeStarsByScanningRange(game, player) {
    //     let scanningRangeDistance = this.distanceService.getScanningDistance(game, player.research.scanning.level);

    //     // Get all of the player's stars.
    //     let playerStars = this.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

    //     return game.galaxy.stars
    //     .map(s => {
    //         let starData = {
    //             _id: s._id,
    //             ownedByPlayerId: s.ownedByPlayerId,
    //             name: s.name,
    //             naturalResources: s.naturalResources,
    //             garrison: s.garrison,
    //             infrastructure: s.infrastructure,
    //             warpGate: s.warpGate,
    //             location: s.location
    //         };

    //         let owningPlayer = game.galaxy.players.find(x => x._id.equals(s.ownedByPlayerId));

    //         starData.terraformedResources = this.calculateTerraformedResources(starData.naturalResources, owningPlayer.research.terraforming.level);

    //         return starData;
    //     });
    // }

    calculateTerraformedResources(naturalResources, terraforming) {
        return (terraforming * 5) + naturalResources;
    }

    calculateStarShipsByTicks(techLevel, industryLevel, ticks = 1) {
        // A star produces Y*(X+5) ships every 24 ticks where X is your manufacturing tech level and Y is the amount of industry at a star.
        return +((industryLevel * (techLevel + 5) / 24) * ticks).toFixed(2);
    }

    async abandonStar(game, player, starId) {
        // Get the star.
        let star = game.galaxy.stars.find(x => x.id === starId);

        // Check whether the star is owned by the player
        if ((star.ownedByPlayerId || '').toString() !== player.id) {
            throw new ValidationError(`Cannot abandon a star that is not owned by the player.`);
        }

        star.ownedByPlayerId = null;
        star.garrisonActual = 0;
        star.garrison = star.garrisonActual;
        
        game.galaxy.carriers = game.galaxy.carriers.filter(x => (x.orbiting || '').toString() != star.id);

        // TODO: Re-assign home star?
        // // If this was the player's home star, then we need to find a new home star.
        // if (star.homeStar) {
        //     let closestStars = this.starDistanceService.getClosestPlayerOwnedStars(star, game.galaxy.stars, player);

        //     if (closestStars.length) {
        //         closestStars[0].homeStar = true;
        //     }
        // }
        
        await game.save();

        this.emit('onPlayerStarAbandoned', {
            game,
            player,
            star
        });
    }

}