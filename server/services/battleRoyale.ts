import { Game } from "../types/Game";
import { Star } from "../types/Star";
import CarrierService from "./carrier";
import CarrierMovementService from "./carrierMovement";
import MapService from "./map";
import StarService from "./star";
import StarDistanceService from "./starDistance";
import WaypointService from "./waypoint";

export default class BattleRoyaleService {
    starService: StarService;
    carrierService: CarrierService;
    mapService: MapService;
    starDistanceService: StarDistanceService;
    waypointService: WaypointService;
    carrierMovementService: CarrierMovementService;

    constructor(
        starService: StarService,
        carrierService: CarrierService,
        mapService: MapService,
        starDistanceService: StarDistanceService,
        waypointService: WaypointService,
        carrierMovementService: CarrierMovementService
    ) {
        this.starService = starService;
        this.carrierService = carrierService;
        this.mapService = mapService;
        this.starDistanceService = starDistanceService;
        this.waypointService = waypointService;
        this.carrierMovementService = carrierMovementService;
    }

    performBattleRoyaleTick(game: Game) {
        // Calculate which stars need to be destroyed.
        let starsToDestroy = this.getStarsToDestroy(game);

        for (let star of starsToDestroy) {
            this.destroyStar(game, star);
        }
    }

    getStarsToDestroy(game: Game) {
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

        return starsToDestroy
            .sort((a, b) => a._id.toString().localeCompare(b._id.toString()));
    }

    destroyStar(game: Game, star: Star) {
        this.starService.destroyStar(game, star);

        let carriers = this.carrierMovementService.getCarriersEnRouteToStar(game, star);

        // Cull the waypoints of carriers that have the given star in its
        // waypoint queue and destroy those that are lost in space.
        for (let carrier of carriers) {
            this.waypointService.cullWaypointsByHyperspaceRange(game, carrier);

            if (this.carrierMovementService.isLostInSpace(game, carrier)) {
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
