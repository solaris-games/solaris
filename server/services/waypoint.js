const ValidationError = require('../errors/validation');

module.exports = class WaypointService {

    constructor(carrierService, playerService) {
        this.carrierService = carrierService;
        this.playerService = playerService;
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
};
