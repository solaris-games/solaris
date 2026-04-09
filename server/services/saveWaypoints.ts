import { Game } from "./types/Game";
import { Carrier } from "./types/Carrier";
import { Player } from "./types/Player";
import { DBObjectId } from "./types/DBObjectId";
import { CarrierWaypointBase, ValidationError } from "@solaris/common";
import CarrierMovementService from "./carrierMovement";
import StarService from "./star";
import Repository from "./repository";
import { WaypointService } from '@solaris/common';
import mongoose from 'mongoose';
import CarrierService from "./carrier";
import { StarDataService } from '@solaris/common';
import { KDTree } from "../utils/kdTree";
import ScanningService from "./scanning";
import { DistanceService, GameTypeService } from '@solaris/common';
import { Star } from "./types/Star";

export default class SaveWaypointsService {
    gameRepo: Repository<Game>;
    carrierMovementService: CarrierMovementService;
    starService: StarService;
    waypointService: WaypointService<DBObjectId>;
    carrierService: CarrierService;
    starDataService: StarDataService;
    scanningService: ScanningService;
    distanceService: DistanceService;
    gameTypeService: GameTypeService;

    constructor(
        gameRepo: Repository<Game>,
        carrierMovementService: CarrierMovementService,
        starService: StarService,
        waypointService: WaypointService<DBObjectId>,
        carrierService: CarrierService,
        starDataService: StarDataService,
        scanningService: ScanningService,
        distanceService: DistanceService,
        gameTypeService: GameTypeService,
    ) {
        this.gameRepo = gameRepo;
        this.carrierMovementService = carrierMovementService;
        this.starService = starService;
        this.waypointService = waypointService;
        this.carrierService = carrierService;
        this.starDataService = starDataService;
        this.scanningService = scanningService;
        this.distanceService = distanceService;
        this.gameTypeService = gameTypeService;
    }

