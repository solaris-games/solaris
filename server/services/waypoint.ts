import { DBObjectId } from './types/DBObjectId';
import Repository from './repository';
import { Carrier } from './types/Carrier';
import { CarrierWaypoint, CarrierWaypointActionType, CarrierWaypointBase } from 'solaris-common';
import { Game } from './types/Game';
import { Player } from './types/Player';
import { Star } from './types/Star';
import DistanceService from './distance';
import StarService from './star';
import StarDistanceService from './starDistance';
import TechnologyService from './technology';
import CarrierMovementService from './carrierMovement';
import {GameHistoryCarrierWaypoint} from "./types/GameHistory";
import mongoose from 'mongoose';

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

    fromHistory(wp: GameHistoryCarrierWaypoint) {
        return {
            _id: new mongoose.Types.ObjectId(),
            source: wp.source,
            destination: wp.destination,
            action: 'nothing',
            actionShips: 0,
            delayTicks: 0
        } as CarrierWaypointBase<DBObjectId>;
    }

    _supportsActionShips(action: CarrierWaypointActionType) {
        const actions: CarrierWaypointActionType[] = ['drop', 'collect', 'dropPercentage', 'collectPercentage', 'dropAllBut', 'collectAllBut', 'garrison'];
        return actions.includes(action);
    }

    _starRouteIsWithinHyperspaceRange(game: Game, carrier: Carrier, sourceStar: Star, destinationStar: Star) {
        // Stars may have been destroyed.
        if (!sourceStar || !destinationStar) {
            return false;
        }

        return this.carrierMovementService.isWithinHyperspaceRange(game, carrier, sourceStar, destinationStar);
    }

    _waypointRouteIsBetweenWormHoles(game: Game, waypoint: CarrierWaypointBase<DBObjectId>) {
        let sourceStar = this.starService.getById(game, waypoint.source);
        let destinationStar = this.starService.getById(game, waypoint.destination);

        // Stars may have been destroyed.
        if (sourceStar == null || destinationStar == null) {
            return false;
        }

        return this.starService.isStarPairWormHole(sourceStar, destinationStar);
    }

    canLoop(game: Game, player: Player, carrier: Carrier) {
        if (carrier.waypoints.length < 2 || carrier.isGift) {
            return false;
        }

        let effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(game, carrier, true);

        // Check whether the last waypoint is in range of the first waypoint.
        let firstWaypoint = carrier.waypoints[0];
        let lastWaypoint = carrier.waypoints[carrier.waypoints.length - 1];

        let firstWaypointStar = this.starService.getById(game, firstWaypoint.destination);
        let lastWaypointStar = this.starService.getById(game, lastWaypoint.destination);

        if (firstWaypointStar == null || lastWaypointStar == null) {
            return false;
        }

        if (this.starService.isStarPairWormHole(firstWaypointStar, lastWaypointStar)) {
            return true;
        }

        let distanceBetweenStars = this.starDistanceService.getDistanceBetweenStars(firstWaypointStar, lastWaypointStar);
        let hyperspaceDistance = this.distanceService.getHyperspaceDistance(game, effectiveTechs.hyperspace);

        return distanceBetweenStars <= hyperspaceDistance
    }

    calculateTicksForDistance(game: Game, player: Player, carrier: Carrier, sourceStar: Star, destinationStar: Star): number {
        const distance = this.distanceService.getDistanceBetweenLocations(sourceStar.location, destinationStar.location);
        const warpSpeed = this.carrierMovementService.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);

        let tickDistance = this.carrierMovementService.getCarrierDistancePerTick(game, carrier, warpSpeed, false);

        if (tickDistance) {
            return Math.ceil(distance / tickDistance);
        }

        return 1;
    }

    calculateWaypointTicks(game: Game, carrier: Carrier, waypoint: CarrierWaypoint<DBObjectId>) {
        const delayTicks = waypoint.delayTicks || 0;

        let carrierOwner = game.galaxy.players.find(p => p._id.toString() === carrier.ownedByPlayerId!.toString())!;

        // if the waypoint is going to the same star then it is at least 1
        // tick, plus any delay ticks.
        if (waypoint.source.toString() === waypoint.destination.toString()) {
            return 1 + delayTicks;
        }

        let sourceStar = this.starService.getById(game, waypoint.source);
        let destinationStar = this.starService.getById(game, waypoint.destination);

        // If the carrier can travel instantly then it'll take 1 tick + any delay.
        let instantSpeed = sourceStar && this.starService.isStarPairWormHole(sourceStar, destinationStar);

        if (instantSpeed) {
            return 1 + delayTicks;
        }

        let source = sourceStar == null ? carrier.location : sourceStar.location;
        let destination = destinationStar.location;

        // If the carrier is already en-route, then the number of ticks will be relative
        // to where the carrier is currently positioned.
        if (!carrier.orbiting && carrier.waypoints[0]._id.toString() === waypoint._id.toString()) {
            source = carrier.location;
        }

        let distance = this.distanceService.getDistanceBetweenLocations(source, destination);
        let warpSpeed = this.carrierMovementService.canTravelAtWarpSpeed(game, carrierOwner, carrier, sourceStar, destinationStar);

        // Calculate how far the carrier will move per tick.
        let tickDistance = this.carrierMovementService.getCarrierDistancePerTick(game, carrier, warpSpeed, instantSpeed);
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
            let cwaypoint = carrier.waypoints[i];

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

    _checkWaypointStarInRange(game: Game, waypoint: Star, player: { player: Player, stars: Star[], inRange: string[] }) {
        for (let index = 0; index < player.stars.length; index++) {
            const star = player.stars[index];
            if(this.starService.getStarsWithinScanningRangeOfStarByStarIds(game, star, [waypoint]).length) return true;
        }
        return false;
    }
};
