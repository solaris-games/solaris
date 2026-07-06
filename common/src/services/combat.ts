import type { Id } from "../types/id";
import type { CombatGroupService, CombatPlayerGrouping } from "./combatGroup";
import type { Star } from "../types/common/star";
import type { Carrier } from "../types/common/carrier";
import type { Game } from "../types/common/game";
import { groupBy } from "../utilities/utils";
import type { Player } from "../types/common/player";
import { TechnologyService, type WeaponsDetail } from "./technology";
import type { Specialist } from "../types/common/specialist";
import type {
    BasicCombatResult,
    CombatBaseCarrier,
    CombatBasePlayer,
    CombatBaseStar,
    CombatGroup,
    CombatResult,
    DetailedCombatResult,
    DetailedCombatResultCarrier,
    DetailedCombatResultGroup,
    DetailedCombatResultStar,
} from "../types/common/combat";

type CombatRoundState<
    ID,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
> = {
    round: number;
    groups: CombatGroup<ID, P, S, C>[];
};

interface ISpecialistService {
    getByIdStar(id: number): Specialist | null;

    getByIdCarrier(id: number): Specialist | null;
}

type MO<ID, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>> =
    | { type: "carrier"; carrier: DetailedCombatResultCarrier<ID, C> }
    | {
          type: "star";
          star: DetailedCombatResultStar<ID, S>;
      };

type CombatResultGrouped<
    ID,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
> = {
    id: string;
    players: P[];
    carriers: C[];
    star: S | undefined;
    attackAgainst: Map<number, WeaponsDetail>;
    shipsKilled: number;
    shipsBefore: number;
    shipsAfter: number;
    shipsLost: number;
};

type BasicSideSpec = {
    ships: number;
    weaponsLevel: number;
};

type GroupsWithDamage<
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
> = [CombatGroup<ID, P, S, C>, Map<string, number>][];

const calculateIncomingDamages = <
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
>(
    groups: CombatGroup<ID, P, S, C>[],
    attackingGroups: CombatGroup<ID, P, S, C>[],
): GroupsWithDamage<ID, P, S, C> => {
    return groups.map((group, groupIdx) => {
        const damageFromGroups = new Map<string, number>();
        let totalDamage = 0;

        attackingGroups.forEach((otherGroup) => {
            if (group.id === otherGroup.id) {
                return;
            }

            const dmgFromOther = otherGroup.attackAgainst.get(groupIdx)!;

            let damage;
            if (otherGroup.ships < dmgFromOther.total) {
                damage = otherGroup.ships;
            } else {
                damage = dmgFromOther.total;
            }

            damageFromGroups.set(otherGroup.id, damage);
            totalDamage += damage;
        });

        return [
            {
                ...group,
                ships: Math.max(0, group.ships - totalDamage),
            },
            damageFromGroups,
        ];
    });
};

const applyDamages = <
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
>(
    groupsWithDamage: GroupsWithDamage<ID, P, S, C>,
) => {
    return groupsWithDamage.map(([group, _]) => {
        const damageDoneList = groupsWithDamage.map(
            ([_, dd]) => dd.get(group.id) || 0,
        );

        const damageDone = damageDoneList.reduce((sum, d) => sum + d, 0);

        return {
            ...group,
            shipsKilled: damageDone,
        };
    });
};

const performCombatRound = <
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
>(
    oldState: CombatRoundState<ID, P, S, C>,
    isCarrierToStarCombat: boolean,
): CombatRoundState<ID, P, S, C> => {
    let groupsWithDamage: GroupsWithDamage<ID, P, S, C>;

    if (isCarrierToStarCombat && oldState.round === 0) {
        // special handling for defender attacking first
        groupsWithDamage = calculateIncomingDamages(
            oldState.groups,
            oldState.groups.filter((g) => g.isDefender),
        );
    } else {
        groupsWithDamage = calculateIncomingDamages(
            oldState.groups,
            oldState.groups,
        );
    }

    const newGroups = applyDamages(groupsWithDamage);

    return {
        round: oldState.round + 1,
        groups: newGroups,
    };
};

const mapToRecord = (
    map: Map<number, WeaponsDetail>,
): Record<string, WeaponsDetail> => {
    const obj: Record<number, WeaponsDetail> = {};

    for (let [k, v] of map) {
        obj[k] = v;
    }

    return obj;
};

