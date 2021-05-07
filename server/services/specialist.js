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

        let currency = game.settings.specialGalaxy.specialistsCurrency;

        return specs.sort((a, b) => a.cost[currency] - b.cost[currency]);
    }

    listCarrier(game) {
        return this.list(game, TYPES.CARRIER);
    }

    listStar(game) {
        return this.list(game, TYPES.STAR);
    }

    getSpecialistActualCost(game, specialist) {
        let result = {
            credits: 0,
            creditsSpecialists: 0
        };

        const expenseConfig = game.constants.star.specialistsExpenseMultipliers[game.settings.specialGalaxy.specialistCost];

        result.credits = specialist.baseCostCredits * expenseConfig;
        result.creditsSpecialists = specialist.baseCostCreditsSpecialists * expenseConfig;

        return result;
    }

    _getCarrierSpecialValue(carrier, name, defaultValue) {
        if (!carrier.specialistId) {
            return defaultValue;
        }

        let specialist = this.getByIdCarrier(carrier.specialistId);

        if (!specialist.modifiers.special) {
            return defaultValue;
        }

        let val = specialist.modifiers.special[name];

        return val == null ? defaultValue : val;
    }

    _getStarSpecialValue(star, name, defaultValue) {
        if (!star.specialistId) {
            return defaultValue;
        }

        let specialist = this.getByIdStar(star.specialistId);

        if (!specialist.modifiers.special) {
            return defaultValue;
        }

        let val = specialist.modifiers.special[name];

        return val == null ? defaultValue : val;
    }

    getStarCaptureRewardMultiplier(carrier) {
        return this._getCarrierSpecialValue(carrier, 'starCaptureRewardMultiplier', 1);
    }

    hasAwardDoubleCaptureRewardSpecialist(carriers) {
        return carriers
            .map(c => this.getStarCaptureRewardMultiplier(c))
            .sort((a, b) => b - a)[0];
    }

    getEconomyInfrastructureMultiplier(star) {
        return this._getStarSpecialValue(star, 'economyInfrastructureMultiplier', 1);
    }

    getScienceInfrastructureMultiplier(star) {
        return this._getStarSpecialValue(star, 'scienceInfrastructureMultiplier', 1);
    }

    getStarCombatAttackingRedirectIfDefeated(carrier) {
        return this._getCarrierSpecialValue(carrier, 'starCombatAttackingRedirectIfDefeated', false);
    }
    
};
