import {CombatCarrier, CombatResult, CombatStar} from "./types/Combat";
import {Player} from "./types/Player";

export class CombatMaskingService {
    maskCombatResult(combatResult: CombatResult, player: Player) {
        let result: CombatResult = Object.assign({}, combatResult);

        if (result.star) {
            result.star = this._tryMaskObjectShips(combatResult.star, player) as CombatStar;
        }

        result.carriers = combatResult.carriers.map(c => this._tryMaskObjectShips(c, player)) as CombatCarrier[];

        return result;
    }

    _tryMaskObjectShips(carrierOrStar: CombatStar | CombatCarrier | null, player: Player) {
        if (!carrierOrStar) {
            return carrierOrStar;
        }

        // If the player doesn't own the object and the object is a scrambler then we need
        // to mask the before and lost amounts.
        if (carrierOrStar.scrambled && carrierOrStar.ownedByPlayerId && player._id.toString() !== carrierOrStar.ownedByPlayerId.toString()) {
            let clone: CombatStar | CombatCarrier = Object.assign({}, carrierOrStar);

            clone.before = '???';
            clone.lost = '???';

            // If the object lost ships and is now dead, then we need to mask the after value too.
            // Note: Stars can have a 0 ship garrison and be a scrambler so we want to ensure that the 0 ships is still scrambled.
            // cast is safe here because it can't be a string at this stage
            if (carrierOrStar.before === 0 || (carrierOrStar.after as number) > 0) {
                clone.after = '???';
            }

            return clone;
        }

        return carrierOrStar;
    }
}