const distributeDamage = <
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
>(
    group: CombatResultGrouped<ID, P, S, C>,
): DetailedCombatResultGroup<ID, P, S, C> => {
    let shipsToKill = group.shipsLost;

    const groupObjects: MO<ID, S, C>[] = group.carriers.map((carrier) => {
        return {
            type: "carrier",
            carrier: {
                carrier,
                shipsBefore: carrier.ships || 0,
                shipsLost: 0,
                shipsAfter: carrier.ships || 0,
            },
        };
    });

    if (group.star) {
        groupObjects.push({
            type: "star",
            star: {
                star: group.star,
                shipsBefore: group.star.ships || 0,
                shipsLost: 0,
                shipsAfter: group.star.ships || 0,
            },
        });
    }

    const deductShips = (ships: number, obj: MO<ID, S, C>) => {
        if (obj.type === "star") {
            obj.star.shipsLost += ships;
            obj.star.shipsAfter -= ships;
        } else if (obj.type === "carrier") {
            obj.carrier.shipsAfter -= ships;
            obj.carrier.shipsLost += ships;
        }
    };

    const getShips = (obj: MO<ID, S, C>) => {
        if (obj.type === "carrier") {
            return obj.carrier.shipsAfter;
        } else {
            return obj.star.shipsAfter;
        }
    };

    while (shipsToKill > 0) {
        const objectsToDeduct = groupObjects.filter((o) => {
            if (o.type === "carrier") {
                return getShips(o) > 0; // carrier alive
            } else {
                return getShips(o) > 0; // star alive
            }
        });

        if (objectsToDeduct.length === 0) {
            throw Error("No more objects to deduct damage from");
        }

        objectsToDeduct.sort((a, b) => {
            const specsIdA =
                a.type === "carrier"
                    ? a.carrier.carrier.specialistId
                    : a.star.star.specialistId;
            const specsIdB =
                b.type === "carrier"
                    ? b.carrier.carrier.specialistId
                    : b.star.star.specialistId;

            // Sort by specialist (kill objects without specialists first)
            if (specsIdA == null && specsIdB != null) {
                return -1;
            } else if (specsIdA != null && specsIdB == null) {
                return 1;
            }

            const shipsA = getShips(a);
            const shipsB = getShips(b);

            // Sort by ships descending (kill objects with the most ships first)
            if (shipsA > shipsB) return -1;
            if (shipsA < shipsB) return 1;

            return 0; // Both are the same.
        });

        const killPerObject = shipsToKill / objectsToDeduct.length;

        for (let [idx, obj] of objectsToDeduct.entries()) {
            const killForObj =
                idx === 0
                    ? Math.ceil(killPerObject)
                    : Math.floor(killPerObject);

            const shipsRemain = getShips(obj);

            const actualKill = Math.min(killForObj, shipsRemain);

            deductShips(actualKill, obj);

            shipsToKill -= actualKill;
        }
    }

    const carriersLost = groupObjects.filter(
        (c) => c.type === "carrier" && c.carrier.shipsAfter <= 0,
    );

    const specialistsLost = groupObjects.filter(
        (c) =>
            c.type === "carrier" &&
            c.carrier.carrier.specialistId &&
            c.carrier.carrier.specialistId !== 0,
    );

    const carriersRes = groupObjects.flatMap((o) => {
        if (o.type === "carrier") {
            return [o.carrier];
        } else {
            return [];
        }
    });

    const starRes = groupObjects.find((o) => o.type === "star")?.star;

    return {
        id: group.id,
        players: group.players,
        carriers: carriersRes,
        star: starRes,
        shipsBefore: group.shipsBefore,
        shipsLost: group.shipsLost,
        shipsAfter: group.shipsAfter,
        shipsKilled: group.shipsKilled,
        carriersKilled: 0, // backfilled later
        carriersLost: carriersLost.length,
        specialistsKilled: 0, // backfilled later
        specialistsLost: specialistsLost.length,
        attackAgainst: mapToRecord(group.attackAgainst),
    };
};

