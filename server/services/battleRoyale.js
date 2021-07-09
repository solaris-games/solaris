module.exports = class BattleRoyaleService {

    constructor(starService, carrierService, mapService, starDistanceService, waypointService) {
        this.starService = starService;
        this.carrierService = carrierService;
        this.mapService = mapService;
        this.starDistanceService = starDistanceService;
        this.waypointService = waypointService;
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
        const peaceCycles = 3;

        if (game.state.productionTick < peaceCycles) {
            return [];
        }

        // Calculate which stars need to be destroyed.
        let galaxyCenter = this.mapService.getGalaxyCenter(game.galaxy.stars.map(s => s.location));
        let starCountToDestroy = game.settings.general.playerLimit;

        // There must be at least 1 star left in the galaxy.
        if (game.galaxy.stars.length - starCountToDestroy < 1) {
            starCountToDestroy = game.galaxy.stars.length - 1;
        }
        
        let starsToDestroy = this.starDistanceService.getFurthestStarsFromLocation(galaxyCenter, game.galaxy.stars, starCountToDestroy);

        return starsToDestroy;
    }

    destroyStar(game, star) {
        this.starService.destroyStar(game, star);

        let carriers = this.carrierService.getCarriersEnRouteToStar(game, star);

        // Cull the waypoints of carriers that have the given star in its
        // waypoint queue and destroy those that are lost in space.
        for (let carrier of carriers) {
            this.waypointService.cullWaypointsByHyperspaceRange(game, carrier);

            if (this.carrierService.isLostInSpace(game, carrier)) {
                this.carrierService.destroyCarrier(game, carrier);
            }
        }

        // Destroy any carriers stationed at the star.
        carriers = this.carrierService.getCarriersAtStar(game, star._id);

        for (let carrier of carriers) {
            this.carrierService.destroyCarrier(game, carrier);
        }
    }

};
