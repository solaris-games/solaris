const mongoose = require('mongoose');
const ValidationError = require('../errors/validation');

module.exports = class CarrierService {

    getById(game, id) {
        return game.galaxy.carriers.find(s => s._id.toString() === id);
    }

    createAtStar(star, carriers, ships = 1) {
        if (!Math.floor(star.garrisonActual)) {
            throw new ValidationError('Star must have a garrison to build a carrier.');
        }

        // Generate a name for the new carrier based on the star name but make sure
        // this name isn't already taken by another carrier.
        let name = this.generateCarrierName(star, carriers);

        let carrier = {
            _id: mongoose.Types.ObjectId(),
            ownedByPlayerId: star.ownedByPlayerId,
            ships: ships,
            orbiting: star._id,
            location: star.location,
            name,
            waypoints: []
        };

        // Reduce the star garrison by how many we have added to the carrier.
        star.garrisonActual -= ships;
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