const computeKills = <
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
>(
    groups: DetailedCombatResultGroup<ID, P, S, C>[],
) => {
    const otherGroupsCount = groups.length - 1;

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const carriersKilledInOtherGroups = groups
            .map((og, oI) => {
                if (oI === i) {
                    return 0;
                } else {
                    return og.carriersKilled;
                }
            })
            .reduce((sum, c) => sum + c, 0);

        const specialistsKilledInOtherGroups = groups
            .map((og, oI) => {
                if (oI === i) {
                    return 0;
                } else {
                    return og.specialistsKilled;
                }
            })
            .reduce((sum, c) => sum + c, 0);

        group.carriersKilled = Math.floor(
            carriersKilledInOtherGroups / otherGroupsCount,
        );
        group.specialistsKilled = Math.floor(
            specialistsKilledInOtherGroups / otherGroupsCount,
        );
    }
};

const makeResult = <
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
>(
    state: CombatRoundState<ID, P, S, C>,
    originalCombatGroups: CombatGroup<ID, P, S, C>[],
    isCarrierToStarCombat: boolean,
): DetailedCombatResult<ID, P, S, C> => {
    const groups: DetailedCombatResultGroup<ID, P, S, C>[] = state.groups.map(
        (g) => {
            return distributeDamage({
                id: g.id,
                players: g.players,
                star: g.star,
                carriers: g.carriers,
                shipsBefore: g.originalShips,
                shipsAfter: g.ships,
                shipsLost: g.originalShips - g.ships,
                shipsKilled: g.shipsKilled,
                attackAgainst: g.attackAgainst,
            });
        },
    );

    computeKills(groups);

    return {
        combatGroups: originalCombatGroups,
        isCarrierToStarCombat,
        groups,
    };
};

const isCombatOver = <
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
>(
    state: CombatRoundState<ID, P, S, C>,
) => {
    return state.groups.filter((g) => g.ships > 0).length <= 1; // mutual destruction is possible
};

const combatLoop = <
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
>(
    initState: CombatRoundState<ID, P, S, C>,
    isCarrierToStarCombat: boolean,
    callback?: (st: CombatRoundState<ID, P, S, C>) => void,
): DetailedCombatResult<ID, P, S, C> => {
    let state = initState;

    while (true) {
        if (callback) {
            callback(state);
        }

        // check for dead
        if (isCombatOver(state)) {
            break;
        }

        state = performCombatRound(state, isCarrierToStarCombat);
    }

    return makeResult(state, initState.groups, isCarrierToStarCombat);
};

const findGroupDetailed = <
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
>(
    result: DetailedCombatResult<ID, P, S, C>,
    playerId: ID,
) => {
    return result.groups.find((g) =>
        g.players.find((p) => p._id.toString() === playerId.toString()),
    );
};

const findGroup = <ID extends Id>(result: CombatResult<ID>, playerId: ID) => {
    return result.groups.find((g) =>
        g.playerIds.find((id) => id.toString() === playerId.toString()),
    );
};

const estimateNeeded = <
    ID extends Id,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
>(
    combatResult: DetailedCombatResult<ID, P, S, C>,
    estimateForGroup: DetailedCombatResultGroup<ID, P, S, C>,
    originalGroups: CombatGroup<ID, P, S, C>[],
) => {
    const originalShips = estimateForGroup.shipsBefore;

    if (estimateForGroup.shipsAfter > 0) {
        return originalShips;
    }

    let shipsNeeded = originalShips + 1;

    while (true) {
        const modifiedGroups = originalGroups.map((gr) => {
            if (gr.id === estimateForGroup.id) {
                const newGr = {
                    ...gr,
                    originalShips: shipsNeeded,
                    ships: shipsNeeded,
                    shipsKilled: 0,
                };
                if (newGr.star) {
                    newGr.star = {
                        ...newGr.star,
                        ships:
                            newGr.star.ships! + (shipsNeeded - originalShips),
                    };
                } else {
                    newGr.carriers[0] = {
                        ...newGr.carriers[0],
                        ships:
                            newGr.carriers[0].ships! +
                            (shipsNeeded - originalShips),
                    };
                }
                return newGr;
            } else {
                return gr;
            }
        });

        const newResult = combatLoop(
            { round: 0, groups: modifiedGroups },
            combatResult.isCarrierToStarCombat,
        );

        const groupInNew = newResult.groups.find(
            (g) => g.id === estimateForGroup.id,
        );
        if (groupInNew!.shipsAfter > 0) {
            break;
        }

        if (shipsNeeded > 1000) {
            break;
        }

        shipsNeeded++;
    }

    return shipsNeeded;
};

