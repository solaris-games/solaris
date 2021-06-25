module.exports = class BattleRoyaleService {

    constructor(starService, carrierService, mapService, starDistanceService) {
        this.starService = starService;
        this.carrierService = carrierService;
        this.mapService = mapService;
        this.starDistanceService = starDistanceService;
    }

    performBattleRoyaleTick(game) {
        // Calculate which stars need to be destroyed.
        let starsToDestroy = this.getStarsToDestroy(game);

        for (let star of starsToDestroy) {
            this.destroyStar(game, star);
        }
    }

    getStarsToDestroy(game) {
        // Don't do anything for X number of turns for peace time.
        const peaceCycles = 0;

        if (game.state.productionTick < peaceCycles) {
            return [];
        }

        // Calculate which stars need to be destroyed.
        let galaxyCenter = this.mapService.getGalaxyCenter(game.galaxy.stars.map(s => s.location));
        let starCountToDestroy = Math.ceil(0.1 * (game.settings.galaxy.starsPerPlayer - 1) * (1.5 - (game.state.productionTick - peaceCycles - 1) / (game.settings.general.playerLimit * 10)));

        // There must be at least 1 star left in the galaxy.
        if (game.galaxy.stars.length - starCountToDestroy < 1) {
            starCountToDestroy = game.galaxy.stars.length - 1;
        }
        
        let starsToDestroy = this.starDistanceService.getFurthestStarsFromLocation(galaxyCenter, game.galaxy.stars, starCountToDestroy);

        return starsToDestroy;
    }

    destroyStar(game, star) {
        // Destroy any carriers enroute to the star.
        let carriers = this.carrierService.getCarriersEnRouteToStar(game, star);

        for (let carrier of carriers) {
            this.carrierService.destroyCarrier(game, carrier);
        }

        // Destroy the star itself.
        this.starService.destroyStar(game, star);
    }

};