    async saveWaypointsForCarrier(game: Game, player: Player, carrier: Carrier, waypoints: CarrierWaypointBase<DBObjectId>[], looped: boolean | null, writeToDB: boolean = true) {
        if (looped === null) {
            looped = false;
        }

        if (carrier.ownedByPlayerId!.toString() !== player._id.toString()) {
            throw new ValidationError('The player does not own this carrier.');
        }

        if (waypoints.length > 30) {
            throw new ValidationError('Cannot plot more than 30 waypoints.');
        }

        if (carrier.isScuttled) {
            throw new ValidationError(`Cannot alter waypoints for a scuttled carrier`);
        }

        if (carrier.isGift) {
            throw new ValidationError('Cannot alter waypoints for a gifted carrier.');
        }

        // If the carrier is currently in transit then double check that the first waypoint
        // matches the source and destination.
        if (!carrier.orbiting) {
            const currentWaypoint = carrier.waypoints[0];
            const newFirstWaypoint = waypoints[0];

            if (!newFirstWaypoint
                || currentWaypoint.source.toString() !== newFirstWaypoint.source.toString()
                || currentWaypoint.destination.toString() !== newFirstWaypoint.destination.toString()) {
                throw new ValidationError('The first waypoint course cannot be changed mid-flight.');
            }

            if (+newFirstWaypoint.delayTicks) {
                throw new ValidationError('The first waypoint cannot have delay ticks if mid-flight.');
            }
        } else if (waypoints?.length > 0) {
            if (carrier.orbiting.toString() !== waypoints[0].source.toString()) {
                throw new ValidationError('The source star does not match the carrier location.');
            }
        }

        let scannedStarSet: Set<Star> | undefined = undefined;
        let treesWithRadius: [number, KDTree][] | undefined = undefined;
        let scanningCheck: 'singleTree' | 'multiTree' | 'none' = 'none';

        // No need to calculate scanning for non-dark games.
        if (this.gameTypeService.isDarkMode(game)) {
            const playerStars = this.starService.listStarsOwnedOrInOrbitByPlayers(game, [player._id]);
            if (waypoints.length > playerStars.length * ScanningService.SINGLE_TREE_COST_FACTOR) {
                // TODO: Calculate during tick processing and load stored tree
                const kdTree = new KDTree(this.distanceService, game.galaxy.stars);

                scannedStarSet = this.scanningService.getStarSetByScanningRange(game, [player], kdTree);
                scanningCheck = 'singleTree';
            } else {
                treesWithRadius = this.scanningService.getScanningStarTrees(game, playerStars);
                scanningCheck = 'multiTree';
            }
        }

        // Validate new waypoints.
        for (let i = 0; i < waypoints.length; i++) {
            const waypoint = waypoints[i];

            const sourceStar = this.starService.getById(game, waypoint.source);
            const destinationStar = this.starService.getById(game, waypoint.destination);

            if (i === 0) {
                if (!destinationStar) {
                    throw new ValidationError("Destination does not exist.");
                }
            } else {
                if (!destinationStar || !sourceStar) {
                    throw new ValidationError("Source or destination does not exist.");
                }

                const previous = waypoints[i - 1];

                if (previous.destination.toString() !== waypoint.source.toString()) {
                    throw new ValidationError(`The waypoint source star does not match the previous waypoint destination star.`);
                }
            }

            const sourceStarName = sourceStar == null ? 'Unknown' : sourceStar.name; // Could be travelling from a destroyed star.

            // Make sure the user isn't being a dumbass.
            waypoint.actionShips = waypoint.actionShips || 0;
            waypoint.action = waypoint.action || 'nothing';

            if (waypoint.actionShips == null || (waypoint.actionShips as any) == '' || +waypoint.actionShips < 0 || !this.waypointService.supportsActionShips(waypoint.action)) {
                waypoint.actionShips = 0;
            }

            if (+waypoint.actionShips < 0) {
                throw new ValidationError(`The waypoint action ships cannot be less than 0.`);
            }

            if (+waypoint.actionShips !== parseInt(waypoint.actionShips.toString())) {
                throw new ValidationError(`The waypoint action ships value must be a whole number.`);
            }

            // Make damn sure there is a delay ticks defined.
            waypoint.delayTicks = waypoint.delayTicks || 0;

            if (waypoint.delayTicks == null || (waypoint.delayTicks as any) == '' || +waypoint.delayTicks < 0) {
                waypoint.delayTicks = 0;
            }

            // Make sure delay ticks isn't a decimal.
            if (+waypoint.delayTicks % 1 != 0) {
                throw new ValidationError(`The waypoint ${sourceStarName} -> ${destinationStar.name} delay cannot be a decimal.`);
            }

            // Make sure the user isn't being a dumbass.
            if (+waypoint.delayTicks < 0) {
                waypoint.delayTicks = 0;
            }

            // Validate waypoint hyperspace range and scanning if:
            // The waypoint is not the first waypoint in the array.
            // The carrier isn't in transit to the first waypoint.
            if (i > 0 || (i === 0 && Boolean(carrier.orbiting))) { // Is one of the next waypoints OR is the first waypoint and isn't in transit
                if (sourceStar && (!this._waypointRouteIsBetweenWormHoles(game, waypoint) && !this.waypointService.starRouteIsWithinHyperspaceRange(game, carrier, sourceStar, destinationStar))) {// Validation of whether the waypoint is within hyperspace range
                    throw new ValidationError(`The waypoint ${sourceStarName} -> ${destinationStar.name} exceeds hyperspace range.`);
                }

                // Validate scanning if needed.
                switch (scanningCheck) {
                    case 'singleTree':
                        if (!this.scanningService.isStarWithinScanningRangeOfStarsBySingleTree(game, destinationStar, scannedStarSet!)) {
                            throw new ValidationError(`The waypoint destination ${destinationStar.name} is not within scanning range.`);
                        }
                        break;
                    case 'multiTree':
                        if (!this.scanningService.isStarWithinScanningRangeOfStars(game, destinationStar, treesWithRadius!)) {
                            throw new ValidationError(`The waypoint destination ${destinationStar.name} is not within scanning range.`);
                        }
                        break;
                    case 'none':
                        break;
                }
            }
        }

        carrier.waypoints = waypoints.map(w => {
            return {
                _id: new mongoose.Types.ObjectId(),
                source: w.source,
                destination: w.destination,
                action: w.action,
                actionShips: w.actionShips,
                delayTicks: w.delayTicks
            }
        });

        // If the waypoints are not a valid loop then throw an error.
        if (looped && !this.waypointService.canLoop(game, carrier)) {
            throw new ValidationError(`The carrier waypoints cannot be looped.`);
        }

        carrier.waypointsLooped = looped;

        // Update the DB.
        if (writeToDB) {
            await this.gameRepo.updateOne({
                _id: game._id,
                'galaxy.carriers._id': carrier._id
            }, {
                $set: {
                    'galaxy.carriers.$.waypoints': waypoints,
                    'galaxy.carriers.$.waypointsLooped': looped,
                }
            });
        }

        // Send back the eta ticks of the waypoints so that
        // the UI can be updated.
        const reportCarrier = Boolean(carrier.toObject) ? carrier.toObject() : carrier;

        return {
            waypoints: reportCarrier.waypoints
        };
    }

    async saveWaypoints(game: Game, player: Player, carrierId: DBObjectId, waypoints: CarrierWaypointBase<DBObjectId>[], looped: boolean) {
        const carrier = this.carrierService.getById(game, carrierId);

        if (!carrier) {
            throw new ValidationError(`Could not find carrier with id ${carrierId}`);
        }

        return await this.saveWaypointsForCarrier(game, player, carrier, waypoints, looped);
    }

    async loopWaypoints(game: Game, player: Player, carrierId: DBObjectId, loop: boolean) {
        let carrier = this.carrierService.getById(game, carrierId);

        if (carrier.ownedByPlayerId!.toString() !== player._id.toString()) {
            throw new ValidationError('The player does not own this carrier.');
        }

        if (carrier.isGift) {
            throw new ValidationError('Cannot loop waypoints of a carrier that is a gift.');
        }

        if (loop) {
            if (carrier.waypoints.length < 1) {
                throw new ValidationError('The carrier must have 2 or more waypoints to loop');
            }

            if (!this.waypointService.canLoop(game, carrier)) {
                throw new ValidationError('The last waypoint star is out of hyperspace range of the first waypoint star.');
            }
        }

        // Update the DB.
        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.carriers._id': carrier._id
        }, {
            $set: {
                'galaxy.carriers.$.waypointsLooped': loop,
            }
        })
    }

    _waypointRouteIsBetweenWormHoles(game: Game, waypoint: CarrierWaypointBase<DBObjectId>) {
        const sourceStar = this.starService.getById(game, waypoint.source);
        const destinationStar = this.starService.getById(game, waypoint.destination);

        // Stars may have been destroyed.
        if (sourceStar == null || destinationStar == null) {
            return false;
        }

        return this.starDataService.isStarPairWormHole(sourceStar, destinationStar);
    }
}