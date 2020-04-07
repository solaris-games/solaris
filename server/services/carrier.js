const ValidationError = require('../errors/validation');

module.exports = class CarrierService {

    createAtStar(star, ships = 1) {
        if (!star.garrison) {
            throw new ValidationError('Star must have a garrison to build a carrier.');
        }

        let carrier = {
            ownedByPlayerId: star.ownedByPlayerId,
            ships: ships,
            orbiting: star._id,
            location: star.location,
            name: star.name + ' 1' // TODO: Need to check if this name already exists.
        };

        // Reduce the star garrison by how many we have added to the carrier.
        star.garrison -= ships;

        return carrier;
    }

    listCarriersOwnedByPlayer(carriers, playerId) {
        return carriers.filter(s => s.ownedByPlayerId && s.ownedByPlayerId.equals(playerId));
    }

};
