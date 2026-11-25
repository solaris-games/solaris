import type {
    Specialist,
    SpecialistModifiersSpecial,
} from "../types/common/specialist";
import type { Carrier } from "../types/common/carrier";
import type { Star } from "../types/common/star";

interface ISpecialistService {
    getByIdStar(id: number): Specialist | null;
    getByIdCarrier(id: number): Specialist | null;
}

export class SpecialistValueService {
    constructor(private specialistService: ISpecialistService) {}

    getAvoidCombatCarrierToCarrier<ID>(carrier: Carrier<ID>) {
        return this._getCarrierSpecialValue(
            carrier,
            "avoidCombatCarrierToCarrier",
            false,
        );
    }

    _getCarrierSpecialValue<ID, T>(
        carrier: Carrier<ID>,
        name: keyof SpecialistModifiersSpecial,
        defaultValue: T,
    ): T | null {
        if (!carrier.specialistId) {
            return defaultValue;
        }

        const specialist = this.specialistService.getByIdCarrier(
            carrier.specialistId,
        );

        if (specialist == null || !specialist.modifiers.special) {
            return defaultValue;
        }

        const val = specialist.modifiers.special[name] as T; // trust

        return val == null ? defaultValue : val;
    }

    _getStarSpecialValue<ID, T>(
        star: Star<ID>,
        name: keyof SpecialistModifiersSpecial,
        defaultValue: T,
    ): T {
        if (!star.specialistId) {
            return defaultValue;
        }

        const specialist = this.specialistService.getByIdStar(
            star.specialistId,
        );

        if (specialist == null || !specialist.modifiers.special) {
            return defaultValue;
        }

        const val = specialist.modifiers.special[name] as T; // trust

        return val == null ? defaultValue : val;
    }

    getStarCaptureRewardMultiplier<ID>(carrier: Carrier<ID>): number | null {
        return this._getCarrierSpecialValue(
            carrier,
            "starCaptureRewardMultiplier",
            1,
        );
    }

    hasAwardDoubleCaptureRewardSpecialist<ID>(carriers: Carrier<ID>[]) {
        return carriers
            .map((c) => this.getStarCaptureRewardMultiplier(c) || 0)
            .sort((a, b) => b - a)[0];
    }

    getEconomyInfrastructureMultiplier<ID>(star: Star<ID>) {
        return this._getStarSpecialValue(
            star,
            "economyInfrastructureMultiplier",
            1,
        );
    }

    getScienceInfrastructureMultiplier<ID>(star: Star<ID>) {
        return this._getStarSpecialValue(
            star,
            "scienceInfrastructureMultiplier",
            1,
        );
    }

    getCreditsPerTickByScience<ID>(star: Star<ID>) {
        return this._getStarSpecialValue(star, "creditsPerTickByScience", 0);
    }

    getReigniteDeadStar<ID>(carrier: Carrier<ID>) {
        return this._getCarrierSpecialValue(carrier, "reigniteDeadStar", false);
    }

    getReigniteDeadStarNaturalResources<ID>(carrier: Carrier<ID>) {
        return this._getCarrierSpecialValue(
            carrier,
            "reigniteDeadStarNaturalResources",
            {
                economy: 25,
                industry: 25,
                science: 25,
            },
        );
    }

    getStarHideShips<ID>(star: Star<ID>): boolean {
        return this._getStarSpecialValue(star, "hideShips", false);
    }

    getCarrierHideShips<ID>(carrier: Carrier<ID>): boolean | null {
        return this._getCarrierSpecialValue(carrier, "hideShips", false);
    }

    getStarMovement<ID>(star: Star<ID>) {
        return this._getStarSpecialValue(star, "moveStar", false);
    }

    getStarMovementPerTick<ID>(star: Star<ID>) {
        return this._getStarSpecialValue(star, "starMovementPerTick", 0.2);
    }

    getStarAttract<ID>(star: Star<ID>) {
        return this._getStarSpecialValue(star, "attractStar", false);
    }
}
