import { Game } from "./types/Game";
import { Star } from "./types/Star";
import CarrierService from "./carrier";
import CarrierMovementService from "./carrierMovement";
import MapService from "./map";
import StarService from "./star";
import StarDistanceService from "./starDistance";
import WaypointService from "./waypoint";

const PEACE_CYCLES = 3;

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
        let starsToDestroy = this.getStarsToDestroyNow(game);

        for (let star of starsToDestroy) {
            this.destroyStar(game, star);
        }
    }

    getStarsToDestroyPreview(game: Game) {
        return this.getStarsToDestroy(game, PEACE_CYCLES - 1);
    }

    getStarsToDestroyNow(game: Game) {
        return this.getStarsToDestroy(game, PEACE_CYCLES);
    }

    getStarsToDestroy(game: Game, peaceCycles: number) {
        if (game.state.productionTick < peaceCycles) {
            return [];
        }

        // Calculate which stars need to be destroyed.
        const galaxyCenter = game.constants.distances.galaxyCenterLocation!; // cannot be undefined because we are on the server
        let starCountToDestroy = game.settings.general.playerLimit; // TODO: This needs to be a game setting?

        // There must be at least 1 star left in the galaxy.
        if (game.galaxy.stars.length - starCountToDestroy < 1) {
            starCountToDestroy = game.galaxy.stars.length - 1;
        }
        
        const starsToDestroy = this.starDistanceService.getFurthestStarsFromLocation(galaxyCenter, game.galaxy.stars, starCountToDestroy);

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
