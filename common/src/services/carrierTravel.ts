import type {Specialist} from "../types/common/specialist";
import type {Game} from "../types/common/game";
import type {Id} from "../types/id";
import type {TechnologyService} from "./technology";
import type {DistanceService} from "./distance";
import type {StarDistanceService} from "./starDistance";
import type {StarDataService} from "./starData";
import type {Carrier} from "../types/common/carrier";
import type {Player} from "../types/common/player";
import type {Star} from "../types/common/star";

interface ISpecialistService {
    getByIdStar(id: number): Specialist | null;
    getByIdCarrier(id: number): Specialist | null;
}

interface IDiplomacyService<ID extends Id> {
    isFormalAlliancesEnabled(game: Game<ID>): boolean;
    isDiplomaticStatusToPlayersAllied(game: Game<ID>, playerId: ID, otherPlayerIds: ID[]): boolean;
}

export class CarrierTravelService<ID extends Id> {
    specialistService: ISpecialistService;
    technologyService: TechnologyService;
    distanceService: DistanceService;
    starDistanceService: StarDistanceService;
    diplomacyService: IDiplomacyService<ID>;
    starDataService: StarDataService;

    constructor(specialistService: ISpecialistService, technologyService: TechnologyService, distanceService: DistanceService, starDistanceService: StarDistanceService, diplomacyService: IDiplomacyService<ID>, starDataService: StarDataService) {
        this.specialistService = specialistService;
        this.technologyService = technologyService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.diplomacyService = diplomacyService;
        this.starDataService = starDataService;
    }

    getCarrierDistancePerTick(game: Game<ID>, carrier: Carrier<ID>, warpSpeed: boolean = false, instantSpeed: boolean | null = false) {
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

    isWithinHyperspaceRange(game: Game<ID>, carrier: Carrier<ID>, sourceStar: Star<ID>, destinationStar: Star<ID>) {
        // If the stars are a wormhole pair then they are always considered to be in hyperspace range.
        if (this.starDataService.isStarPairWormHole(sourceStar, destinationStar)) {
            return true;
        }

        let effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(game, carrier, true);
        let hyperspaceDistance = this.distanceService.getHyperspaceDistance(game, effectiveTechs.hyperspace);

        let distanceBetweenStars = this.starDistanceService.getDistanceBetweenStars(sourceStar, destinationStar);

        return distanceBetweenStars <= hyperspaceDistance;
    }

    canTravelAtWarpSpeed(game: Game<ID>, player: Player<ID>, carrier: Carrier<ID>, sourceStar: Star<ID>, destinationStar: Star<ID>) {
        // Double check for destroyed stars.
        if (sourceStar == null || destinationStar == null) {
            return false;
        }

        // If both stars have warp gates and they are both owned by players...
        if (sourceStar.warpGate && destinationStar.warpGate && sourceStar.ownedByPlayerId && destinationStar.ownedByPlayerId) {
            // If both stars are owned by the player or by allies then carriers can always move at warp.

            const sourceAllied = sourceStar.ownedByPlayerId.toString() === carrier.ownedByPlayerId!.toString() || (this.diplomacyService.isFormalAlliancesEnabled(game) && this.diplomacyService.isDiplomaticStatusToPlayersAllied(game, carrier.ownedByPlayerId!, [sourceStar.ownedByPlayerId]));
            const destinationAllied = destinationStar.ownedByPlayerId.toString() === carrier.ownedByPlayerId!.toString() || (this.diplomacyService.isFormalAlliancesEnabled(game) && this.diplomacyService.isDiplomaticStatusToPlayersAllied(game, carrier.ownedByPlayerId!, [destinationStar.ownedByPlayerId]));

            // If both stars are owned by the player or allies then carriers can always move at warp.
            if (sourceAllied && destinationAllied) {
                return true;
            }

            // If one of the stars are not owned by the current player then we need to check for
            // warp scramblers.

            // But if the carrier has the warp stabilizer specialist then it can travel at warp speed no matter
            // which player it belongs to or whether the stars it is travelling to or from have locked warp gates.
            if (carrier.specialistId) {
                const carrierSpecialist = this.specialistService.getByIdCarrier(carrier.specialistId);

                if (carrierSpecialist && carrierSpecialist.modifiers.special && carrierSpecialist.modifiers.special.unlockWarpGates) {
                    return true;
                }
            }

            // If either star has a warp scrambler present then carriers cannot move at warp.
            // Note that we only need to check for scramblers on stars that do not belong to the player.
            if (!sourceAllied && sourceStar.specialistId) {
                const specialist = this.specialistService.getByIdStar(sourceStar.specialistId);

                if (specialist && specialist.modifiers.special && specialist.modifiers.special.lockWarpGates) {
                    return false;
                }
            }

            if (!destinationAllied && destinationStar.specialistId) {
                const specialist = this.specialistService.getByIdStar(destinationStar.specialistId);

                if (specialist && specialist.modifiers.special && specialist.modifiers.special.lockWarpGates) {
                    return false;
                }
            }

            // If none of the stars have scramblers then warp speed ahead.
            return true;
        }

        return false;
    }

    isInTransit(carrier: Carrier<ID>) {
        return !carrier.orbiting;
    }

    isInTransitTo(carrier: Carrier<ID>, star: Star<ID>) {
        return this.isInTransit(carrier) && carrier.waypoints[0].destination.toString() === star._id.toString();
    }

    isLaunching(carrier: Carrier<ID>) {
        return carrier.orbiting && carrier.waypoints.length && carrier.waypoints[0].delayTicks === 0;
    }
}