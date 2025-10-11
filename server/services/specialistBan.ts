import { Game } from "./types/Game";
import { Specialist } from 'solaris-common';
import SpecialistService from "./specialist";
const RNG = require('random-seed');
const moment = require('moment');

export default class SpecialistBanService {
    specialistService: SpecialistService;

    constructor(
        specialistService: SpecialistService
    ) {
        this.specialistService = specialistService;
    }

    isStarSpecialistBanned(game: Game, specialistId: number) {
        return game.settings.specialGalaxy.specialistBans.star.indexOf(specialistId) > -1;
    }

    isCarrierSpecialistBanned(game: Game, specialistId: number) {
        return game.settings.specialGalaxy.specialistBans.carrier.indexOf(specialistId) > -1;
    }

    _getCurrentMonthBans(specialistIds: number[], amount: number) {
        if (amount <= 0) {
            throw new Error(`Amount cannot be less than or equal to 0.`);
        }

        if (amount >= specialistIds.length) {
            return specialistIds;
        }

        const now = moment().utc();
        const seed = now.format('YYYYMM');
        const rng = RNG.create(seed);

        const bans: number[] = [];

        while (bans.length < amount) {
            const i = rng(specialistIds.length);
            const id = specialistIds[i];

            bans.push(id);
            specialistIds.splice(i, 1);
        }

        return bans;
    }

    getCurrentMonthStarBans(amount: number): Specialist[] {
        const specs = this.specialistService.listStar(null).filter(s => s.active.official);
        const ids = specs.map((s: Specialist) => s.id);
        const bans = this._getCurrentMonthBans(ids, amount);

        return specs.filter((s: Specialist) => bans.includes(s.id));
    }

    getCurrentMonthCarrierBans(amount: number): Specialist[] {
        const specs = this.specialistService.listCarrier(null).filter(s => s.active.official);
        const ids = specs.map((s: Specialist) => s.id);
        const bans = this._getCurrentMonthBans(ids, amount);

        return specs.filter((s: Specialist) => bans.includes(s.id));
    }

    getCurrentMonthBans(amount: number) {
        const carrierBans = this.getCurrentMonthCarrierBans(amount);
        const starBans = this.getCurrentMonthStarBans(amount);

        return{
            carrier: carrierBans,
            star: starBans
        };
    }

};
