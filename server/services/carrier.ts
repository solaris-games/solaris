import mongoose from 'mongoose';
import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "solaris-common";
import Repository from './repository';
import { Carrier } from './types/Carrier';
import { CarrierWaypoint } from 'solaris-common';
import { Game } from './types/Game';
import { MapObject } from './types/Map';
import { Player } from './types/Player';
import { Star } from './types/Star';
import { DistanceService } from 'solaris-common';
import SpecialistService from './specialist';
import StarService from './star';
import TechnologyService from './technology';
const EventEmitter = require('events');

const CARRIER_LIMIT_MIN = 50;

export default class CarrierService extends EventEmitter {
    gameRepo: Repository<Game>;
    distanceService: DistanceService;
    starService: StarService;
    technologyService: TechnologyService;
    specialistService: SpecialistService;

    constructor(
        gameRepo: Repository<Game>,
        distanceService: DistanceService,
        starService: StarService,
        technologyService: TechnologyService,
        specialistService: SpecialistService
    ) {
        super();

        this.gameRepo = gameRepo;
        this.distanceService = distanceService;
        this.starService = starService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
    }

    getById(game: Game, id: DBObjectId) {
        return this.getByIdBS(game, id); // Experimental
    }

    getByIdBS(game: Game, id: DBObjectId) {
        let start = 0;
        let end = game.galaxy.carriers.length - 1;
    
        while (start <= end) {
            let middle = Math.floor((start + end) / 2);
            let carrier = game.galaxy.carriers[middle];

            if (carrier._id.toString() === id.toString()) {
                // found the id
                return carrier;
            } else if (carrier._id.toString() < id.toString()) {
                // continue searching to the right
                start = middle + 1;
            } else {
                // search searching to the left
                end = middle - 1;
            }
        }

        // id wasn't found
        // Return the old way
        return game.galaxy.carriers.find(s => s._id.toString() === id.toString())!;
    }

    getCarriersAtStar(game: Game, starId: DBObjectId) {
      return game.galaxy.carriers.filter(carrier => carrier.orbiting && carrier.orbiting.toString() === starId.toString())
    }

    getCarrierLimit(game: Game, player: Player) {
        const starCount = game.galaxy.stars.filter((star) => star.ownedByPlayerId && star.ownedByPlayerId.toString() === player._id.toString()).length;

        return Math.max(CARRIER_LIMIT_MIN, starCount * 10);
    }

    createAtStar(star: Star, carriers: Carrier[], ships: number = 1): Carrier {
        if (!Math.floor(star.shipsActual!)) {
            throw new ValidationError('Star must have at least 1 ship to build a carrier.');
        }

        // Generate a name for the new carrier based on the star name but make sure
        // this name isn't already taken by another carrier.
        let name = this.generateCarrierName(star, carriers);

        let carrier: Carrier = {
            _id: new mongoose.Types.ObjectId(),
            ownedByPlayerId: star.ownedByPlayerId,
            ships: ships,
            orbiting: star._id,
            location: star.location,
            name,
            waypoints: [],
            waypointsLooped: false,
            specialistId: null,
            specialistExpireTick: null,
            specialist: null,
            isGift: false,
            locationNext: null,
            toObject(): Carrier {
                return this
            }
        };

        // Reduce the star ships by how many we have added to the carrier.
        star.shipsActual! -= ships;
        star.ships! -= ships;

        // Check to see if the carrier should be auto-assigned a specialist.
        if (star.specialistId) {
            let starSpecialist = this.specialistService.getByIdStar(star.specialistId);
    
            if (starSpecialist?.modifiers.special?.autoCarrierSpecialistAssign) {
                carrier.specialistId = starSpecialist.modifiers.special!.autoCarrierSpecialistAssign!;
                carrier.specialist = this.specialistService.getByIdCarrier(carrier.specialistId)
            }
        }

        return carrier;
    }

    listCarriersOwnedByPlayer(carriers: Carrier[], playerId: DBObjectId) {
        return carriers.filter(s => s.ownedByPlayerId && s.ownedByPlayerId.toString() === playerId.toString());
    }

