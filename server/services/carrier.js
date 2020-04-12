const ValidationError = require('../errors/validation');

module.exports = class CarrierService {

    createAtStar(star, carriers, ships = 1) {
        if (!star.garrison) {
            throw new ValidationError('Star must have a garrison to build a carrier.');
        }

        // Generate a name for the new carrier based on the star name but make sure
        // this name isn't already taken by another carrier.
        let name = this.generateCarrierName(star, carriers);

        let carrier = {
            ownedByPlayerId: star.ownedByPlayerId,
            ships: ships,
            orbiting: star._id,
            location: star.location,
            name
        };

        // Reduce the star garrison by how many we have added to the carrier.
        star.garrison -= ships;

        return carrier;
    }

    listCarriersOwnedByPlayer(carriers, playerId) {
        return carriers.filter(s => s.ownedByPlayerId && s.ownedByPlayerId.equals(playerId));
    }

    generateCarrierName(star, carriers) {
        let i = 1;
        let name = `${star.name} ${i++}`;
        
        while (carriers.find(c => c.name == name)) {
            name = `${star.name} ${i++}`;
        }

        return name;
    }
};
