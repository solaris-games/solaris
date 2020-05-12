const ValidationError = require('../errors/validation');

module.exports = class WaypointService {

    constructor(carrierService, starService, distanceService, starDistanceService) {
        this.carrierService = carrierService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
    }

    async saveWaypoints(game, player, carrierId, waypoints) {
        let carrier = this.carrierService.getById(game, carrierId);
        
        if (!carrier.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError('The player does not own this carrier.');
        }

        let hyperspaceDistance = this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);

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
        }

        // Validate new waypoints.
        for (let i = 0; i < waypoints.length; i++) {
            let waypoint = waypoints[i];

            let sourceStar = this.starService.getByObjectId(game, waypoint.source);
            let destinationStar = this.starService.getByObjectId(game, waypoint.destination);

            let distanceBetweenStars = this.starDistanceService.getDistanceBetweenStars(sourceStar, destinationStar);

            if (distanceBetweenStars > hyperspaceDistance) {
                throw new ValidationError(`The waypoint ${sourceStar.name} --> ${destinationStar.name} exceeds hyperspace range.`);
            }
        }
        
        carrier.waypoints = waypoints;
        carrier.waypointsLooped = false;

        return await game.save();
    }

    async loopWaypoints(game, player, carrierId, loop) {
        let carrier = this.carrierService.getById(game, carrierId);
        
        if (!carrier.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError('The player does not own this carrier.');
        }

        if (loop) {
            if (carrier.waypoints.length < 1) {
                throw new ValidationError('The carrier must have 2 or more waypoints to loop');
            }

            // Check whether the last waypoint is in range of the first waypoint.
            let firstWaypoint = carrier.waypoints[0];
            let lastWaypoint = carrier.waypoints[carrier.waypoints.length - 1];

            let firstWaypointStar = this.starService.getByObjectId(game, firstWaypoint.source);
            let lastWaypointStar = this.starService.getByObjectId(game, lastWaypoint.destination);

            let distanceBetweenStars = this.starDistanceService.getDistanceBetweenStars(firstWaypointStar, lastWaypointStar);
            let hyperspaceDistance = this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);

            if (distanceBetweenStars > hyperspaceDistance) {
                throw new ValidationError('The last waypoint star is out of hyperspace range of the first waypoint star.');
            }
        }
        
        carrier.waypointsLooped = loop;

        await game.save();
    }

    calculateWaypointTicks(game, carrier, waypoint) {
        let source = this.starService.getByObjectId(game, waypoint.source).location;
        let destination = this.starService.getByObjectId(game, waypoint.destination).location;

        // If the carrier is already en-route, then the number of ticks will be relative
        // to where the carrier is currently positioned.
        if (!carrier.orbiting && carrier.waypoints[0]._id.equals(waypoint._id)) {
            source = carrier.location;
        }

        let distance = this.distanceService.getDistanceBetweenLocations(source, destination);

        let tickDistance = game.constants.distances.shipSpeed;

        // If the carrier is moving between warp gates then
        // the tick distance is x3
        if (source.warpGate && destination.warpGate
            && source.ownedByPlayerId && destination.ownedByPlayerId) {
                tickDistance *= 3;
            }

        let ticks = Math.ceil(distance / tickDistance);

        return ticks;
    }

    calculateWaypointTicksEta(game, carrier, waypoint) {
        let totalTicks = 0;

        for (let i = 0; i < carrier.waypoints.length; i++) {
            let cwaypoint = carrier.waypoints[i];
            
            totalTicks += this.calculateWaypointTicks(game, carrier, waypoint);

            if (cwaypoint._id.equals(waypoint._id)) {
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

    _performWaypointActionDropAll(carrier, star, waypoint) {
        star.garrison += (carrier.ships - 1)
        carrier.ships = 1;
    }

    _performWaypointActionCollectAll(carrier, star, waypoint) {
        carrier.ships += star.ships || 0;
        star.garrison = 0
    }

    _performWaypointActionDrop(carrier, star, waypoint) {
        // If the carrier has more ships than needs to be dropped, then drop
        // however many are configured in the waypoint.
        if (carrier.ships - 1 >= waypoint.actionShips) {
            star.garrison += waypoint.actionShips;
            carrier.ships -= waypoint.actionShips;
        }
        else {
            // If there aren't enough ships, then do a drop all.
            this._performWaypointActionDropAll(carrier, star, waypoint);
        }
    }

    _performWaypointActionCollect(carrier, star, waypoint) {
        // If the star has more ships than needs to be collected, then collect
        // however many are configured in the waypoint.
        if (star.garrison >= waypoint.actionShips) {
            star.garrison += waypoint.actionShips;
            carrier.ships -= waypoint.actionShips;
        }
        else {
            // If there aren't enough ships, then do a collect all.
            this._performWaypointActionCollectAll(carrier, star, waypoint);
        }
    }

    _performWaypointActionDropAllBut(carrier, star, waypoint) {
        // Calculate the difference between how many ships we currently have
        // and how many need to remain after.
        let difference = carrier.ships - waypoint.actionShips;

        // If we have more than enough ships to transfer, then transfer
        // the desired amount. Otherwise do not drop anything.
        if (difference >= carrier.ships - 1) {
            star.garrison += difference;
            carrier.ships -= difference;
        }
    }

    _performWaypointActionCollectAllBut(carrier, star, waypoint) {
        // Calculate the difference between how many ships we currently have
        // and how many need to remain after.
        let difference = star.garrison - waypoint.actionShips;

        // If we have more than enough ships to transfer, then transfer
        // the desired amount. Otherwise do not drop anything.
        if (difference >= star.garrison) {
            star.garrison -= difference;
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

            star.garrison -= allowed;
            carrier.ships += allowed;
        } else {
            let allowed = Math.abs(Math.min(difference, carrier.ships - 1));

            star.garrison += allowed;
            carrier.ships -= allowed;
        }
    }

};
