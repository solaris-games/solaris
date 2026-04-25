import type {Id} from "../types/id";
import type {CombatPlayerGrouping, CombatGroupService} from "./combatGroup";
import type {Star} from "../types/common/star";
import type {Carrier} from "../types/common/carrier";
import type {Game} from "../types/common/game";
import {groupBy} from "../utilities/utils";
import type {Player} from "../types/common/player";
import {TechnologyService, type WeaponsDetail} from "./technology";
import type {Specialist} from "../types/common/specialist";
import type {
    DetailedCombatResult,
    DetailedCombatResultGroup,
    DetailedCombatResultStar,
    DetailedCombatResultCarrier,
    CombatGroup,
    CombatBaseStar,
    CombatBaseCarrier,
    CombatBasePlayer, BasicCombatResult,
} from "../types/common/combat";

type CombatRoundState<ID, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>> = {
    round: number,
    groups: CombatGroup<ID, P, S, C>[],
}

interface ISpecialistService {
    getByIdStar(id: number): Specialist | null;
    getByIdCarrier(id: number): Specialist | null;
}

type MO<ID, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>> = { type: 'carrier', carrier: C } | { type: 'star', star: S };

type CombatResultGrouped<ID, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>> = {
    players: P[],
    carriers: C[],
    star: S | undefined,
    attackAgainst: Map<number, WeaponsDetail>,
    shipsKilled: number,
    shipsBefore: number,
    shipsAfter: number,
    shipsLost: number,
}

type GroupedCombatResult<ID, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>> = {
    groups: CombatResultGrouped<ID, P, S, C>[],
}

type BasicSideSpec = {
    ships: number,
    weaponsLevel: number,
}

const performCombatRound = <ID extends Id, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(oldState: CombatRoundState<ID, P, S, C>): CombatRoundState<ID, P, S, C> => {
    const groupsWithDamage: [CombatGroup<ID, P, S, C>, number[]][] = oldState.groups.map((group, groupIdx) => {
        const damageFromGroups = oldState.groups.map((otherGroup, otherGroupIdx) => {
            if (groupIdx === otherGroupIdx) {
                return 0;
            }

            const dmgFromOther = otherGroup.attackAgainst.get(groupIdx)!;

            if (otherGroup.ships < dmgFromOther.total) {
                return otherGroup.ships;
            } else {
                return dmgFromOther.total;
            }
        });

        const totalDamage = damageFromGroups.reduce((sum, d) => sum + d, 0);

        return [{
            ...group,
            ships: group.ships - totalDamage,
        }, damageFromGroups];
    });

    const newGroups = groupsWithDamage.map(([group, _], groupIdx) => {
        const damageDoneList = groupsWithDamage.map(([_, dd]) => dd[groupIdx]);

        const damageDone = damageDoneList.reduce((sum, d) => sum + d, 0);

        return {
            ...group,
            shipsKilled: damageDone,
        };
    });

    return {
        round: oldState.round + 1,
        groups: newGroups,
    }
}

