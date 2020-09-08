const specialists = require('../config/game/specialists.json');
const ValidationError = require("../errors/validation");

const TYPES = {
    CARRIER: "carrier",
    STAR: "star"
};

module.exports = class SpecialistService {

    getById(id, type) {
        return specialists[type].find(x => x.id === id);
    }

    getByIdCarrier(id) {
        return this.getById(id, TYPES.CARRIER);
    }

    getByIdStar(id) {
        return this.getById(id, TYPES.STAR);
    }

    list(game, type) {
        // Clone the existing list otherwise could run into issues with multiple requests
        // as the specs are being loaded from a file.
        let specialistsList = JSON.parse(JSON.stringify(specialists));

        if (game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }
        
        let specs = specialistsList[type];

        for (let spec of specs) {
            spec.cost = this.getSpecialistActualCost(game, spec);
        }

        return specs;
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

    async hireCarrierSpecialist(game, player, carrierId, specialistId) {
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }

        let carrier = game.galaxy.carriers.find(x => x.ownedByPlayerId && x.ownedByPlayerId.toString() === carrierId);

        if (!carrier.orbiting) {
            throw new ValidationError(`Cannot assign a specialist to a carrier in transit.`);
        }

        const specialist = this.getById(specialistId, TYPES.CARRIER);

        if (!specialist) {
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist.`);
        }

        if (carrier.specialist && carrier.specialist === specialist.id) {
            throw new ValidationError(`The carrier already has the specialist assigned.`);
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
