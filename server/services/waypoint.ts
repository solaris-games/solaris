import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "@solaris-common";
import Repository from './repository';
import { Carrier } from './types/Carrier';
import { CarrierWaypoint, CarrierWaypointActionType, CarrierWaypointActionTypes, CarrierWaypointBase } from './types/CarrierWaypoint';
import { Game } from './types/Game';
import { Player } from './types/Player';
import { Star } from './types/Star';
import CarrierService from './carrier';
import DistanceService from './distance';
import GameService from './game';
import PlayerService from './player';
import StarService from './star';
import StarDistanceService from './starDistance';
import TechnologyService from './technology';
import { CarrierActionWaypoint } from './types/GameTick';
import CarrierMovementService from './carrierMovement';
import {GameHistoryCarrierWaypoint} from "./types/GameHistory";
import GameMaskingService from "./gameMaskingService";
import HistoryService from "./history";

const mongoose = require('mongoose');

export default class WaypointService {
    gameRepo: Repository<Game>;
    carrierService: CarrierService;
    starService: StarService;
    distanceService: DistanceService;
    starDistanceService: StarDistanceService;
    technologyService: TechnologyService;
    gameService: GameService;
    playerService: PlayerService;
    carrierMovementService: CarrierMovementService;
    gameMaskingService: GameMaskingService;
    historyService: HistoryService;

    constructor(
        gameRepo: Repository<Game>,
        carrierService: CarrierService,
        starService: StarService,
        distanceService: DistanceService,
        starDistanceService: StarDistanceService,
        technologyService: TechnologyService,
        gameService: GameService,
        playerService: PlayerService,
        carrierMovementService: CarrierMovementService,
        gameMaskingService: GameMaskingService,
        historyService: HistoryService,
    ) {
        this.gameRepo = gameRepo;
        this.carrierService = carrierService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.technologyService = technologyService;
        this.gameService = gameService;
        this.playerService = playerService;
        this.carrierMovementService = carrierMovementService;
        this.gameMaskingService = gameMaskingService;
        this.historyService = historyService;
    }

    async saveWaypoints(game: Game, player: Player, carrierId: DBObjectId, waypoints: CarrierWaypointBase[], looped: boolean) {
        const carrier = this.carrierService.getById(game, carrierId);

        if (!carrier) {
            throw new ValidationError(`Could not find carrier with id ${carrierId}`);
        }
        
        return await this.saveWaypointsForCarrier(game, player, carrier, waypoints, looped);
    }

    fromHistory(wp: GameHistoryCarrierWaypoint) {
        return {
            _id: new mongoose.Types.ObjectId(),
            source: wp.source,
            destination: wp.destination,
            action: 'nothing',
            actionShips: 0,
            delayTicks: 0
        } as CarrierWaypointBase;
    }