    listCarriersOwnedByPlayers(carriers: Carrier[], playerIds: DBObjectId[]) {
        const ids = playerIds.map(p => p.toString());

        return carriers.filter(s => s.ownedByPlayerId && ids.includes(s.ownedByPlayerId.toString()));
    }

    listCarriersOwnedByPlayerInOrbit(carriers: Carrier[], playerId: DBObjectId) {
        return this.listCarriersOwnedByPlayer(carriers, playerId).filter(c => c.orbiting);
    }

    listCarriersOwnedByPlayersInOrbit(carriers: Carrier[], playerIds: DBObjectId[]) {
        return this.listCarriersOwnedByPlayers(carriers, playerIds).filter(c => c.orbiting);
    }

    generateCarrierName(star: Star, carriers: Carrier[]) {
        let i = 1;
        let name = `${star.name} ${i++}`;
        
        while (carriers.find(c => c.name == name)) {
            name = `${star.name} ${i++}`;
        }

        return name;
    }

    getCarriersWithinScanningRangeOfStarByCarrierIds(game: Game, star: Star, carriers: MapObject[]): MapObject[] {
        // If the star isn't owned then it cannot have a scanning range
        if (star.ownedByPlayerId == null) {
            return [];
        }

        // Calculate the scanning distance of the given star.
        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);
        let scanningRangeDistance = this.distanceService.getScanningDistance(game, effectiveTechs.scanning);

        // Go through all carriers and the ones that are within the star's scanning range.
        let carriersInRange = carriers.filter(c => {
            return this.distanceService.getDistanceBetweenLocations(c.location, star.location) <= scanningRangeDistance;
        });

