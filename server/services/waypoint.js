const ValidationError = require('../errors/validation');

module.exports = class WaypointService {

    constructor(carrierService, playerService, starService, distanceService, starDistanceService) {
        this.carrierService = carrierService;
        this.playerService = playerService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
    }

    async saveWaypoints(game, userId, carrierId, waypoints) {
        let userPlayer = this.playerService.getByUserId(game, userId);
        let carrier = this.carrierService.getById(game, carrierId);
        
        if (!carrier.ownedByPlayerId.equals(userPlayer._id)) {
            throw new ValidationError('The player does not own this carrier.');
        }

        let hyperspaceDistance = this.distanceService.getHyperspaceDistance(userPlayer.research.hyperspace.level);

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

    async loopWaypoints(game, userId, carrierId, loop) {
        let userPlayer = this.playerService.getByUserId(game, userId);
        let carrier = this.carrierService.getById(game, carrierId);
        
        if (!carrier.ownedByPlayerId.equals(userPlayer._id)) {
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
            let hyperspaceDistance = this.distanceService.getHyperspaceDistance(userPlayer.research.hyperspace.level);

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

        let tickDistance = this.distanceService.getCarrierTickDistance();

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

};
