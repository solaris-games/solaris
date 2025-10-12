import {Carrier} from "./types/Carrier";
import {Star} from "./types/Star";
import {Game} from "./types/Game";
import {DistanceService, Specialist, StarDistanceService, TechnologyService} from "@solaris-common";
import StarService from "./star";
import DiplomacyService from "./diplomacy";
import {Player} from "./types/Player";

interface ISpecialistService {
    getByIdStar(id: number): Specialist | null;
    getByIdCarrier(id: number): Specialist | null;
}

export default class CarrierTravelService {
    specialistService: ISpecialistService;
    starService: StarService;
    technologyService: TechnologyService;
    distanceService: DistanceService;
    starDistanceService: StarDistanceService;
    diplomacyService: DiplomacyService;

    constructor(specialistService: ISpecialistService, starService: StarService, technologyService: TechnologyService, distanceService: DistanceService, starDistanceService: StarDistanceService, diplomacyService: DiplomacyService) {
        this.specialistService = specialistService;
        this.starService = starService;
        this.technologyService = technologyService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.diplomacyService = diplomacyService;
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
}