import DatabaseRepository from '../models/DatabaseRepository';
import { Carrier } from '../types/Carrier';
import { CarrierWaypoint } from '../types/CarrierWaypoint';
import { Game } from '../types/Game';
import { Star } from '../types/Star';
import { User } from '../types/User';
import CarrierGiftService from './carrierGift';
import DiplomacyService from './diplomacy';
import DistanceService from './distance';
import SpecialistService from './specialist';
import StarService from './star';

export default class CarrierMovementService {
    gameRepo: DatabaseRepository<Game>;
    distanceService: DistanceService;
    starService: StarService;
    specialistService: SpecialistService;
    diplomacyService: DiplomacyService;
    carrierGiftService: CarrierGiftService;

    constructor(
        gameRepo: DatabaseRepository<Game>,
        distanceService: DistanceService,
        starService: StarService,
        specialistService: SpecialistService,
        diplomacyService: DiplomacyService,
        carrierGiftService: CarrierGiftService
    ) {
        this.gameRepo = gameRepo;
        this.distanceService = distanceService;
        this.starService = starService;
        this.specialistService = specialistService;
        this.diplomacyService = diplomacyService;
        this.carrierGiftService = carrierGiftService;
    }

    getCarrierDistancePerTick(game: Game, carrier: Carrier, warpSpeed: boolean = false, instantSpeed: boolean | null = false) {
        if (instantSpeed) {
            return null;
        }

        let distanceModifier = warpSpeed ? game.constants.distances.warpSpeedMultiplier : 1;

        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            if (specialist.modifiers.local) {
                distanceModifier *= (specialist.modifiers.local.speed || 1);
            }
        }

