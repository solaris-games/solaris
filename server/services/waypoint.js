const ValidationError = require('../errors/validation');

module.exports = class WaypointService {

    constructor(gameModel, carrierService, starService, distanceService, 
        starDistanceService, technologyService, gameService, playerService) {
        this.gameModel = gameModel;
        this.carrierService = carrierService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.technologyService = technologyService;
        this.gameService = gameService;
        this.playerService = playerService;
    }

    async saveWaypoints(game, player, carrierId, waypoints, looped) {
        let carrier = this.carrierService.getById(game, carrierId);
        
        if (!carrier.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError('The player does not own this carrier.');
        }
        
        if (carrier.isGift) {
            throw new ValidationError('Cannot change waypoints of a carrier that is a gift.');
        }

        let effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(game, carrier);
        let hyperspaceDistance = this.distanceService.getHyperspaceDistance(game, effectiveTechs.hyperspace);

        // If the carrier is currently in transit then double check that the first waypoint
        // matches the source and destination.
        if (!carrier.orbiting) {
            let currentWaypoint = carrier.waypoints[0];
            let newFirstWaypoint = waypoints[0];

            if (!newFirstWaypoint 
                || currentWaypoint.source.toString() !== newFirstWaypoint.source
                || currentWaypoint.destination.toString() !== newFirstWaypoint.destination) {
                    throw new ValidationError('The first waypoint course cannot be changed mid-flight.');
                }

            if (+newFirstWaypoint.delayTicks) {
                throw new ValidationError('The first waypoint cannot have delay ticks if mid-flight.');
            }
        }

        // Validate new waypoints.
        for (let i = 0; i < waypoints.length; i++) {
            let waypoint = waypoints[i];

            let sourceStar = this.starService.getByObjectId(game, waypoint.source);
            let destinationStar = this.starService.getByObjectId(game, waypoint.destination);

            // Make sure delay ticks isn't a decimal.
            if (+waypoint.delayTicks % 1 != 0) {
                throw new ValidationError(`The waypoint ${sourceStar.name} --> ${destinationStar.name} delay cannot be a decimal.`);
            }

            let distanceBetweenStars = this.starDistanceService.getDistanceBetweenStars(sourceStar, destinationStar);

            if (distanceBetweenStars > hyperspaceDistance) {
                throw new ValidationError(`The waypoint ${sourceStar.name} --> ${destinationStar.name} exceeds hyperspace range.`);
            }

            if (waypoint.actionShips == null || +waypoint.actionShips < 0) {
                throw new ValidationError(`The waypoint ${sourceStar.name} --> ${destinationStar.name} cannot have action ships less than 0.`);
            }
        }
        
        carrier.waypoints = waypoints;

        // If the waypoints are not a valid loop then throw an error.
        if (looped && !this.canLoop(game, player, carrier)) {
            throw new ValidationError(`The carrier waypoints cannot be looped.`);
        }

        carrier.waypointsLooped = looped;

        // Update the DB.
        await this.gameModel.updateOne({
            _id: game._id,
            'galaxy.carriers._id': carrier._id
        }, {
            $set: {
                'galaxy.carriers.$.waypoints': waypoints,
                'galaxy.carriers.$.waypointsLooped': looped,
            }
        })

        // Send back the eta ticks of the waypoints so that
        // the UI can be updated.
        let reportCarrier = carrier.toObject();

        this.populateCarrierWaypointEta(game, reportCarrier);

        return {
            ticksEta: reportCarrier.ticksEta,
            ticksEtaTotal: reportCarrier.ticksEtaTotal,
            waypoints: reportCarrier.waypoints
        };
    }

    async loopWaypoints(game, player, carrierId, loop) {
        let carrier = this.carrierService.getById(game, carrierId);
        
        if (!carrier.ownedByPlayerId.equals(player._id)) {
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
        await this.gameModel.updateOne({
            _id: game._id,
            'galaxy.carriers._id': carrier._id
        }, {
            $set: {
                'galaxy.carriers.$.waypointsLooped': loop,
            }
        })
    }

    canLoop(game, player, carrier) {
        if (carrier.waypoints.length < 2) {
            return false;
        }

        let effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(game, carrier);

        // Check whether the last waypoint is in range of the first waypoint.
        let firstWaypoint = carrier.waypoints[0];
        let lastWaypoint = carrier.waypoints[carrier.waypoints.length - 1];

        let firstWaypointStar = this.starService.getByObjectId(game, firstWaypoint.source);
        let lastWaypointStar = this.starService.getByObjectId(game, lastWaypoint.source);

        let distanceBetweenStars = this.starDistanceService.getDistanceBetweenStars(firstWaypointStar, lastWaypointStar);
        let hyperspaceDistance = this.distanceService.getHyperspaceDistance(game, effectiveTechs.hyperspace);

        return distanceBetweenStars <= hyperspaceDistance
    }

    calculateWaypointTicks(game, carrier, waypoint) {
        let carrierOwner = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));

        let sourceStar = this.starService.getByObjectId(game, waypoint.source);
        let destinationStar = this.starService.getByObjectId(game, waypoint.destination);

        // if the waypoint is going to the same star then it is at least 1
        // tick, plus any delay ticks.
        if (sourceStar._id.equals(destinationStar._id)) {
            return 1 + waypoint.delayTicks;
        }

        let source = sourceStar.location
        let destination = destinationStar.location

        // If the carrier is already en-route, then the number of ticks will be relative
        // to where the carrier is currently positioned.
        if (!carrier.orbiting && carrier.waypoints[0]._id.toString() === waypoint._id.toString()) {
            source = carrier.location;
        }

        let distance = this.distanceService.getDistanceBetweenLocations(source, destination);
        let warpSpeed = this.starService.canTravelAtWarpSpeed(carrierOwner, carrier, sourceStar, destinationStar);

        // Calculate how far the carrier will move per tick.
        let tickDistance = this.carrierService.getCarrierDistancePerTick(game, carrier, warpSpeed);

        let ticks = Math.ceil(distance / tickDistance);

        ticks += waypoint.delayTicks; // Add any delay ticks the waypoint has.

        return ticks;
    }

    calculateWaypointTicksEta(game, carrier, waypoint) {
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

    performWaypointAction(carrier, star, waypoint) {
        switch (waypoint.action) {
            case 'dropAll':
                this._performWaypointActionDropAll(carrier, star, waypoint);
                break;
            case 'drop':
                this._performWaypointActionDrop(carrier, star, waypoint);
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
            case 'collectAllBut':
                this._performWaypointActionCollectAllBut(carrier, star, waypoint);
                break;
            case 'garrison':
                this._performWaypointActionGarrison(carrier, star, waypoint);
                break;
        }
    }

    populateCarrierWaypointEta(game, carrier) {
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

    _performWaypointActionDropAll(carrier, star, waypoint) {
        star.garrisonActual += (carrier.ships - 1)
        star.garrison = Math.floor(star.garrisonActual);
        carrier.ships = 1;
    }

    _performWaypointActionCollectAll(carrier, star, waypoint) {
        carrier.ships += star.garrison;
        star.garrisonActual -= star.garrison;
        star.garrison = Math.floor(star.garrisonActual);
    }

    _performWaypointActionDrop(carrier, star, waypoint) {
        // If the carrier has more ships than needs to be dropped, then drop
        // however many are configured in the waypoint.
        if (carrier.ships - 1 >= waypoint.actionShips) {
            star.garrisonActual += waypoint.actionShips;
            star.garrison = Math.floor(star.garrisonActual);
            carrier.ships -= waypoint.actionShips;
        }
        else {
            // If there aren't enough ships, then do a drop all.
            this._performWaypointActionDropAll(carrier, star, waypoint);
        }
    }
    
    performWaypointActionsDrops(game, waypoints) {
        this._performFilteredWaypointActions(game, waypoints, ['dropAll', 'drop', 'dropAllBut']);
    }

    _performWaypointActionCollect(carrier, star, waypoint) {
        // If the star has more ships than needs to be collected, then collect
        // however many are configured in the waypoint.
        if (star.garrison >= waypoint.actionShips) {
            star.garrisonActual -= waypoint.actionShips;
            star.garrison = Math.floor(star.garrisonActual);
            carrier.ships += waypoint.actionShips;
        }
        else {
            // If there aren't enough ships, then do a collect all.
            this._performWaypointActionCollectAll(carrier, star, waypoint);
        }
    }

    performWaypointActionsCollects(game, waypoints) {
        this._performFilteredWaypointActions(game, waypoints, ['collectAll', 'collect', 'collectAllBut']);
    }

    _performWaypointActionDropAllBut(carrier, star, waypoint) {
        // Calculate the difference between how many ships we currently have
        // and how many need to remain after.
        let difference = carrier.ships - waypoint.actionShips;

        // If we have more than enough ships to transfer, then transfer
        // the desired amount. Otherwise do not drop anything.
        if (difference > 0 && difference <= carrier.ships - 1) {
            star.garrisonActual += difference;
            star.garrison = Math.floor(star.garrisonActual);
            carrier.ships -= difference;
        }
    }

    _performWaypointActionCollectAllBut(carrier, star, waypoint) {
        // Calculate the difference between how many ships we currently have
        // and how many need to remain after.
        let difference = star.garrison - waypoint.actionShips;

        // If we have more than enough ships to transfer, then transfer
        // the desired amount. Otherwise do not drop anything.
        if (difference > 0 && difference <= star.garrison) {
            star.garrisonActual -= difference;
            star.garrison = Math.floor(star.garrisonActual);
            carrier.ships += difference;
        }
    }

    _performWaypointActionGarrison(carrier, star, waypoint) {
        // Calculate how many ships need to be dropped or collected
        // in order to garrison the star.
        let difference = star.garrison - waypoint.actionShips;

        // If the difference is above 0 then move ships
        // from the star to the carrier, otherwise do the opposite.
        if (difference > 0) {
            let allowed = Math.abs(Math.min(difference, star.garrison));

            star.garrisonActual -= allowed;
            carrier.ships += allowed;
        } else {
            let allowed = Math.min(Math.abs(difference), carrier.ships - 1);

            star.garrisonActual += allowed;
            carrier.ships -= allowed;
        }

        star.garrison = Math.floor(star.garrisonActual);
    }

    performWaypointActionsGarrisons(game, waypoints) {
        this._performFilteredWaypointActions(game, waypoints, ['garrison']);
    }

    _performFilteredWaypointActions(game, waypoints, waypointTypes) {
        let actionWaypoints = waypoints.filter(w => waypointTypes.indexOf(w.waypoint.action) > -1);

        this._performWaypointActions(game, actionWaypoints);
    }

    _performWaypointActions(game, actionWaypoints) {
        for (let actionWaypoint of actionWaypoints) {
            this.performWaypointAction(actionWaypoint.carrier, actionWaypoint.star, actionWaypoint.waypoint);
        }
    }

    sanitiseDarkModeCarrierWaypoints(game, carrier) {
        // If in dark mode then we need to verify that waypoints are still valid.
        // For example, if a star is captured then it may no longer be in scanning range
        // so any waypoints to it should be removed unless already in transit.
        const isDarkMode = this.gameService.isDarkMode(game);

        if (!isDarkMode) {
            return;
        }

        let player = this.playerService.getById(game, carrier.ownedByPlayerId);
        let startIndex = this.carrierService.isInTransit(carrier) ? 1 : 0;

        for (let i = startIndex; i < carrier.waypoints.length; i++) {
            let waypoint = carrier.waypoints[i];
            let destination = this.starService.getById(game, waypoint.destination);

            // If the destination is not within scanning range of the player, remove it
            // and all subsequent waypoints.
            let inRange = this.starService.isStarInScanningRangeOfPlayer(game, destination, player);

            if (!inRange) {
                carrier.waypoints.splice(i);

                if (carrier.waypointsLooped) {
                    carrier.waypointsLooped = this.canLoop(game, player, carrier);
                }

                break;
            }
        }
    }

    rerouteToNearestFriendlyStarFromStar(game, carrier) {
        if (!carrier.orbiting) {
            throw new ValidationError(`Star must be in orbit for it to be rerouted from a star.`);
        }

        let effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(game, carrier);
        let hyperspaceDistance = this.distanceService.getHyperspaceDistance(game, effectiveTechs.hyperspace);

        // Find the nearest friendly star, if there is none then we cannot reroute.
        let nearestStar = this.starDistanceService.getClosestPlayerOwnedStarsFromLocationWithinDistance(
            carrier.location,
            game.galaxy.stars,
            carrier.ownedByPlayerId,
            hyperspaceDistance
        )[0];

        if (!nearestStar) {
            return null;
        }

        carrier.waypoints = [{
            source: carrier.orbiting,
            destination: nearestStar._id,
            action: 'nothing',
            actionShips: 0,
            delayTicks: 0
        }];

        carrier.waypointsLooped = false;
        carrier.inTransitFrom = carrier.orbiting;
        carrier.inTransitTo = nearestStar._id;
        carrier.orbiting = null;

        return nearestStar;
    }

};
