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

    listCarrier(game) {
        return this.list(game, TYPES.CARRIER);
    }

    listStar(game) {
        return this.list(game, TYPES.STAR);
    }

    getSpecialistActualCost(game, specialist) {
        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.specialistCost];

        let cost = specialist.baseCost * expenseConfig;

        return cost;
    }

    async upgradeCarrier(game, player, carrierId, specialistId) {
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }

        let carrier = this.carrierService.getById(game, carrierId);

        if (!carrier.orbiting) {
            throw new ValidationError(`Cannot assign a specialist to a carrier in transit.`);
        }

        const specialist = this.getById(specialistId, TYPES.CARRIER);

        if (!specialist) {
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist.`);
        }
        
        // Calculate how much the spec will cost.
        let cost = this.getSpecialistActualCost(game, specialist);

        if (player.credits < cost) {
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
