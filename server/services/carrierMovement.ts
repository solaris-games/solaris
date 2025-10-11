import Repository from './repository';
import { Carrier } from './types/Carrier';
import { CarrierWaypoint } from 'solaris-common';
import { Game } from './types/Game';
import { Player } from './types/Player';
import { Star } from './types/Star';
import { User } from './types/User';
import CarrierGiftService from './carrierGift';
import DiplomacyService from './diplomacy';
import { DistanceService } from 'solaris-common';
import SpecialistService from './specialist';
import StarService from './star';
import TechnologyService from "./technology";
import { StarDistanceService } from 'solaris-common';
import {logger} from "../utils/logging";
import {DBObjectId} from "./types/DBObjectId";

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

    constructor(
        gameRepo: Repository<Game>,
        distanceService: DistanceService,
        starService: StarService,
        specialistService: SpecialistService,
        diplomacyService: DiplomacyService,
        carrierGiftService: CarrierGiftService,
        technologyService: TechnologyService,
        starDistanceService: StarDistanceService,
    ) {
        this.gameRepo = gameRepo;
        this.distanceService = distanceService;
        this.starService = starService;
        this.specialistService = specialistService;
        this.diplomacyService = diplomacyService;
        this.carrierGiftService = carrierGiftService;
        this.technologyService = technologyService;
        this.starDistanceService = starDistanceService;
    }

    getCarrierDistancePerTick(game: Game, carrier: Carrier, warpSpeed: boolean = false, instantSpeed: boolean | null = false) {
        if (instantSpeed) {
            return null;
        }

        let distanceModifier = warpSpeed ? game.constants.distances.warpSpeedMultiplier : 1;

        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            if (specialist && specialist.modifiers.local) {
                distanceModifier *= (specialist.modifiers.local.speed || 1);
            }
        }

        return game.settings.specialGalaxy.carrierSpeed * distanceModifier;
    }

    moveCarrierToCurrentWaypoint(carrier: Carrier, destinationStar: Star, distancePerTick: number) {
        let nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);

        carrier.location = nextLocation;
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

        if (this.isLaunching(carrierInTransit)) {
            const sourceStarId = carrierInTransit.orbiting!;
            const destinationStarId = waypoint.destination;
            const sourceStar = this.starService.getByIdBS(game, sourceStarId);
            const destinationStar = this.starService.getByIdBS(game, destinationStarId);

            if (!sourceStar || !destinationStar) {
                carrierInTransit.waypoints = [];
                return null;
            }

            if (!this.isWithinHyperspaceRange(game, carrierInTransit, sourceStar, destinationStar)) {
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
        const warpSpeed = this.canTravelAtWarpSpeed(game, carrierOwner, carrierInTransit, sourceStar, destinationStar);
        const instantSpeed = this.starService.isStarPairWormHole(sourceStar, destinationStar);
        const distancePerTick = this.getCarrierDistancePerTick(game, carrierInTransit, warpSpeed, instantSpeed); // Null signifies instant travel

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
            warpSpeed = this.canTravelAtWarpSpeed(game, carrierOwner, carrier, sourceStar, destinationStar);
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

    isWithinHyperspaceRange(game: Game, carrier: Carrier, sourceStar: Star, destinationStar: Star) {
        // If the stars are a wormhole pair then they are always considered to be in hyperspace range.
        if (this.starService.isStarPairWormHole(sourceStar, destinationStar)) {
            return true;
        }

        let effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(game, carrier, true);
        let hyperspaceDistance = this.distanceService.getHyperspaceDistance(game, effectiveTechs.hyperspace);

        let distanceBetweenStars = this.starDistanceService.getDistanceBetweenStars(sourceStar, destinationStar);

        return distanceBetweenStars <= hyperspaceDistance;
    }

    canTravelAtWarpSpeed(game: Game, player: Player, carrier: Carrier, sourceStar: Star, destinationStar: Star) {
        // Double check for destroyed stars.
        if (sourceStar == null || destinationStar == null) {
            return false;
        }

        // If both stars have warp gates and they are both owned by players...
        if (sourceStar.warpGate && destinationStar.warpGate && sourceStar.ownedByPlayerId && destinationStar.ownedByPlayerId) {
            // If both stars are owned by the player or by allies then carriers can always move at warp.
            let sourceAllied = sourceStar.ownedByPlayerId.toString() === carrier.ownedByPlayerId!.toString() || (this.diplomacyService.isFormalAlliancesEnabled(game) && this.diplomacyService.isDiplomaticStatusToPlayersAllied(game, sourceStar.ownedByPlayerId, [carrier.ownedByPlayerId!]));
            let desinationAllied = destinationStar.ownedByPlayerId.toString() === carrier.ownedByPlayerId!.toString() || (this.diplomacyService.isFormalAlliancesEnabled(game) && this.diplomacyService.isDiplomaticStatusToPlayersAllied(game, destinationStar.ownedByPlayerId, [carrier.ownedByPlayerId!]));

            // If both stars are owned by the player then carriers can always move at warp.
            if (sourceAllied && desinationAllied) {
                return true;
            }

            // If one of the stars are not owned by the current player then we need to check for
            // warp scramblers.

            // But if the carrier has the warp stabilizer specialist then it can travel at warp speed no matter
            // which player it belongs to or whether the stars it is travelling to or from have locked warp gates.
            if (carrier.specialistId) {
                let carrierSpecialist = this.specialistService.getByIdCarrier(carrier.specialistId);

                if (carrierSpecialist && carrierSpecialist.modifiers.special && carrierSpecialist.modifiers.special.unlockWarpGates) {
                    return true;
                }
            }

            // If either star has a warp scrambler present then carriers cannot move at warp.
            // Note that we only need to check for scramblers on stars that do not belong to the player.
            if (!sourceAllied && sourceStar.specialistId) {
                let specialist = this.specialistService.getByIdStar(sourceStar.specialistId);

                if (specialist && specialist.modifiers.special && specialist.modifiers.special.lockWarpGates) {
                    return false;
                }
            }

            if (!desinationAllied && destinationStar.specialistId) {
                let specialist = this.specialistService.getByIdStar(destinationStar.specialistId);

                if (specialist && specialist.modifiers.special && specialist.modifiers.special.lockWarpGates) {
                    return false;
                }
            }

            // If none of the stars have scramblers then warp speed ahead.
            return true;
        }

        return false;
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
            return this.starService.getByIdBS(game, carrier.waypoints[0].destination) == null;
        }

        // If there are no waypoints and they are in transit then must be lost, otherwise all good.
        return carrier.waypoints.length === 0;
    }

};
