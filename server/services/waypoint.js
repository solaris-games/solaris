const ValidationError = require('../errors/validation');

module.exports = class WaypointService {

    constructor() {

    }

    async saveWaypoints(game, carrierId, waypoints) {
        // TODO: Validate new waypoints.
        // TODO: Validate carrier owning player.
        let carrier = game.galaxy.carriers.find(c => c.id === carrierId);

        carrier.waypoints = waypoints;

        return await game.save();
    }
};
