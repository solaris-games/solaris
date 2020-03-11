const mongoose = require('mongoose');
const starNames = require('../config/game/starNames');

const RandomService = require('./random');

module.exports = class StarService {

    constructor() {
        this.randomService = new RandomService();
    }

    DEFAULTS = {
        MIN_NATURAL_RESOURCES: 10,
        MAX_NATURAL_RESOURCES: 50
    }

    starNames = starNames

    getRandomStarName() {
        return starNames[this.randomService.getRandomNumber(starNames.length)];
    }

    getRandomStarNames(count) {
        const list = [];

        do {
            let nextName = this.getRandomStarName();
    
            if (!list.includes(nextName)) {
                list.push(nextName);
            }
        } while (list.length < count);

        return list;
    }

    generateUnownedStar(name, maxRadius = 1000) {
        return {
            _id: mongoose.Types.ObjectId(),
            name: name,
            naturalResources: this.randomService.getRandomNumberBetween(this.DEFAULTS.MIN_NATURAL_RESOURCES, this.DEFAULTS.MAX_NATURAL_RESOURCES),
            location: this.randomService.getRandomPositionInCircle(maxRadius)
        };
    }

    setupHomeStar(homeStar, player, gameSettings) {
        // Set up the home star
        player.homeStarId = homeStar._id;
        homeStar.ownedByPlayerId = player._id;
        homeStar.garrison = gameSettings.player.startingShips;
        homeStar.naturalResources = this.DEFAULTS.MAX_NATURAL_RESOURCES; // Home stars should always get max resources.
        
        // ONLY the home star gets the starting infrastructure.
        homeStar.economy = gameSettings.player.startingInfrastructure.economy;
        homeStar.industry = gameSettings.player.startingInfrastructure.industry;
        homeStar.science = gameSettings.player.startingInfrastructure.science;
        homeStar.homeStar = true;
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

}