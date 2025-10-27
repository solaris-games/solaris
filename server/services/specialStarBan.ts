import { SpecialStar } from "solaris-common";

const RNG = require('random-seed');
import moment from "moment";

const specialStars = require('../config/game/specialStars.json') as SpecialStar[];

export default class SpecialStarBanService {

    BAN_AMOUNT: number = 2;

    _getCurrentMonthBans(stars: SpecialStar[], amount: number): SpecialStar[] {
        if (amount <= 0) {
            throw new Error(`Amount cannot be less than or equal to 0.`);
        }

        if (amount >= stars.length) {
            return stars;
        }

        const now = moment().utc();
        const seed = now.format('YYYYMM');
        const rng = RNG.create(seed);

        const bans: SpecialStar[] = [];

        while (bans.length < amount) {
            const i = rng(stars.length);
            const id = stars[i];

            bans.push(id);
            stars.splice(i, 1);
        }

        return bans;
    }

    getCurrentMonthBans() {
        const stars = specialStars.slice();
        const bans = this._getCurrentMonthBans(stars, this.BAN_AMOUNT);

        return {
            specialStar: bans
        };
    }

};
