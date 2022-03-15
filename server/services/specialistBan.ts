import { Game } from "../types/Game";
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

    getCurrentMonthStarBans(amount: number) {
        const ids = this.specialistService.listStar(null).map(s => s.id);

        return this._getCurrentMonthBans(ids, amount);
    }

    getCurrentMonthCarrierBans(amount: number) {
        const ids = this.specialistService.listCarrier(null).map(s => s.id);

        return this._getCurrentMonthBans(ids, amount);
    }

};