export class CombatService<ID extends Id> {
    combatGroupService: CombatGroupService<ID>;
    technologyService: TechnologyService;
    specialistService: ISpecialistService;

    constructor(
        combatGroupService: CombatGroupService<ID>,
        technologyService: TechnologyService,
        specialistService: ISpecialistService,
    ) {
        this.combatGroupService = combatGroupService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
    }

    private _createGroup<
        P extends CombatBasePlayer<ID>,
        S extends CombatBaseStar<ID>,
        C extends CombatBaseCarrier<ID>,
    >(
        id: string,
        players: P[],
        star: S | undefined,
        carriers: C[],
    ): CombatGroup<ID, P, S, C> {
        const totalShips =
            carriers.reduce((sum, c) => sum + (c.ships || 0), 0) +
            (star ? star.ships || 0 : 0);

        return {
            id,
            originalShips: totalShips,
            ships: totalShips,
            isDefender: Boolean(star),
            attackAgainst: new Map(), // will be populated later
            players,
            carriers,
            star,
            shipsKilled: 0,
        };
    }

    computeGroupWeapons<
        P extends CombatBasePlayer<ID>,
        S extends CombatBaseStar<ID>,
        C extends CombatBaseCarrier<ID>,
    >(
        game: Game<ID>,
        groups: CombatGroup<ID, P, S, C>[],
        isCarrierToStarCombat: boolean,
    ) {
        this._sortGroups(groups);

        // siege breaker should apply a weapons bonus against ALL groups which contain a player that was targeted at launch

        for (let groupIdx = 0; groupIdx < groups.length; groupIdx++) {
            const group = groups[groupIdx];

            for (
                let otherGroupIdx = 0;
                otherGroupIdx < groups.length;
                otherGroupIdx++
            ) {
                const otherGroup = groups[otherGroupIdx];

                if (group.id === otherGroup.id) {
                    continue;
                }

                const weps = this.technologyService.getEffectiveWeaponsDetail(
                    game,
                    group,
                    otherGroup,
                    isCarrierToStarCombat,
                );
                group.attackAgainst.set(otherGroupIdx, weps);
            }
        }
    }

    private _makeGroups<
        P extends CombatBasePlayer<ID>,
        S extends CombatBaseStar<ID>,
        C extends CombatBaseCarrier<ID>,
    >(
        game: Game<ID>,
        star: S | undefined,
        carriers: C[],
        cgs: CombatPlayerGrouping<ID, P>,
    ): CombatGroup<ID, P, S, C>[] {
        const carriersByPlayerId = groupBy(carriers, (c) =>
            c.ownedByPlayerId!.toString(),
        );

        const groups: CombatGroup<ID, P, S, C>[] = cgs.groups.map((g, idx) => {
            const carriers = g.flatMap((p) => {
                return carriersByPlayerId.get(p._id.toString()) || [];
            });

            const id = `Group ${idx}`;

            if (star) {
                if (
                    g.find(
                        (p) =>
                            p._id.toString() ===
                            star?.ownedByPlayerId?.toString(),
                    )
                ) {
                    return this._createGroup<P, S, C>(id, g, star, carriers);
                } else {
                    return this._createGroup<P, S, C>(
                        id,
                        g,
                        undefined,
                        carriers,
                    );
                }
            } else {
                return this._createGroup<P, S, C>(id, g, undefined, carriers);
            }
        });

        this.computeGroupWeapons(game, groups, Boolean(star));

        return groups;
    }

    getGroup(combatResult: CombatResult<ID>, playerId: ID) {
        return findGroup(combatResult, playerId);
    }

    getWinner(combatResult: CombatResult<ID>) {
        return combatResult.groups.find(
            (g) => (typeof g.shipsAfter === "number" ? g.shipsAfter : 1) > 0,
        ); // if result is masked it is non-zero
    }

