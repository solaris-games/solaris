import Repository from './repository';
import {Carrier} from './types/Carrier';
import {CarrierWaypoint, DistanceService, StarDistanceService, TechnologyService} from 'solaris-common';
import {Game} from './types/Game';
import {Player} from './types/Player';
import {Star} from './types/Star';
import {User} from './types/User';
import CarrierGiftService from './carrierGift';
import DiplomacyService from './diplomacy';
import SpecialistService from './specialist';
import StarService from './star';
import {logger} from "../utils/logging";
import {DBObjectId} from "./types/DBObjectId";
import CarrierTravelService from "./carrierTravel";

type CarrierMovementReport = {
    carrier: Carrier;
    sourceStar: Star;
    destinationStar: Star;
    carrierOwner: Player;
    warpSpeed: boolean;
    instantSpeed: boolean | null;
    distancePerTick: number | null;
    waypoint: CarrierWaypoint<DBObjectId>;
    combatRequiredStar: boolean;
    arrivedAtStar: boolean;
}

const log = logger("Carrier Movement Service");

export default class CarrierMovementService {
    gameRepo: Repository<Game>;
    distanceService: DistanceService;
    starService: StarService;
    specialistService: SpecialistService;
    diplomacyService: DiplomacyService;
    carrierGiftService: CarrierGiftService;
    technologyService: TechnologyService;
    starDistanceService: StarDistanceService;
    carrierTravelService: CarrierTravelService;

    constructor(
        gameRepo: Repository<Game>,
        distanceService: DistanceService,
        starService: StarService,
        specialistService: SpecialistService,
        diplomacyService: DiplomacyService,
        carrierGiftService: CarrierGiftService,
        technologyService: TechnologyService,
        starDistanceService: StarDistanceService,
        carrierTravelService: CarrierTravelService,
    ) {
        this.gameRepo = gameRepo;
        this.distanceService = distanceService;
        this.starService = starService;
        this.specialistService = specialistService;
        this.diplomacyService = diplomacyService;
        this.carrierGiftService = carrierGiftService;
        this.technologyService = technologyService;
        this.starDistanceService = starDistanceService;
        this.carrierTravelService = carrierTravelService;
    }

