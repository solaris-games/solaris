import { Carrier } from "../types/Carrier";
import { Game } from "../types/Game";
import { Specialist, SpecialistType } from "../types/Specialist";
import { Star } from "../types/Star";

const specialists = require('../config/game/specialists.json');
const ValidationError = require("../errors/validation");

export default class SpecialistService {

    getById(id: number, type: SpecialistType) {
        return specialists[type].find(x => x.id === id);
    }

    getByIdCarrier(id: number | null) {
        if (!id) {
            return null;
        }

        return this.getById(id, 'carrier');
    }

    getByIdCarrierTrim(id: number | null) {
        let spec = this.getByIdCarrier(id);

        if (spec) {
            spec = {
                id: spec.id,
                key: spec.key,
                name: spec.name,
                description: spec.description
            };
        }

        return spec;
    }

    getByIdStar(id: number | null) {
        if (!id) {
            return null;
        }
        
        return this.getById(id, 'star');
    }

    getByIdStarTrim(id: number | null) {
        let spec = this.getByIdStar(id);

        if (spec) {
            spec = {
                id: spec.id,
                key: spec.key,
                name: spec.name,
                description: spec.description
            };
        }

        return spec;
    }

    list(game: Game | null, type: SpecialistType) {
        // Clone the existing list otherwise could run into issues with multiple requests
        // as the specs are being loaded from a file.
        let specialistsList = JSON.parse(JSON.stringify(specialists));

        if (game && game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }
        
        let specs = specialistsList[type];

        if (game) {
            for (let spec of specs) {
                spec.cost = this.getSpecialistActualCost(game, spec);
            }

            let currency = game.settings.specialGalaxy.specialistsCurrency;
    
            return specs.sort((a, b) => a.cost[currency] - b.cost[currency]);
        }

        return specs.sort((a, b) => a.name - b.name);
    }

    listCarrier(game: Game | null) {
        return this.list(game, 'carrier');
    }

    listStar(game: Game | null) {
        return this.list(game, 'star');
    }

    getSpecialistActualCost(game: Game, specialist: Specialist) {
        let result = {
            credits: 0,
            creditsSpecialists: 0
        };

        const expenseConfig = game.constants.star.specialistsExpenseMultipliers[game.settings.specialGalaxy.specialistCost];

        result.credits = specialist.baseCostCredits * expenseConfig;
        result.creditsSpecialists = specialist.baseCostCreditsSpecialists * expenseConfig;

        return result;
    }

    _getCarrierSpecialValue(carrier: Carrier, name: string, defaultValue: any) {
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

    _getStarSpecialValue(star: Star, name: string, defaultValue: any) {
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

    getStarCaptureRewardMultiplier(carrier: Carrier) {
        return this._getCarrierSpecialValue(carrier, 'starCaptureRewardMultiplier', 1);
    }

    hasAwardDoubleCaptureRewardSpecialist(carriers: Carrier[]) {
        return carriers
            .map(c => this.getStarCaptureRewardMultiplier(c))
            .sort((a, b) => b - a)[0];
    }

    getEconomyInfrastructureMultiplier(star: Star) {
        return this._getStarSpecialValue(star, 'economyInfrastructureMultiplier', 1);
    }

    getScienceInfrastructureMultiplier(star: Star) {
        return this._getStarSpecialValue(star, 'scienceInfrastructureMultiplier', 1);
    }

    getCreditsPerTickByScience(star: Star) {
        return this._getStarSpecialValue(star, 'creditsPerTickByScience', 0);
    }

    getReigniteDeadStar(carrier: Carrier) {
        return this._getCarrierSpecialValue(carrier, 'reigniteDeadStar', false);
    }

    getReigniteDeadStarNaturalResources(carrier: Carrier) {
        return this._getCarrierSpecialValue(carrier, 'reigniteDeadStarNaturalResources', 1);
    }

    getStarHideShips(star: Star) {
        return this._getStarSpecialValue(star, 'hideShips', false);
    }

    getCarrierHideShips(carrier: Carrier) {
        return this._getCarrierSpecialValue(carrier, 'hideShips', false);
    }
    
};