        return game.settings.specialGalaxy.carrierSpeed * distanceModifier;
    }

    moveCarrierToCurrentWaypoint(carrier: Carrier, destinationStar: Star, distancePerTick: number) {
        let nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);

        carrier.location = nextLocation;
    }

    async arriveAtStar(game: Game, gameUsers: User[], carrier: Carrier, destinationStar: Star) {
        // Remove the current waypoint as we have arrived at the destination.
        let currentWaypoint = carrier.waypoints.splice(0, 1)[0];

        let report = {
            waypoint: currentWaypoint,
            combatRequiredStar: false
        };

        carrier.orbiting = destinationStar._id;
        carrier.location = destinationStar.location;

        // If the carrier waypoints are looped then append the
        // carrier waypoint back onto the waypoint stack.
        if (carrier.waypointsLooped) {
            carrier.waypoints.push(currentWaypoint);
        }

        // If the star is unclaimed, then claim it.
        if (destinationStar.ownedByPlayerId == null) {
            await this.starService.claimUnownedStar(game, gameUsers, destinationStar, carrier);
        }

        // Reignite dead stars if applicable
        // Note: Black holes cannot be reignited.
        if (!carrier.isGift && this.starService.isDeadStar(destinationStar) && this.specialistService.getReigniteDeadStar(carrier)) {
            let reigniteNaturalResources = this.specialistService.getReigniteDeadStarNaturalResources(carrier);

            this.starService.reigniteDeadStar(game, destinationStar, reigniteNaturalResources);

            carrier.specialistId = null;
        }

        // If the star is owned by another player, then perform combat.
        if (destinationStar.ownedByPlayerId!.toString() !== carrier.ownedByPlayerId!.toString()) {
            // If the carrier is a gift, then transfer the carrier ownership to the star owning player.
            // Otherwise, perform combat.
            if (carrier.isGift) {
                await this.carrierGiftService.transferGift(game, gameUsers, destinationStar, carrier);
            } else if (this.diplomacyService.isFormalAlliancesEnabled(game)) {
                let isAllied = this.diplomacyService.isDiplomaticStatusBetweenPlayersAllied(game, [carrier.ownedByPlayerId!, destinationStar.ownedByPlayerId!]);

                report.combatRequiredStar = !isAllied;
            } else {
                report.combatRequiredStar = true;
            }
        } else {
            // Make sure the carrier gift is reset if the star is owned by the same player.
            carrier.isGift = false;
        }

        return report;
    }

    async moveCarrier(game: Game, gameUsers: User[], carrierInTransit: Carrier) {
        let waypoint: CarrierWaypoint = carrierInTransit.waypoints[0];

        if (waypoint.delayTicks) {
            throw new Error(`Cannot move carrier, the waypoint has a delay.`);
        }

        if (this.isLaunching(carrierInTransit)) {
            waypoint.source = carrierInTransit.orbiting!; // Make damn sure the waypoint source is correct.

            // If the destination star is not the current one, then launch the carrier into space.
            if (carrierInTransit.orbiting!.toString() !== waypoint.destination.toString()) {
                carrierInTransit.orbiting = null;
            }
        }

        let sourceStar = game.galaxy.stars.find(s => s._id.toString() === waypoint.source.toString())!;
        let destinationStar = game.galaxy.stars.find(s => s._id.toString() === waypoint.destination.toString())!;
        let carrierOwner = game.galaxy.players.find(p => p._id.toString() === carrierInTransit.ownedByPlayerId!.toString())!;
        let warpSpeed = this.starService.canTravelAtWarpSpeed(game, carrierOwner, carrierInTransit, sourceStar, destinationStar);
        let instantSpeed = this.starService.isStarPairWormHole(sourceStar, destinationStar);
        let distancePerTick = this.getCarrierDistancePerTick(game, carrierInTransit, warpSpeed, instantSpeed); // Null signifies instant travel

        let carrierMovementReport = {
            carrier: carrierInTransit,
            sourceStar,
            destinationStar,
            carrierOwner,
            warpSpeed,
            instantSpeed,
            distancePerTick,
            waypoint,
            combatRequiredStar: false,
            arrivedAtStar: false
        };
        
        if (instantSpeed || (distancePerTick && (carrierInTransit.distanceToDestination || 0) <= distancePerTick)) {
            let starArrivalReport = await this.arriveAtStar(game, gameUsers, carrierInTransit, destinationStar);
            
            carrierMovementReport.waypoint = starArrivalReport.waypoint;
            carrierMovementReport.combatRequiredStar = starArrivalReport.combatRequiredStar;
            carrierMovementReport.arrivedAtStar = true;
        }
        // Otherwise, move X distance in the direction of the star.
        else {
            this.moveCarrierToCurrentWaypoint(carrierInTransit, destinationStar, distancePerTick!);
        }

        return carrierMovementReport;
    }

    getNextLocationToWaypoint(game: Game, carrier: Carrier) {
        let waypoint = carrier.waypoints[0];
        let sourceStar = game.galaxy.stars.find(s => s._id.toString() === waypoint.source.toString())!;
        let destinationStar = game.galaxy.stars.find(s => s._id.toString() === waypoint.destination.toString())!;
        let carrierOwner = game.galaxy.players.find(p => p._id.toString() === carrier.ownedByPlayerId!.toString())!;

        let warpSpeed = false;
        let instantSpeed: boolean | null = false;
        
        if (sourceStar) {
            warpSpeed = this.starService.canTravelAtWarpSpeed(game, carrierOwner, carrier, sourceStar, destinationStar);
            instantSpeed = this.starService.isStarPairWormHole(sourceStar, destinationStar);
        }

        let nextLocation;
        let distancePerTick;
        let distanceToDestination = this.distanceService.getDistanceBetweenLocations(carrier.location, destinationStar.location);


        if (instantSpeed) {
            distancePerTick = distanceToDestination;
            nextLocation = destinationStar.location;
        } else {
            distancePerTick = this.getCarrierDistancePerTick(game, carrier, warpSpeed, instantSpeed)!;

            if (distancePerTick >= distanceToDestination) {
                distancePerTick = distanceToDestination;
                nextLocation = destinationStar.location;
            } else{
                nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);
            }
        }

        return {
            location: nextLocation,
            distance: distancePerTick,
            warpSpeed,
            instantSpeed,
            sourceStar,
            destinationStar
        };
    }

    isInTransit(carrier: Carrier) {
        return !carrier.orbiting;
    }

    isInTransitTo(carrier: Carrier, star: Star) {
        return this.isInTransit(carrier) && carrier.waypoints[0].destination.toString() === star._id.toString();
    }

    isLaunching(carrier: Carrier) {
        return carrier.orbiting && carrier.waypoints.length && carrier.waypoints[0].delayTicks === 0;
    }

    getCarriersEnRouteToStar(game: Game, star: Star) {
        return game.galaxy.carriers.filter(c => 
            c.waypoints && c.waypoints.length && c.waypoints.find(w => w.destination.toString() === star._id.toString()) != null
        );
    }

    isLostInSpace(game: Game, carrier: Carrier) {
        // If not in transit then it obviously isn't lost in space
        if (!this.isInTransit(carrier)) {
            return false;
        }

        // If the carrier has a waypoint then check if the
        // current destination exists.
        if (carrier.waypoints.length) {
            return game.galaxy.stars.find(s => s._id.toString() === carrier.waypoints[0].destination.toString()) == null;
        }

        // If there are no waypoints and they are in transit then must be lost, otherwise all good.
        return carrier.waypoints.length === 0;
    }

};
