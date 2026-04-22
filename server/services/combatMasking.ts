import {CombatResult} from "@solaris/common";
import {DBObjectId} from "./types/DBObjectId";
import SpecialistService from "./specialist";

export class CombatMaskingService {
    specialistService: SpecialistService;

    constructor(specialistService: SpecialistService) {
        this.specialistService = specialistService;
    }

    maskCombatResult(combatResult: CombatResult<DBObjectId>, playerId: DBObjectId): CombatResult<DBObjectId> {
        const result: CombatResult<DBObjectId> = Object.assign({}, combatResult);

        const groups = result.groups.map((g) => {
            const group = Object.assign({}, g);

            let scrambled = false;

            if (g.star) {
                const isPlayerObj = g.star.ownedByPlayerId.toString() === playerId.toString();

                if (!isPlayerObj && g.star.hasScrambler) {
                    g.star.shipsLost = '???';
                    g.star.shipsBefore = '???';
                    scrambled = true;

                    if (typeof g.star.shipsAfter === 'number' && g.star.shipsAfter > 0) {
                        g.star.shipsAfter = '???';
                    }
                }
            }

            for (let carrier of group.carriers) {
                const isPlayerObj = carrier.ownedByPlayerId.toString() === playerId.toString();

                if (!isPlayerObj && carrier.hasScrambler) {
                    carrier.shipsLost = '???';
                    carrier.shipsBefore = '???';
                    scrambled = true;

                    if (typeof carrier.shipsAfter === 'number' && carrier.shipsAfter > 0) {
                        carrier.shipsAfter = '???';
                    }
                }
            }

            if (scrambled) {
                g.shipsLost = '???';
                g.shipsBefore = '???';
                g.shipsAfter = '???';
            }

            return group;
        });

        return {
            groups,
        };
    }
}