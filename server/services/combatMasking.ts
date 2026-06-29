import { CombatResult, CombatResultGroup } from "@solaris/common";
import { DBObjectId } from "./types/DBObjectId";
import SpecialistService from "./specialist";

export class CombatMaskingService {
    specialistService: SpecialistService;

    constructor(specialistService: SpecialistService) {
        this.specialistService = specialistService;
    }

    maskCombatResult(
        combatResult: CombatResult<DBObjectId>,
        playerId: DBObjectId,
    ): CombatResult<DBObjectId> {
        const groups: CombatResultGroup<DBObjectId>[] = combatResult.groups.map(
            (g) => {
                const group = {
                    ...g,
                    star: g.star && { ...g.star },
                    carriers: g.carriers.map((c) => ({ ...c })),
                };

                let scrambled = false;

                if (group.star) {
                    const isPlayerObj =
                        group.star.ownedByPlayerId!.toString() ===
                        playerId.toString();

                    if (!isPlayerObj && group.star.hasScrambler) {
                        group.star.shipsLost = "???";
                        group.star.shipsBefore = "???";
                        scrambled = true;

                        if (
                            typeof group.star.shipsAfter === "number" &&
                            group.star.shipsAfter > 0
                        ) {
                            group.star.shipsAfter = "???";
                        }
                    }
                }

                for (let carrier of group.carriers) {
                    const isPlayerObj =
                        carrier.ownedByPlayerId.toString() ===
                        playerId.toString();

                    if (!isPlayerObj && carrier.hasScrambler) {
                        carrier.shipsLost = "???";
                        carrier.shipsBefore = "???";
                        scrambled = true;

                        if (
                            typeof carrier.shipsAfter === "number" &&
                            carrier.shipsAfter > 0
                        ) {
                            carrier.shipsAfter = "???";
                        }
                    }
                }

                if (scrambled) {
                    group.shipsLost = "???";
                    group.shipsBefore = "???";
                    group.shipsAfter = "???";
                }

                return group;
            },
        );

        return {
            groups,
        };
    }
}
