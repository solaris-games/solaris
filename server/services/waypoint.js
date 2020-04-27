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

    calculateWaypointTicks(game, waypoint) {
        let sourceStar = this.starService.getByObjectId(game, waypoint.source);
        let destinationStar = this.starService.getByObjectId(game, waypoint.destination);

        let distance = this.starDistanceService.getDistanceBetweenStars(sourceStar, destinationStar);

        let ticks = Math.ceil(distance / this.distanceService.getCarrierTickDistance());

        return ticks;
    }

};