    getWinnerDetailed<
        P extends CombatBasePlayer<ID>,
        S extends CombatBaseStar<ID>,
        C extends CombatBaseCarrier<ID>,
    >(combatResult: DetailedCombatResult<ID, P, S, C>) {
        return combatResult.groups.find(
            (g) => (typeof g.shipsAfter === "number" ? g.shipsAfter : 1) > 0,
        ); // if result is masked it is non-zero
    }

    getGroupDetailed(
        combatResult: DetailedCombatResult<
            ID,
            Player<ID>,
            Star<ID>,
            Carrier<ID>
        >,
        playerId: ID,
    ) {
        return findGroupDetailed(combatResult, playerId);
    }

    getDefenderDetailed(
        combatResult: DetailedCombatResult<
            ID,
            Player<ID>,
            Star<ID>,
            Carrier<ID>
        >,
    ) {
        return combatResult.groups.find((g) => g.star);
    }

    estimateNeeded<
        ID extends Id,
        P extends CombatBasePlayer<ID>,
        S extends CombatBaseStar<ID>,
        C extends CombatBaseCarrier<ID>,
    >(
        combatResult: DetailedCombatResult<ID, P, S, C>,
        estimateForGroup: DetailedCombatResultGroup<ID, P, S, C>,
    ) {
        return estimateNeeded(
            combatResult,
            estimateForGroup,
            combatResult.combatGroups,
        );
    }

    calculateBasic(
        defender: BasicSideSpec,
        attacker: BasicSideSpec,
        isCarrierToStarCombat: boolean,
        includeDefenderBonus: boolean,
    ): BasicCombatResult {
        const attackMap = (group: number, level: number) => {
            const m = new Map<number, WeaponsDetail>();
            m.set(group, {
                total: level,
                appliedBuffs: [],
                weaponsBuff: 0,
                weaponsLevel: level,
            });
            return m;
        };

        const carrierGroup = (
            id: string,
            weapons: number,
            ships: number,
            ownId: number,
        ) => {
            return {
                id,
                players: [
                    {
                        _id: id,
                        research: {
                            weapons: {
                                level: weapons,
                            },
                        },
                    },
                ],
                originalShips: ships,
                ships,
                isDefender: false,
                carriers: [
                    {
                        _id: "attackerCarrier",
                        ships,
                        specialistId: null,
                        ownedByPlayerId: id,
                        specialistTargetedPlayers: [],
                    },
                ],
                star: undefined,
                shipsKilled: 0,
                attackAgainst: attackMap(ownId === 0 ? 1 : 0, weapons),
            };
        };

        const starGroup = (id: string, weapons: number, ships: number) => {
            return {
                id,
                players: [
                    {
                        _id: id,
                        research: {
                            weapons: {
                                level: weapons,
                            },
                        },
                    },
                ],
                originalShips: ships,
                ships,
                isDefender: true,
                carriers: [],
                star: {
                    _id: "star",
                    ships,
                    specialistId: null,
                    ownedByPlayerId: id,
                    homeStar: false,
                    isAsteroidField: false,
                },
                shipsKilled: 0,
                attackAgainst: attackMap(1, weapons),
            };
        };

        let groups: CombatGroup<
            string,
            CombatBasePlayer<string>,
            CombatBaseStar<string>,
            CombatBaseCarrier<string>
        >[];

        if (isCarrierToStarCombat) {
            groups = [
                starGroup(
                    "defender",
                    defender.weaponsLevel + (includeDefenderBonus ? 1 : 0),
                    defender.ships,
                ),
                carrierGroup(
                    "attacker",
                    attacker.weaponsLevel,
                    attacker.ships,
                    1,
                ),
            ];
        } else {
            groups = [
                carrierGroup(
                    "defender",
                    defender.weaponsLevel,
                    defender.ships,
                    0,
                ),
                carrierGroup(
                    "attacker",
                    attacker.weaponsLevel,
                    attacker.ships,
                    1,
                ),
            ];
        }

        const result: DetailedCombatResult<
            string,
            CombatBasePlayer<string>,
            CombatBaseStar<string>,
            CombatBaseCarrier<string>
        > = combatLoop(
            {
                round: 0,
                groups,
            },
            isCarrierToStarCombat,
        );

        const defenderGroup = findGroupDetailed(result, "defender")!;
        const attackerGroup = findGroupDetailed(result, "attacker")!;

        const attackerWon = attackerGroup.shipsAfter > defenderGroup.shipsAfter;

        const defenderNeeded = attackerWon
            ? estimateNeeded(result, defenderGroup, groups)
            : undefined;
        const attackerNeeded = attackerWon
            ? undefined
            : estimateNeeded(result, attackerGroup, groups);

        return {
            defender: {
                shipsBefore: defenderGroup.shipsBefore,
                shipsAfter: defenderGroup.shipsAfter,
                shipsLost: defenderGroup.shipsLost,
                shipsNeeded: defenderNeeded,
            },
            attacker: {
                shipsBefore: attackerGroup.shipsBefore,
                shipsAfter: attackerGroup.shipsAfter,
                shipsLost: attackerGroup.shipsLost,
                shipsNeeded: attackerNeeded,
            },
        };
    }