    async saveWaypointsForCarrier(game: Game, player: Player, carrier: Carrier, waypoints: CarrierWaypointBase[], looped: boolean | null, writeToDB: boolean = true) {
        if (looped === null) {
            looped = false;
        }
        
        if (carrier.ownedByPlayerId!.toString() !== player._id.toString()) {
            throw new ValidationError('The player does not own this carrier.');
        }

        if (waypoints.length > 30) {
            throw new ValidationError('Cannot plot more than 30 waypoints.');
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

        // Validate new waypoints.
        for (let i = 0; i < waypoints.length; i++) {
            const waypoint = waypoints[i];

            const sourceStar = this.starService.getById(game, waypoint.source);
            const destinationStar = this.starService.getById(game, waypoint.destination);

            const sourceStarName = sourceStar == null ? 'Unknown' : sourceStar.name; // Could be travelling from a destroyed star.

            // Make sure the user isn't being a dumbass.
            waypoint.actionShips = waypoint.actionShips || 0;
            waypoint.action = waypoint.action || 'nothing';
          
            if (waypoint.actionShips == null || (waypoint.actionShips as any) == '' || +waypoint.actionShips < 0 || !this._supportsActionShips(waypoint.action)) {
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

            // Validate waypoint hyperspace range if:
            // The waypoint is not the first waypoint in the array.
            // The carrier isn't in transit to the first waypoint.
            if (i > 0 || (i === 0 && Boolean(carrier.orbiting))) { // Is one of the next waypoints OR is the first waypoint and isn't in transit
                if (sourceStar && (!this._waypointRouteIsBetweenWormHoles(game, waypoint) && !this._starRouteIsWithinHyperspaceRange(game, carrier, sourceStar, destinationStar))) {// Validation of whether the waypoint is within hyperspace range
                    throw new ValidationError(`The waypoint ${sourceStarName} -> ${destinationStar.name} exceeds hyperspace range.`);
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
        if (looped && !this.canLoop(game, player, carrier)) {
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

        // This is important, otherwise, info about warp gates could be leaked.
        // Later on, we probably want to do this on the client
        const history = await this.historyService.getHistoryByTick(game._id, game.state.tick);
        if (history) {
            this.gameMaskingService.maskStars(game, player, history, false);
        }

        this.populateCarrierWaypointEta(game, reportCarrier);

        return {
            ticksEta: reportCarrier.ticksEta,
            ticksEtaTotal: reportCarrier.ticksEtaTotal,
            waypoints: reportCarrier.waypoints
        };
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

    _waypointRouteIsBetweenWormHoles(game: Game, waypoint: CarrierWaypointBase) {
        let sourceStar = this.starService.getById(game, waypoint.source);
        let destinationStar = this.starService.getById(game, waypoint.destination);

        // Stars may have been destroyed.
        if (sourceStar == null || destinationStar == null) {
            return false;
        }

        return this.starService.isStarPairWormHole(sourceStar, destinationStar);
    }

    async cullWaypointsByHyperspaceRangeDB(game: Game, carrier: Carrier) {
        let cullResult = this.cullWaypointsByHyperspaceRange(game, carrier);

        if (cullResult) {
            await this.gameRepo.updateOne({
                _id: game._id,
                'galaxy.carriers._id': carrier._id
            }, {
                $set: {
                    'galaxy.carriers.$.waypoints': cullResult.waypoints,
                    'galaxy.carriers.$.waypointsLooped': cullResult.waypointsLooped,
                }
            });
        }

        return cullResult;
    }

    cullWaypointsByHyperspaceRange(game: Game, carrier: Carrier) {
        if (!carrier.waypoints.length) {
            return;
        }
        
        let player = this.playerService.getById(game, carrier.ownedByPlayerId!)!;

        // Iterate through all waypoints the carrier has one by one and
        // if any of them are not valid then remove it and all subsequent waypoints.
        let waypointsCulled = false;

        // If in transit, then cull starting from the 2nd waypoint.
        let startingWaypointIndex = this.carrierMovementService.isInTransit(carrier) ? 1 : 0;
        if(startingWaypointIndex >= carrier.waypoints.length) return null;
        
        let startingWaypoint = carrier.waypoints[startingWaypointIndex];

        let sourceStar = this.starService.getByIdBS(game, startingWaypoint.source);
        let destinationStar: Star | null = null;

        for (let i = startingWaypointIndex; i < carrier.waypoints.length; i++) {
            let waypoint = carrier.waypoints[i];
            destinationStar = this.starService.getByIdBS(game, waypoint.destination);

            if (!this._starRouteIsWithinHyperspaceRange(game, carrier, sourceStar, destinationStar)) {
                waypointsCulled = true;

                carrier.waypoints.splice(i);

                if (carrier.waypointsLooped) {
                    carrier.waypointsLooped = this.canLoop(game, player, carrier);
                }

                break;
            }
            // Update the source star to be the destination star for the next iteration.
            sourceStar = destinationStar;
        }

        if (waypointsCulled) {
            return {
                waypoints: carrier.waypoints,
                waypointsLooped: carrier.waypointsLooped
            };
        }

        return null;
    }

    cullAllWaypointsByHyperspaceRange(game: Game) {
        for (let carrier of game.galaxy.carriers) {
            this.cullWaypointsByHyperspaceRange(game, carrier);
        }
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

            if (!this.canLoop(game, player, carrier)) {
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

    calculateWaypointTicks(game: Game, carrier: Carrier, waypoint: CarrierWaypoint) {
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

    calculateWaypointTicksEta(game: Game, carrier: Carrier, waypoint: CarrierWaypoint) {
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

    performWaypointAction(carrier: Carrier, star: Star, waypoint: CarrierWaypoint) {
        if (carrier.ownedByPlayerId!.toString() !== star.ownedByPlayerId!.toString()) {
            throw new Error('Cannot perform waypoint action, the carrier and star are owned by different players.')
        }

        switch (waypoint.action) {
            case 'dropAll':
                this._performWaypointActionDropAll(carrier, star, waypoint);
                break;
            case 'drop':
                this._performWaypointActionDrop(carrier, star, waypoint);
                break;
            case 'dropPercentage':
                this._performWaypointActionDropPercentage(carrier, star, waypoint);
                break;
            case 'dropAllBut':
                this._performWaypointActionDropAllBut(carrier, star, waypoint);
                break;
            case 'collectAll':
                this._performWaypointActionCollectAll(carrier, star, waypoint);
                break;
            case 'collect':
                this._performWaypointActionCollect(carrier, star, waypoint);
                break;
            case 'collectPercentage':
                this._performWaypointActionCollectPercentage(carrier, star, waypoint);
                break;
            case 'collectAllBut':
                this._performWaypointActionCollectAllBut(carrier, star, waypoint);
                break;
            case 'garrison':
                this._performWaypointActionGarrison(carrier, star, waypoint);
                break;
        }
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

    _performWaypointActionDropAll(carrier: Carrier, star: Star, waypoint: CarrierWaypoint) {
        star.shipsActual! += (carrier.ships! - 1)
        star.ships = Math.floor(star.shipsActual!);
        carrier.ships = 1;
    }

    _performWaypointActionCollectAll(carrier: Carrier, star: Star, waypoint: CarrierWaypoint) {
        carrier.ships! += star.ships!;
        star.shipsActual! -= star.ships!;
        star.ships = Math.floor(star.shipsActual!);
    }

    _performWaypointActionDrop(carrier: Carrier, star: Star, waypoint: CarrierWaypoint) {
        // If the carrier has more ships than needs to be dropped, then drop
        // however many are configured in the waypoint.
        if (carrier.ships! - 1 >= waypoint.actionShips) {
            star.shipsActual! += waypoint.actionShips;
            star.ships = Math.floor(star.shipsActual!);
            carrier.ships! -= waypoint.actionShips;
        }
        else {
            // If there aren't enough ships, then do a drop all.
            this._performWaypointActionDropAll(carrier, star, waypoint);
        }
    }
    
    performWaypointActionsDrops(game: Game, waypoints: CarrierActionWaypoint[]) {
        this._performFilteredWaypointActions(game, waypoints, ['dropAll', 'drop', 'dropAllBut', 'dropPercentage']);
    }

    _performWaypointActionCollect(carrier: Carrier, star: Star, waypoint: CarrierWaypoint) {
        // If the star has more ships than needs to be collected, then collect
        // however many are configured in the waypoint.
        if (star.ships! >= waypoint.actionShips) {
            star.shipsActual! -= waypoint.actionShips;
            star.ships = Math.floor(star.shipsActual!);
            carrier.ships! += waypoint.actionShips;
        }
        else {
            // If there aren't enough ships, then do a collect all.
            this._performWaypointActionCollectAll(carrier, star, waypoint);
        }
    }

    performWaypointActionsCollects(game: Game, waypoints: CarrierActionWaypoint[]) {
        this._performFilteredWaypointActions(game, waypoints, ['collectAll', 'collect', 'collectAllBut', 'collectPercentage']);
    }

    _performWaypointActionDropPercentage(carrier: Carrier, star: Star, waypoint: CarrierWaypoint) {
        const toDrop = Math.floor(carrier.ships! * (waypoint.actionShips * 0.01))

        if (toDrop >= 1 && carrier.ships! - toDrop >= 1) {
            star.shipsActual! += toDrop
            star.ships = Math.floor(star.shipsActual!)
            carrier.ships! -= toDrop
        }
    }

    _performWaypointActionDropAllBut(carrier: Carrier, star: Star, waypoint: CarrierWaypoint) {
        // Calculate the difference between how many ships we currently have
        // and how many need to remain after.
        let difference = carrier.ships! - waypoint.actionShips;

        // If we have more than enough ships to transfer, then transfer
        // the desired amount. Otherwise do not drop anything.
        if (difference > 0 && difference <= carrier.ships! - 1) {
            star.shipsActual! += difference;
            star.ships = Math.floor(star.shipsActual!);
            carrier.ships! -= difference;
        }
    }

    _performWaypointActionCollectPercentage(carrier: Carrier, star: Star, waypoint: CarrierWaypoint) {
        const toTransfer = Math.floor(star.ships! * (waypoint.actionShips * 0.01))

        if (toTransfer >= 1 && star.ships! - toTransfer >= 0) {
            star.shipsActual! -= toTransfer
            star.ships = Math.floor(star.shipsActual!)
            carrier.ships! += toTransfer
        }
    }

    _performWaypointActionCollectAllBut(carrier: Carrier, star: Star, waypoint: CarrierWaypoint) {
        // Calculate the difference between how many ships we currently have
        // and how many need to remain after.
        let difference = star.ships! - waypoint.actionShips;

        // If we have more than enough ships to transfer, then transfer
        // the desired amount. Otherwise do not drop anything.
        if (difference > 0 && difference <= star.ships!) {
            star.shipsActual! -= difference;
            star.ships = Math.floor(star.shipsActual!);
            carrier.ships! += difference;
        }
    }

    _performWaypointActionGarrison(carrier: Carrier, star: Star, waypoint: CarrierWaypoint) {
        // Calculate how many ships need to be dropped or collected
        // in order to garrison the star.
        let difference = star.ships! - waypoint.actionShips;

        // If the difference is above 0 then move ships
        // from the star to the carrier, otherwise do the opposite.
        if (difference > 0) {
            let allowed = Math.abs(Math.min(difference, star.ships!));

            star.shipsActual! -= allowed;
            carrier.ships! += allowed;
        } else {
            let allowed = Math.min(Math.abs(difference), carrier.ships! - 1);

            star.shipsActual! += allowed;
            carrier.ships! -= allowed;
        }

        star.ships = Math.floor(star.shipsActual!);
    }

    performWaypointActionsGarrisons(game: Game, waypoints: CarrierActionWaypoint[]) {
        this._performFilteredWaypointActions(game, waypoints, ['garrison']);
    }

    _performFilteredWaypointActions(game: Game, waypoints: CarrierActionWaypoint[], waypointTypes: CarrierWaypointActionType[]) {
        let actionWaypoints = waypoints.filter(w => 
            waypointTypes.indexOf(w.waypoint.action) > -1
            && w.carrier.ownedByPlayerId!.toString() === w.star.ownedByPlayerId!.toString() // The carrier must be owned by the player who owns the star.
        );

        for (let actionWaypoint of actionWaypoints) {
            this.performWaypointAction(actionWaypoint.carrier, actionWaypoint.star, actionWaypoint.waypoint);
        }
    }

    sanitiseAllCarrierWaypointsByScanningRange(game: Game) {
        const players = this._getPlayersWithOwnedOrInOrbitStars(game);
        game.galaxy.carriers
            .filter(c => c.waypoints.length && c.ownedByPlayerId)
            .forEach(c => {
                this._checkCarrierRoute(game, c, players.get(c.ownedByPlayerId!.toString())!);
            });
    }

    _checkCarrierRoute(game: Game, carrier: Carrier, player: { player: Player, stars: Star[], inRange: string[] }) {
        let startIndex = this.carrierMovementService.isInTransit(carrier) ? 1 : 0;
        for (let index = startIndex; index < carrier.waypoints.length; index++) {
            const waypoint = carrier.waypoints[index];
            if(waypoint.destination.toString() in player.inRange) continue;
            const waypointStar = this.starService.getById(game, waypoint.destination);
            if(this._checkWaypointStarInRange(game, waypointStar, player)){
                player.inRange.push(waypoint.destination.toString());
            }else{
                carrier.waypoints.splice(index);

                if (carrier.waypointsLooped) {
                    carrier.waypointsLooped = this.canLoop(game, player.player, carrier);
                }

                break;
            }
        }
    }

    _checkWaypointStarInRange(game: Game, waypoint: Star, player: { player: Player, stars: Star[], inRange: string[] }) {
        for (let index = 0; index < player.stars.length; index++) {
            const star = player.stars[index];
            if(this.starService.getStarsWithinScanningRangeOfStarByStarIds(game, star, [waypoint]).length) return true;
        }
        return false;
    }

    _getPlayersWithOwnedOrInOrbitStars(game: Game) {
        const results = new Map<string, { player: Player, stars: Star[], inRange: string[] }>();
        game.galaxy.players
            .forEach(p => {
                const starsOwnedOrInOrbit = this.starService.listStarsOwnedOrInOrbitByPlayers(game, [p._id]);
                const starsWithScanning = starsOwnedOrInOrbit.filter(s => !this.starService.isDeadStar(s));
                let wormHoleStars = starsOwnedOrInOrbit.filter(s => s.wormHoleToStarId)
                wormHoleStars.forEach(s => {
                    starsOwnedOrInOrbit.push(s, this.starService.getById(game, s.wormHoleToStarId!))
                });
                results.set(p._id.toString(), {
                    player: p,
                    stars: starsWithScanning,
                    inRange: starsOwnedOrInOrbit.map(s => s._id.toString())
                });
            });
        return results;
    }
};
