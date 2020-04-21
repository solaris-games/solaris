const mongoose = require('mongoose');
const ValidationError = require('../errors/validation');

module.exports = class StarService {

    constructor(randomService, starNameService, distanceService) {
        this.randomService = randomService;
        this.starNameService = starNameService;
        this.distanceService = distanceService;
    }

    DEFAULTS = {
        MIN_NATURAL_RESOURCES: 10,
        MAX_NATURAL_RESOURCES: 50
    }

    generateUnownedStar(name, originX, originY) {
        return {
            _id: mongoose.Types.ObjectId(),
            name: name,
            naturalResources: this.randomService.getRandomNumberBetween(this.DEFAULTS.MIN_NATURAL_RESOURCES, this.DEFAULTS.MAX_NATURAL_RESOURCES - 1),
            location: this.randomService.getRandomPositionInCircleFromOrigin(originX, originY, this.distanceService.DISTANCES.MAX_DISTANCE_BETWEEN_STARS),
            infrastructure: { }
        };
    }

    setupHomeStar(homeStar, player, gameSettings) {
        // Set up the home star
        player.homeStarId = homeStar._id;
        homeStar.ownedByPlayerId = player._id;
        homeStar.garrisonActual = gameSettings.player.startingShips;
        homeStar.garrison = homeStar.garrisonActual;
        homeStar.naturalResources = this.DEFAULTS.MAX_NATURAL_RESOURCES; // Home stars should always get max resources.
        
        // ONLY the home star gets the starting infrastructure.
        homeStar.infrastructure.economy = gameSettings.player.startingInfrastructure.economy;
        homeStar.infrastructure.industry = gameSettings.player.startingInfrastructure.industry;
        homeStar.infrastructure.science = gameSettings.player.startingInfrastructure.science;
        homeStar.homeStar = true;
    }

    getPlayerHomeStar(stars, playerId) {
        return this.listStarsOwnedByPlayer(stars, playerId).find(s => s.homeStar);
    }

    listStarsOwnedByPlayer(stars, playerId) {
        return stars.filter(s => s.ownedByPlayerId && s.ownedByPlayerId.equals(playerId));
    }

    calculateTerraformedResources(naturalResources, terraforming) {
        return (terraforming * 5) + naturalResources;
    }

    calculateStarShipsByTicks(techLevel, industryLevel, ticks = 1) {
        // A star produces Y*(X+5) ships every 24 ticks where X is your manufacturing tech level and Y is the amount of industry at a star.
        return (industryLevel * (techLevel + 5) / 24) * ticks;
    }

    async abandonStar(game, userId, starId) {
        // Get the star.
        let star = game.galaxy.stars.find(x => x.id === starId);

        // Check whether the star is owned by the current user.
        let userPlayer = game.galaxy.players.find(x => x.userId === userId);

        if ((star.ownedByPlayerId || '').toString() !== userPlayer.id) {
            throw new ValidationError(`Cannot abandon a star that is not owned by the player.`);
        }

        star.ownedByPlayerId = null;
        star.garrisonActual = 0;
        star.garrison = star.garrisonActual;
        
        // Find and destroy all carriers stationed at this star.
        game.galaxy.carriers = game.galaxy.carriers.filter(x => x.orbiting.toString() != star.id);

        // TODO: Do we need to do anything about the home star? Maybe move it to the nearest player star?
        
        await game.save();
    }

}