    calculateGroups<
        P extends CombatBasePlayer<ID>,
        S extends CombatBaseStar<ID>,
        C extends CombatBaseCarrier<ID>,
    >(
        groups: CombatGroup<ID, P, S, C>[],
        isCarrierToStarCombat: boolean,
        callback?: (st: CombatRoundState<ID, P, S, C>) => void,
    ) {
        return combatLoop<ID, P, S, C>(
            { round: 0, groups },
            isCarrierToStarCombat,
            callback,
        );
    }

    // returns undefined if no combat happens
    computeStar(
        game: Game<ID>,
        star: Star<ID>,
        carriers: Carrier<ID>[],
        callback?: (
            st: CombatRoundState<ID, Player<ID>, Star<ID>, Carrier<ID>>,
        ) => void,
    ): DetailedCombatResult<ID, Player<ID>, Star<ID>, Carrier<ID>> | undefined {
        const playerIds = new Set<string>([star.ownedByPlayerId!.toString()]);

        carriers.forEach((c) => playerIds.add(c.ownedByPlayerId!.toString()));

        const players = Array.from(playerIds, (p) =>
            game.galaxy.players.find((pl) => pl._id.toString() === p)!,
        );

        const combatDiploGroups = this.combatGroupService.computeCombatGroups(
            game,
            players,
        );
        if (combatDiploGroups.groups.length < 2) {
            return undefined;
        }

        const combatGroups = this._makeGroups<
            Player<ID>,
            Star<ID>,
            Carrier<ID>
        >(game, star, carriers, combatDiploGroups);

        return combatLoop<ID, Player<ID>, Star<ID>, Carrier<ID>>(
            { round: 0, groups: combatGroups },
            true,
            callback,
        );
    }

    // returns undefined if no combat happens
    computeCarrier(
        game: Game<ID>,
        carriers: Carrier<ID>[],
        callback?: (
            st: CombatRoundState<ID, Player<ID>, Star<ID>, Carrier<ID>>,
        ) => void,
    ): DetailedCombatResult<ID, Player<ID>, Star<ID>, Carrier<ID>> | undefined {
        const playerIds = new Set<ID>();

        carriers.forEach((c) => playerIds.add(c.ownedByPlayerId!));

        const players = Array.from(playerIds, (p) =>
            game.galaxy.players.find(
                (pl) => pl._id.toString() === p.toString(),
            )!,
        );

        const combatDiploGroups = this.combatGroupService.computeCombatGroups(
            game,
            players,
        );
        if (combatDiploGroups.groups.length < 2) {
            return undefined;
        }

        const combatGroups = this._makeGroups<
            Player<ID>,
            Star<ID>,
            Carrier<ID>
        >(game, undefined, carriers, combatDiploGroups);

        return combatLoop<ID, Player<ID>, Star<ID>, Carrier<ID>>(
            { round: 0, groups: combatGroups },
            false,
            callback,
        );
    }

    private _sortGroups<
        P extends CombatBasePlayer<ID>,
        S extends CombatBaseStar<ID>,
        C extends CombatBaseCarrier<ID>,
    >(groups: CombatGroup<ID, P, S, C>[]) {
        groups.sort((g1, g2) => {
            if (g1.isDefender) {
                return -1;
            }

            if (g2.isDefender) {
                return 1;
            }

            return g2.originalShips - g1.originalShips;
        });
    }
}