const distributeDamage = <ID extends Id, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(group: CombatResultGrouped<ID, P, S, C>): DetailedCombatResultGroup<ID, P, S, C> => {
    let shipsToKill = group.shipsLost;

    const groupObjects: MO<ID, S, C>[] = group.carriers.map(carrier => ({type: 'carrier', carrier}));
    if (group.star) {
        groupObjects.push({type: 'star', star: group.star});
    }

    let starRes: DetailedCombatResultStar<ID, S> | undefined;
    const carriersRes: DetailedCombatResultCarrier<ID, C>[] = [];

    const deductShips = (ships: number, obj: MO<ID, S, C>) => {
        if (obj.type === 'star') {
            if (starRes) {
                starRes.shipsLost += ships;
                starRes.shipsAfter -= ships;
            } else {
                starRes = {
                    star: obj.star,
                    shipsBefore: obj.star.ships || 0,
                    shipsLost: ships,
                    shipsAfter: (obj.star.ships || 0) - ships,
                }
            }
        } else if (obj.type === 'carrier') {
            const existingRes = carriersRes.find(c => c.carrier === obj.carrier);
            if (existingRes) {
                existingRes.shipsLost += ships;
                existingRes.shipsAfter -= ships;
            } else {
                carriersRes.push({
                    carrier: obj.carrier,
                    shipsBefore: obj.carrier.ships || 0,
                    shipsLost: ships,
                    shipsAfter: (obj.carrier.ships || 0) - ships,
                });
            }
        }
    };

    const getShips = (obj: MO<ID, S, C>) => {
        if (obj.type === 'carrier') {
            return carriersRes.find(c => c.carrier === obj.carrier)?.shipsAfter || obj.carrier.ships || 0;
        } else {
            return starRes?.shipsAfter || obj.star.ships || 0;
        }
    };

    while (shipsToKill > 0) {
        const objectsToDeduct = groupObjects.filter(o => {
            if (o.type === 'carrier') {
                return getShips(o) > 1; // carrier alive
            } else {
                return getShips(o) > 0; // star alive
            }
        });

        objectsToDeduct.sort((a, b) => {
            const specsIdA = a.type === 'carrier' ? a.carrier.specialistId : a.star.specialistId;
            const specsIdB = b.type === 'carrier' ? b.carrier.specialistId : b.star.specialistId;

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

        for (let obj of objectsToDeduct) {
            const killForObj = Math.floor(killPerObject);

            const shipsRemain = getShips(obj);

            const actualKill = Math.min(killForObj, shipsRemain);

            deductShips(actualKill, obj);

            shipsToKill -= actualKill;
        }
    }

    const carriersLost = carriersRes.filter(c => c.shipsAfter <= 0);

    const specialistsLost = carriersRes.filter(c => c.carrier.specialistId && c.carrier.specialistId !== 0);

    return {
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
        attackAgainst: group.attackAgainst,
    };
}

const computeKills = <ID extends Id, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(groups: DetailedCombatResultGroup<ID, P, S, C>[]) => {
    const otherGroupsCount = groups.length - 1;

    for (let i = 0; i < groups.length; i++){
        const group = groups[i];
        const carriersKilledInOtherGroups = groups.map((og, oI) => {
            if (oI === i) {
                return 0;
            } else {
                return og.carriersKilled
            }
        }).reduce((sum, c) => sum + c, 0);

        const specialistsKilledInOtherGroups = groups.map((og, oI) => {
            if (oI === i) {
                return 0;
            } else {
                return og.specialistsKilled
            }
        }).reduce((sum, c) => sum + c, 0);

        group.carriersKilled = Math.floor(carriersKilledInOtherGroups / otherGroupsCount);
        group.specialistsKilled = Math.floor(specialistsKilledInOtherGroups / otherGroupsCount);
    }
}

const makeResult = <ID extends Id, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(state: CombatRoundState<ID, P, S, C>): DetailedCombatResult<ID, P, S, C> => {
    const groups: DetailedCombatResultGroup<ID, P, S, C>[] = state.groups.map((g) => {
        return distributeDamage({
            players: g.players,
            star: g.star,
            carriers: g.carriers,
            shipsBefore: g.originalShips,
            shipsAfter: g.ships,
            shipsLost: g.originalShips - g.ships,
            shipsKilled: g.shipsKilled,
            attackAgainst: g.attackAgainst,
        });
    });

    computeKills(groups);

    return {
        groups,
    }
}

const isCombatOver = <ID extends Id, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(state: CombatRoundState<ID, P, S, C>) => {
    return state.groups.filter(g => g.ships > 0).length <= 1; // mutual destruction is possible
}

const combatLoop = <ID extends Id, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(initState: CombatRoundState<ID, P, S, C>): DetailedCombatResult<ID, P, S, C> => {
    let state = initState;

    while (true) {
        // check for dead
        if (isCombatOver(state)) {
            break;
        }

        state = performCombatRound(state);
    }

    return makeResult(state);
}

const findGroup = <ID extends Id, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(result: DetailedCombatResult<ID, P, S, C>, playerId: ID) => {
    return result.groups.find(g => g.players.find(p => p._id === playerId));
}

const estimateNeeded = <ID extends Id, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(combatResult: DetailedCombatResult<ID, P, S, C>, estimateForGroup: DetailedCombatResultGroup<ID, P, S, C>) => {
    return 0;
}

export class CombatService<ID extends Id> {
    combatGroupService: CombatGroupService<ID>;
    technologyService: TechnologyService;
    specialistService: ISpecialistService;

    constructor(combatGroupService: CombatGroupService<ID>, technologyService: TechnologyService, specialistService: ISpecialistService) {
        this.combatGroupService = combatGroupService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
    }

    private _createGroup<P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(players: P[], star: S | undefined, carriers: C[]): CombatGroup<ID, P, S, C> {
        const totalShips = carriers.reduce((sum, c) => sum + (c.ships || 0), 0) + (star ? (star.ships || 0) : 0);

        return {
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

    private _computeGroupWeapons<P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(game: Game<ID>, groups: CombatGroup<ID, P, S, C>[], isCarrierToStarCombat: boolean) {
        // siege breaker should apply a weapons bonus against ALL groups which contain a player that was targeted at launch

        for (let groupIdx = 0; groupIdx < groups.length; groupIdx++){
            const group = groups[groupIdx];

            for (let otherGroupIdx = 0; otherGroupIdx < groups.length; otherGroupIdx++){
                const otherGroup = groups[otherGroupIdx];

                if (group === otherGroup) {
                    continue;
                }

                const weps = this.technologyService.getEffectiveWeaponsDetail(game, group, otherGroup, isCarrierToStarCombat);
                group.attackAgainst.set(otherGroupIdx, weps);
            }
        }
    }

    private _makeGroups<P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(game: Game<ID>, star: S | undefined, carriers: C[], cgs: CombatPlayerGrouping<ID, P>): CombatGroup<ID, P, S, C>[] {
        const carriersByPlayerId = groupBy(carriers, (c) => c.ownedByPlayerId!);

        const groups: CombatGroup<ID, P, S, C>[] = cgs.groups.map((g) => {
            const carriers = g.flatMap((p) => carriersByPlayerId.get(p._id)!);

            if (star) {
                if (g.find((p) => p._id === star?.ownedByPlayerId)) {
                    return this._createGroup<P, S, C>(g, star, carriers);
                } else {
                    return this._createGroup<P, S, C>(g, undefined, carriers);
                }
            } else {
                return this._createGroup<P, S, C>(g, undefined, carriers);
            }
        });

        groups.sort((g1, g2) => {
            if (g1.isDefender) {
                return -1;
            }

            if (g2.isDefender) {
                return 1;
            }

            return g2.originalShips - g1.originalShips;
        });

        this._computeGroupWeapons(game, groups, Boolean(star));

        return groups;
    }

    getGroup(combatResult: DetailedCombatResult<ID, Player<ID>, Star<ID>, Carrier<ID>>, playerId: ID) {
        return findGroup(combatResult, playerId);
    }

    getDefender(combatResult: DetailedCombatResult<ID, Player<ID>, Star<ID>, Carrier<ID>>) {
        return combatResult.groups.find(g => g.star);
    }

    estimateNeeded<ID extends Id, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>>(combatResult: DetailedCombatResult<ID, P, S, C>, estimateForGroup: DetailedCombatResultGroup<ID, P, S, C>) {
        return estimateNeeded(combatResult, estimateForGroup);
    }

    computeBasic(defender: BasicSideSpec, attacker: BasicSideSpec, isCarrierToStarCombat: boolean): BasicCombatResult {
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

        const carrierGroup = (id: string, weapons: number, ships: number) => {
            return {
                players: [
                    {
                        _id: id,
                        research: {
                            weapons: {
                                level: weapons,
                            },
                        },
                    }
                ],
                originalShips: ships,
                ships,
                isDefender: false,
                carriers: [
                    {
                        _id: 'attackerCarrier',
                        ships,
                        specialistId: null,
                        ownedByPlayerId: id,
                    },
                ],
                star: undefined,
                shipsKilled: 0,
                attackAgainst: attackMap(0, weapons),
            };
        };

        const starGroup = (id: string, weapons: number, ships: number) => {
            return {
                players: [
                    {
                        _id: id,
                        research: {
                            weapons: {
                                level: weapons,
                            },
                        }
                    }
                ],
                originalShips: ships,
                ships,
                isDefender: true,
                carriers: [],
                star: {
                    _id: 'star',
                    ships,
                    specialistId: null,
                    ownedByPlayerId: id,
                },
                shipsKilled: 0,
                attackAgainst: attackMap(1, weapons),
            };
        };

        let groups: CombatGroup<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>[];

        if (isCarrierToStarCombat) {
            groups = [
                starGroup("defender", defender.weaponsLevel, defender.ships),
                carrierGroup("attacker", attacker.weaponsLevel, attacker.ships),
            ];
        } else {
            groups = [
                carrierGroup("defender", defender.weaponsLevel, defender.ships),
                carrierGroup("attacker", attacker.weaponsLevel, attacker.ships),
            ];
        }

        const result: DetailedCombatResult<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>> = combatLoop({ round: 0, groups });

        const defenderGroup = findGroup(result, "defender")!;
        const attackerGroup = findGroup(result, "attacker")!;

        const defenderNeeded = estimateNeeded(result, defenderGroup);
        const attackerNeeded = estimateNeeded(result, attackerGroup);

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

    computeStar(game: Game<ID>, star: Star<ID>, carriers: Carrier<ID>[]): DetailedCombatResult<ID, Player<ID>, Star<ID>, Carrier<ID>> {
        const playerIds = new Set<ID>([star.ownedByPlayerId!]);

        carriers.forEach((c) => playerIds.add(c.ownedByPlayerId!));

        const players = Array.from(playerIds, (p) => game.galaxy.players.find(pl => pl._id === p)!);

        const combatDiploGroups = this.combatGroupService.computeCombatGroups(game, players);

        const combatGroups = this._makeGroups<Player<ID>, Star<ID>, Carrier<ID>>(game, star, carriers, combatDiploGroups);

        return combatLoop<ID, Player<ID>, Star<ID>, Carrier<ID>>({round: 0, groups: combatGroups});
    }

    computeCarrier(game: Game<ID>, carriers: Carrier<ID>[]): DetailedCombatResult<ID, Player<ID>, Star<ID>, Carrier<ID>> {
        const playerIds = new Set<ID>();

        carriers.forEach((c) => playerIds.add(c.ownedByPlayerId!));

        const players = Array.from(playerIds, (p) => game.galaxy.players.find(pl => pl._id === p)!);

        const combatDiploGroups = this.combatGroupService.computeCombatGroups(game, players);

        const combatGroups = this._makeGroups<Player<ID>, Star<ID>, Carrier<ID>>(game, undefined, carriers, combatDiploGroups);

        return combatLoop<ID, Player<ID>, Star<ID>, Carrier<ID>>({round: 0, groups: combatGroups});
    }
}