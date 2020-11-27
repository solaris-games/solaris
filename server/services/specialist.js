const specialists = require('../config/game/specialists.json');
const ValidationError = require("../errors/validation");

const TYPES = {
    CARRIER: "carrier",
    STAR: "star"
};

const TIER_BASE_COSTS = {
    "1": 25,
    "2": 50,
    "3": 100,
    "4": 250,
    "5": 500
}

module.exports = class SpecialistService {

    constructor(userService) {
        this.userService = userService;
    }

    getById(id, type) {
        return specialists[type].find(x => x.id === id);
    }

    getByIdCarrier(id) {
        if (!id) {
            return null;
        }

        return this.getById(id, TYPES.CARRIER);
    }

    getByIdCarrierTrim(id) {
        let spec = this.getByIdCarrier(id);

        if (spec) {
            spec = {
                id: spec.id,
                name: spec.name,
                description: spec.description
            };
        }

        return spec;
    }

    getByIdStar(id) {
        if (!id) {
            return null;
        }
        
        return this.getById(id, TYPES.STAR);
    }

    getByIdStarTrim(id) {
        let spec = this.getByIdStar(id);

        if (spec) {
            spec = {
                id: spec.id,
                name: spec.name,
                description: spec.description
            };
        }

        return spec;
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

        return specs.sort((a, b) => a.cost - b.cost);
    }

    listCarrier(game) {
        return this.list(game, TYPES.CARRIER);
    }

    listStar(game) {
        return this.list(game, TYPES.STAR);
    }

    getSpecialistActualCost(game, specialist) {
        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.specialistCost];

        let cost = TIER_BASE_COSTS[specialist.tier.toString()] * expenseConfig;

        return cost;
    }

    async hireCarrierSpecialist(game, player, carrierId, specialistId) {
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }

        let carrier = game.galaxy.carriers.find(x => x.ownedByPlayerId && x.ownedByPlayerId.equals(player._id) && x._id.toString() === carrierId);

        if (!carrier) {
            throw new ValidationError(`Cannot assign a specialist to a carrier that you do not own.`);
        }

        if (!carrier.orbiting) {
            throw new ValidationError(`Cannot assign a specialist to a carrier in transit.`);
        }

        const specialist = this.getById(specialistId, TYPES.CARRIER);

        if (!specialist) {
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist.`);
        }

        if (carrier.specialistId && carrier.specialistId === specialist.id) {
            throw new ValidationError(`The carrier already has the specialist assigned.`);
        }
        
        // Calculate how much the spec will cost.
        let cost = this.getSpecialistActualCost(game, specialist);

        if (player.credits < cost) {
            throw new ValidationError(`You cannot afford to buy this specialist.`);
        }

        carrier.specialistId = specialist.id;
        player.credits -= cost;

        await game.save();

        await this.userService.incrementSpecialistsHired(player.userId);

        // TODO: The carrier may have its waypoint ETAs changed based on the specialist so need to 
        // return the new data.
        // TODO: Need to consider local and global effects and update the UI accordingly.
    }

    async hireStarSpecialist(game, player, starId, specialistId) {
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }

        let star = game.galaxy.stars.find(x => x.ownedByPlayerId && x.ownedByPlayerId.equals(player._id) && x._id.toString() === starId);

        if (!star) {
            throw new ValidationError(`Cannot assign a specialist to a star that you do not own.`);
        }

        const specialist = this.getById(specialistId, TYPES.STAR);

        if (!specialist) {
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist.`);
        }

        if (star.specialistId && star.specialistId === specialist.id) {
            throw new ValidationError(`The star already has the specialist assigned.`);
        }
        
        // Calculate how much the spec will cost.
        let cost = this.getSpecialistActualCost(game, specialist);

        if (player.credits < cost) {
            throw new ValidationError(`You cannot afford to buy this specialist.`);
        }

        star.specialistId = specialist.id;
        player.credits -= cost;

        await game.save();

        await this.userService.incrementSpecialistsHired(player.userId);

        // TODO: The star may have its manufacturing changed so return back the new manufacturing.
        // TODO: Need to consider local and global effects and update the UI accordingly.
    }
    
};
