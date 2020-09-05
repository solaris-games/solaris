const specialists = require('../config/game/specialists.json');
const ValidationError = require("../errors/validation");

const TYPES = {
    CARRIER: "carrier",
    STAR: "star"
};

module.exports = class SpecialistService {

    constructor(carrierService) {
        this.carrierService = carrierService;
    }

    getById(id, type) {
        return specialists[type].find(x => x.id === id);
    }

    list(game, type) {
        // TODO: Need to return a list with actual costs based on game cost modifier settings.
        // TODO: Also need to check whether the game has specialists enabled.
        return specialists[type];
    }

    async upgradeCarrier(game, player, carrierId, specialistId) {
        // TODO: Check if the game has specialists enabled.

        let carrier = this.carrierService.getById(game, carrierId);

        if (this.carrier.specialist) {
            throw new ValidationError(`Cannot assign another a specialist to this carrier, it already has one assigned.`);
        }

        if (!carrier.orbiting) {
            throw new ValidationError(`Cannot assign a specialist to a carrier in transit.`);
        }

        const specialist = this.getById(specialistId, TYPES.CARRIER);

        if (!specialist) {
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist.`);
        }
        
        let cost = specialist.baseCost; // TODO: Need a modifier here from the game settings.

        if (player.credits > specialist.baseCost) {
            throw new ValidationError(`You cannot afford to buy this specialist.`);
        }

        carrier.specialist = specialist.id;
        player.credits -= cost;

        await game.save();

        // TODO: The carrier may have its waypoint ETAs changed based on the specialist so need to 
        // return the new data.
        // TODO: Need to consider local and global effects and update the UI accordingly.
    }
    
};
