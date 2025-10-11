import { Carrier } from "./types/Carrier";
import { Game } from "./types/Game";
import { Specialist, SpecialistType, ValidationError, GameTypeService } from "solaris-common";
import { Star } from "./types/Star";

const specialists = require('../config/game/specialists.json') as Specialist[];

export default class SpecialistService {
    gameTypeService: GameTypeService

    constructor(gameTypeService: GameTypeService) {
        this.gameTypeService = gameTypeService;
    }

    getById(id: number, type: SpecialistType): Specialist {
        return specialists[type].find((x) => x.id === id);
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
            } as Specialist;
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
            } as Specialist;
        }

        return spec;
    }

    list(game: Game | null, type: SpecialistType): Specialist[] {
        if (game && game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }

        // Clone the existing list otherwise could run into issues with multiple requests
        // as the specs are being loaded from a file.
        let specialistsList = JSON.parse(JSON.stringify(specialists)) as Specialist[];

        let specs = specialistsList[type]
            .filter(s => s.active.official || s.active.custom);

        // If in the context of a game, filter out specialists that aren't active.
        if (game) {
            const isOfficialGame = this.gameTypeService.isOfficialGame(game)
            const isCustomGame = this.gameTypeService.isCustomGame(game)

            specs = specs.filter(s => (s.active.official && isOfficialGame) || (s.active.custom && isCustomGame))
        }

        if (game) {
            for (let spec of specs) {
                spec.cost = this.getSpecialistActualCost(game, spec);
            }

            let currency = game.settings.specialGalaxy.specialistsCurrency;
    
            return specs.sort((a, b) => a.cost[currency] - b.cost[currency]);
        }

        return specs.sort((a, b) => a.name - b.name);
    }

    listCarrier(game: Game | null): Specialist[] {
        return this.list(game, 'carrier');
    }

    listStar(game: Game | null): Specialist[] {
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

    _getCarrierSpecialValue(carrier: Carrier, name: string, defaultValue) {
        if (!carrier.specialistId) {
            return defaultValue;
        }

        let specialist = this.getByIdCarrier(carrier.specialistId);

        if (specialist == null || !specialist.modifiers.special) {
            return defaultValue;
        }

        let val = specialist.modifiers.special[name];

        return val == null ? defaultValue : val;
    }

    _getStarSpecialValue(star: Star, name: string, defaultValue) {
        if (!star.specialistId) {
            return defaultValue;
        }

        let specialist = this.getByIdStar(star.specialistId);

        if (specialist == null || !specialist.modifiers.special) {
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
        return this._getCarrierSpecialValue(carrier, 'reigniteDeadStarNaturalResources', {
            economy: 25,
            industry: 25,
            science: 25
        });
    }

    getStarHideShips(star: Star) {
        return this._getStarSpecialValue(star, 'hideShips', false);
    }

    getCarrierHideShips(carrier: Carrier) {
        return this._getCarrierSpecialValue(carrier, 'hideShips', false);
    }

    getStarMovement(star: Star) {
        return this._getStarSpecialValue(star, 'moveStar', false);
    }

    getStarMovementPerTick(star: Star) {
        return this._getStarSpecialValue(star, 'starMovementPerTick', 0.2);
    }

    getStarAttract(star: Star) {
        return this._getStarSpecialValue(star, 'attractStar', false);
    }

    clearExpiredSpecialists(game: Game) {
        const stars = game.galaxy.stars.filter(s => s.specialistId && s.specialistExpireTick != null && s.specialistExpireTick <= game.state.tick);

        for (const star of stars) {
            star.specialistId = null;
            star.specialistExpireTick = null;
        }

        const carriers = game.galaxy.carriers.filter(c => c.specialistId && c.specialistExpireTick != null && c.specialistExpireTick <= game.state.tick);

        for (const carrier of carriers) {
            carrier.specialistId = null;
            carrier.specialistExpireTick = null;
        }
    }

};
