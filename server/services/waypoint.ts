import { DBObjectId } from './types/DBObjectId';
import { Carrier } from './types/Carrier';
import { CarrierWaypoint, CarrierWaypointActionType, CarrierWaypointBase } from 'solaris-common';
import { Game } from './types/Game';
import { Player } from './types/Player';
import { Star } from './types/Star';
import { DistanceService } from 'solaris-common';
import StarService from './star';
import StarDistanceService from './starDistance';
import TechnologyService from './technology';
import CarrierMovementService from './carrierMovement';

export default class WaypointService {
    starService: StarService;
    distanceService: DistanceService;
    starDistanceService: StarDistanceService;
    technologyService: TechnologyService;
    carrierMovementService: CarrierMovementService;

    constructor(
        starService: StarService,
        distanceService: DistanceService,
        starDistanceService: StarDistanceService,
        technologyService: TechnologyService,
        carrierMovementService: CarrierMovementService,
    ) {
        this.starService = starService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.technologyService = technologyService;
        this.carrierMovementService = carrierMovementService;
    }

    supportsActionShips(action: CarrierWaypointActionType) {
        const actions: CarrierWaypointActionType[] = ['drop', 'collect', 'dropPercentage', 'collectPercentage', 'dropAllBut', 'collectAllBut', 'garrison'];
        return actions.includes(action);
    }

    starRouteIsWithinHyperspaceRange(game: Game, carrier: Carrier, sourceStar: Star, destinationStar: Star) {
        // Stars may have been destroyed.
        if (!sourceStar || !destinationStar) {
            return false;
        }

        return this.carrierMovementService.isWithinHyperspaceRange(game, carrier, sourceStar, destinationStar);
    }

    canLoop(game: Game, carrier: Carrier) {
        if (carrier.waypoints.length < 2 || carrier.isGift) {
            return false;
        }

        const effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(game, carrier, true);

        // Check whether the last waypoint is in range of the first waypoint.
        const firstWaypoint = carrier.waypoints[0];
        const lastWaypoint = carrier.waypoints[carrier.waypoints.length - 1];

        const firstWaypointStar = this.starService.getById(game, firstWaypoint.destination);
        const lastWaypointStar = this.starService.getById(game, lastWaypoint.destination);

        if (firstWaypointStar == null || lastWaypointStar == null) {
            return false;
        }

        if (this.starService.isStarPairWormHole(firstWaypointStar, lastWaypointStar)) {
            return true;
        }

        const distanceBetweenStars = this.starDistanceService.getDistanceBetweenStars(firstWaypointStar, lastWaypointStar);
        const hyperspaceDistance = this.distanceService.getHyperspaceDistance(game, effectiveTechs.hyperspace);

        return distanceBetweenStars <= hyperspaceDistance
    }

    calculateTicksForDistance(game: Game, player: Player, carrier: Carrier, sourceStar: Star, destinationStar: Star): number {
        const distance = this.distanceService.getDistanceBetweenLocations(sourceStar.location, destinationStar.location);
        const warpSpeed = this.carrierMovementService.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);

        const tickDistance = this.carrierMovementService.getCarrierDistancePerTick(game, carrier, warpSpeed, false);

        if (tickDistance) {
            return Math.ceil(distance / tickDistance);
        }

        return 1;
    }

    calculateWaypointTicks(game: Game, carrier: Carrier, waypoint: CarrierWaypoint<DBObjectId>) {
        const delayTicks = waypoint.delayTicks || 0;

        const carrierOwner = game.galaxy.players.find(p => p._id.toString() === carrier.ownedByPlayerId!.toString())!;

        // if the waypoint is going to the same star then it is at least 1
        // tick, plus any delay ticks.
        if (waypoint.source.toString() === waypoint.destination.toString()) {
            return 1 + delayTicks;
        }

        const sourceStar = this.starService.getById(game, waypoint.source);
        const destinationStar = this.starService.getById(game, waypoint.destination);

        // If the carrier can travel instantly then it'll take 1 tick + any delay.
        let instantSpeed = sourceStar && this.starService.isStarPairWormHole(sourceStar, destinationStar);

        if (instantSpeed) {
            return 1 + delayTicks;
        }

        let source = sourceStar == null ? carrier.location : sourceStar.location;
        const destination = destinationStar.location;

        // If the carrier is already en-route, then the number of ticks will be relative
        // to where the carrier is currently positioned.
        if (!carrier.orbiting && carrier.waypoints[0]._id.toString() === waypoint._id.toString()) {
            source = carrier.location;
        }

        const distance = this.distanceService.getDistanceBetweenLocations(source, destination);
        const warpSpeed = this.carrierMovementService.canTravelAtWarpSpeed(game, carrierOwner, carrier, sourceStar, destinationStar);

        // Calculate how far the carrier will move per tick.
        const tickDistance = this.carrierMovementService.getCarrierDistancePerTick(game, carrier, warpSpeed, instantSpeed);
        let ticks = 1;

        if (tickDistance) {
            ticks = Math.ceil(distance / tickDistance);
        }

        ticks += delayTicks; // Add any delay ticks the waypoint has.

        return ticks;
    }

    calculateWaypointTicksEta(game: Game, carrier: Carrier, waypoint: CarrierWaypoint<DBObjectId>) {
        let totalTicks = 0;

        for (let i = 0; i < carrier.waypoints.length; i++) {
            const cwaypoint = carrier.waypoints[i];

            totalTicks += this.calculateWaypointTicks(game, carrier, cwaypoint);

            if (cwaypoint._id.toString() === waypoint._id.toString()) {
                break;
            }
        }

        return totalTicks;
    }

    populateCarrierWaypointEta(game: Game, carrier: Carrier) {
        carrier.waypoints.forEach(w => {
            w.ticks = this.calculateWaypointTicks(game, carrier, w);
            w.ticksEta = this.calculateWaypointTicksEta(game, carrier, w);
        });

        if (carrier.waypoints.length) {
            carrier.ticksEta = carrier.waypoints[0].ticksEta;
            carrier.ticksEtaTotal = carrier.waypoints[carrier.waypoints.length - 1].ticksEta;
        } else {
            carrier.ticksEta = null;
            carrier.ticksEtaTotal = null;
        }
    }
};
