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

        // TODO: Validate new waypoints.
        
        carrier.waypoints = waypoints;

        return await game.save();
    }

    loopWaypoints(game, userId, carrierId, loop) {
        let userPlayer = this.playerService.getByUserId(game, userId);
        let carrier = this.carrierService.getById(game, carrierId);
        
        if (!carrier.ownedByPlayerId.equals(userPlayer._id)) {
            throw new ValidationError('The player does not own this carrier.');
        }

        if (loop) {
            if (!carrier.waypoints.length < 1) {
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

        return await game.save();
    }

    calculateWaypointTicks(game, waypoint) {
        let sourceStar = this.starService.getByObjectId(game, waypoint.source);
        let destinationStar = this.starService.getByObjectId(game, waypoint.destination);

        let distance = this.starDistanceService.getDistanceBetweenStars(sourceStar, destinationStar);

        let ticks = Math.ceil(distance / this.distanceService.getCarrierTickDistance());

        return ticks;
    }

};