        return carriersInRange;
    }

    filterCarriersByScanningRange(game: Game, playerIds: DBObjectId[]) {
        const ids = playerIds.map(p => p.toString());

        // Stars may have different scanning ranges independently so we need to check
        // each star to check what is within its scanning range.
        let playerStars = this.starService.listStarsWithScanningRangeByPlayers(game, playerIds);

        // Start with all of the carriers that the player owns as
        // the player can always see those carriers.
        let carriersInRange: DBObjectId[] = game.galaxy.carriers
            .filter(c => ids.includes(c.ownedByPlayerId!.toString()))
            .map(c => c._id);

        // We need to check all carriers NOT owned by the player.
        let carriersToCheck = game.galaxy.carriers
            .filter(c => !ids.includes(c.ownedByPlayerId!.toString()))
            .map(c => {
                return {
                    _id: c._id,
                    ownedByPlayerId: c.ownedByPlayerId,
                    location: c.location
                };
            });

        for (let star of playerStars) {
            let carrierIds = this.getCarriersWithinScanningRangeOfStarByCarrierIds(game, star, carriersToCheck);

            for (let carrierId of carrierIds) {
                if (carriersInRange.indexOf(carrierId._id) === -1) {
                    carriersInRange.push(carrierId._id);
                    carriersToCheck.splice(carriersToCheck.indexOf(carrierId), 1);
                }
            }

            // If we've checked all carriers then no need to continue.
            if (!carriersToCheck.length) {
                break;
            }
        }

        return carriersInRange.map(c => this.getById(game, c));
    }

    sanitizeCarriersByPlayers(game: Game, playerIds: DBObjectId[]) {
        const ids = playerIds.map(p => p.toString());

        // Filter all waypoints (except those in transit) for all carriers that do not belong
        // to the player.
        return game.galaxy.carriers
        .map(c => {
            if (ids.includes(c.ownedByPlayerId!.toString())) {
                return c;
            }

            // Return only key data about the carrier and the waypoints
            // if the carrier does not belong to the given player.
            let carrierData = {
                _id: c._id,
                ownedByPlayerId: c.ownedByPlayerId,
                orbiting: c.orbiting,
                name: c.name,
                ships: c.ships,
                location: c.location,
                waypoints: c.waypoints,
                isGift: c.isGift,
                specialistId: c.specialistId,
                specialistExpireTick: c.specialistExpireTick,
                specialist: null
            };

            carrierData.waypoints = this.clearCarrierWaypointsNonTransit(c, true);

            return carrierData;
        });
    }

    clearCarrierWaypointsNonTransit(carrier: Carrier, obfuscateFirstWaypoint: boolean = false) {
        let waypoints: CarrierWaypoint<DBObjectId>[] = [];

        if (!carrier.orbiting) {
            waypoints = carrier.waypoints.slice(0, 1);

            if (obfuscateFirstWaypoint) {
                // Hide any sensitive info about the waypoint.
                let wp = waypoints[0];

                if (wp) {
                    wp.action = 'nothing';
                    wp.actionShips = 0;
                    wp.delayTicks = 0;
                }

                carrier.waypointsLooped = false;
            }
        }

        return waypoints;
    }
    
    clearPlayerCarrierWaypointsNonTransit(game: Game, player: Player) {
        let carriers = this.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

        for (let carrier of carriers) {
            carrier.waypoints = this.clearCarrierWaypointsNonTransit(carrier);
        }
    }
    
    clearPlayerCarrierWaypointsLooped(game: Game, player: Player) {
        let carriers = this.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

        for (let carrier of carriers) {
            carrier.waypointsLooped = false;
        }
    }

    clearPlayerCarriers(game: Game, player: Player) {
        game.galaxy.carriers = game.galaxy.carriers.filter(c => !c.ownedByPlayerId
            || c.ownedByPlayerId.toString() !== player._id.toString());
    }

    async rename(game: Game, player: Player, carrierId: DBObjectId, name: string) {
        let carrier = this.getById(game, carrierId);

        if (!carrier) {
            throw new ValidationError('Carrier does not exist');
        }

        if (!name || name.trim().length === 0) {
            throw new ValidationError('Name is required.');
        }

        if (carrier.ownedByPlayerId!.toString() !== player._id.toString()) {
            throw new ValidationError(`Cannot rename carrier, you are not its owner.`);
        }

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.carriers._id': carrierId
        }, {
            $set: {
                'galaxy.carriers.$.name': name
            }
        });
    }

    async scuttle(game: Game, player: Player, carrierId: DBObjectId) {
        let carrier = this.getById(game, carrierId);

        if (!carrier) {
            throw new ValidationError('Carrier does not exist');
        }

        if (carrier.ownedByPlayerId!.toString() !== player._id.toString()) {
            throw new ValidationError(`Cannot scuttle carrier, you are not its owner.`);
        }

        if (carrier.isGift) {
            throw new ValidationError(`Cannot scuttle a gift.`);
        }

        await this.gameRepo.updateOne({
            _id: game._id
        }, {
            $pull: {
                'galaxy.carriers': {
                    _id: carrierId
                }
            }
        });

        // TODO: Event?
    }

    canPlayersSeeCarrierShips(game: Game, players: Player[], carrier: Carrier) {
        const ids = players.map(p => p._id.toString());
        const isOwnedByPlayer = ids.includes(carrier.ownedByPlayerId!.toString());

        if (isOwnedByPlayer) {
            return true;
        }

        // Check if the carrier is in orbit of a nebula as nebula always hides ships for other players.
        if (this.isInOrbitOfNebula(game, carrier)) {
            return false;
        }

        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            // If the carrier has a hideShips spec and is not owned by the given player
            // then that player cannot see the carrier's ships.
            if (specialist && specialist.modifiers.special && specialist.modifiers.special.hideShips) {
                return false;
            }
        }

        return true;
    }

    isInOrbitOfNebula(game: Game, carrier: Carrier) {
        if (carrier.orbiting) {
            const orbitStar = this.starService.getById(game, carrier.orbiting);

            return Boolean(orbitStar?.isNebula);
        }

        return false;
    }

    destroyCarrier(game: Game, carrier: Carrier) {
        game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(carrier), 1);
    }
    
    listGiftCarriersInOrbit(game: Game) {
        return game.galaxy.carriers.filter(c => c.isGift && c.orbiting && c.waypoints.length === 0);
    }

};