    moveCarrierToCurrentWaypoint(carrier: Carrier, destinationStar: Star, distancePerTick: number) {
        carrier.location = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);
    }

    arriveAtStar(game: Game, gameUsers: User[], carrier: Carrier, destinationStar: Star) {
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
        // TODO: Move this logic out of this function so that carrier movement will correctly
        // take into account multiple players arriving at an unclaimed star at the same time.
        if (destinationStar.ownedByPlayerId == null) {
            this.starService.claimUnownedStar(game, gameUsers, destinationStar, carrier);
        }

        // Reignite dead stars if applicable
        // Note: Black holes cannot be reignited.
        if (!carrier.isGift && this.starService.isDeadStar(destinationStar) && this.specialistService.getReigniteDeadStar(carrier)) {
            let reigniteSpecialistNaturalResources = this.specialistService.getReigniteDeadStarNaturalResources(carrier);

            // Double resources for binary stars.
            let modifier = destinationStar.isBinaryStar ? 2 : 1
            let reigniteNaturalResources = {
                economy: reigniteSpecialistNaturalResources.economy * modifier,
                industry: reigniteSpecialistNaturalResources.industry * modifier,
                science: reigniteSpecialistNaturalResources.science * modifier
            };
            
            this.starService.reigniteDeadStar(game, destinationStar, reigniteNaturalResources);

            carrier.specialistId = null;
        }

        // If the star is owned by another player, then perform combat.
        if (destinationStar.ownedByPlayerId!.toString() !== carrier.ownedByPlayerId!.toString()) {
            // If the carrier is a gift, then transfer the carrier ownership to the star owning player.
            // Otherwise, perform combat.
            if (carrier.isGift) {
                this.carrierGiftService.transferGift(game, gameUsers, destinationStar, carrier);
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

    moveCarrier(game: Game, gameUsers: User[], carrierInTransit: Carrier): CarrierMovementReport | null {
        let waypoint: CarrierWaypoint<DBObjectId> = carrierInTransit.waypoints[0];

        if (waypoint.delayTicks) {
            throw new Error(`Cannot move carrier, the waypoint has a delay.`);
        }

        if (this.carrierTravelService.isLaunching(carrierInTransit)) {
            const sourceStarId = carrierInTransit.orbiting!;
            const destinationStarId = waypoint.destination;
            const sourceStar = this.starService.getByIdBS(game, sourceStarId);
            const destinationStar = this.starService.getByIdBS(game, destinationStarId);

            if (!sourceStar || !destinationStar) {
                carrierInTransit.waypoints = [];
                return null;
            }

            if (!this.carrierTravelService.isWithinHyperspaceRange(game, carrierInTransit, sourceStar, destinationStar)) {
                log.warn(`Carrier ${carrierInTransit._id} is trying to launch to a star that is out of hyperspace range.`, {
                    gameId: game._id.toString(),
                    carrierId: carrierInTransit._id.toString(),
                });

                carrierInTransit.waypoints = [];
                return null;
            }

            waypoint.source = sourceStarId; // Make damn sure the waypoint source is correct.

            // If the destination star is not the current one, then launch the carrier into space.
            if (carrierInTransit.orbiting!.toString() !== destinationStarId.toString()) {
                carrierInTransit.location = sourceStar.location;
                carrierInTransit.orbiting = null;
            }
        }

        const sourceStar = this.starService.getByIdBS(game, waypoint.source);
        const destinationStar = this.starService.getByIdBS(game, waypoint.destination);
        const carrierOwner = game.galaxy.players.find(p => p._id.toString() === carrierInTransit.ownedByPlayerId!.toString())!;
        const warpSpeed = this.carrierTravelService.canTravelAtWarpSpeed(game, carrierOwner, carrierInTransit, sourceStar, destinationStar);
        const instantSpeed = this.starService.isStarPairWormHole(sourceStar, destinationStar);
        const distancePerTick = this.carrierTravelService.getCarrierDistancePerTick(game, carrierInTransit, warpSpeed, instantSpeed); // Null signifies instant travel

        const carrierMovementReport = {
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
            let starArrivalReport = this.arriveAtStar(game, gameUsers, carrierInTransit, destinationStar);
            
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
        let sourceStar = this.starService.getByIdBS(game, waypoint.source);
        let destinationStar = this.starService.getByIdBS(game, waypoint.destination);
        let carrierOwner = game.galaxy.players.find(p => p._id.toString() === carrier.ownedByPlayerId!.toString())!;

        let warpSpeed = false;
        let instantSpeed: boolean | null = false;
        
        if (sourceStar) {
            warpSpeed = this.carrierTravelService.canTravelAtWarpSpeed(game, carrierOwner, carrier, sourceStar, destinationStar);
            instantSpeed = this.starService.isStarPairWormHole(sourceStar, destinationStar);
        }

        let nextLocation;
        let distancePerTick;
        let distanceToDestination = this.distanceService.getDistanceBetweenLocations(carrier.location, destinationStar.location);


        if (instantSpeed) {
            distancePerTick = distanceToDestination;
            nextLocation = destinationStar.location;
        } else {
            distancePerTick = this.carrierTravelService.getCarrierDistancePerTick(game, carrier, warpSpeed, instantSpeed)!;

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

    getCarriersEnRouteToStar(game: Game, star: Star) {
        return game.galaxy.carriers.filter(c => 
            c.waypoints && c.waypoints.length && c.waypoints.find(w => w.destination.toString() === star._id.toString()) != null
        );
    }

    isLostInSpace(game: Game, carrier: Carrier) {
        // If not in transit then it obviously isn't lost in space
        if (!this.carrierTravelService.isInTransit(carrier)) {
            return false;
        }

        // If the carrier has a waypoint then check if the
        // current destination exists.
        if (carrier.waypoints.length) {
            return this.starService.getByIdBS(game, carrier.waypoints[0].destination) == null;
        }

        // If there are no waypoints and they are in transit then must be lost, otherwise all good.
        return carrier.waypoints.length === 0;
    }

};
