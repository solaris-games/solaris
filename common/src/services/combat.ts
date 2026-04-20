import type {Id} from "../types/id";
import type {CombatPlayerGrouping, CombatGroupService} from "./combatGroup";
import type {Star} from "../types/common/star";
import type {Carrier} from "../types/common/carrier";
import type {Game} from "../types/common/game";
import {groupBy} from "../utilities/utils";
import type {Player} from "../types/common/player";
import {TechnologyService, type WeaponsDetail} from "./technology";
import type {Specialist} from "../types/common/specialist";
import {
    GroupedCombatResult,
    CombatResultGrouped,
    CombatResult,
    CombatResultGroup,
    CombatResultStar, CombatResultCarrier, CombatGroup
} from "../types/common/combat";
import EventEmitter from "events";

type CombatRoundState<ID> = {
    round: number,
    groups: CombatGroup<ID>[],
}

interface ISpecialistService {
    getByIdStar(id: number): Specialist | null;
    getByIdCarrier(id: number): Specialist | null;
}

type MO<ID> = { type: 'carrier', carrier: Carrier<ID> } | { type: 'star', star: Star<ID> };

export class CombatService<ID extends Id> {
    combatGroupService: CombatGroupService<ID>;
    technologyService: TechnologyService;
    specialistService: ISpecialistService;

    constructor(combatGroupService: CombatGroupService<ID>, technologyService: TechnologyService, specialistService: ISpecialistService) {
        this.combatGroupService = combatGroupService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
    }

    _createGroup(players: Player<ID>[], star: Star<ID> | undefined, carriers: Carrier<ID>[]): CombatGroup<ID> {
        const totalShips = carriers.reduce((sum, c) => sum + (c.ships || 0), 0) + (star ? (star.ships || 0) : 0);

        const specialists = new Array<Specialist>()

        // in conclusion, we have to do the weapons level calc for EACH group against EACH group

        if (star?.specialistId) {
            specialists.push(this.specialistService.getByIdStar(star.specialistId)!);
        }

        for (let carrier of carriers) {
            if (carrier.specialistId) {
                specialists.push(this.specialistService.getByIdCarrier(carrier.specialistId)!);
            }
        }

        return {
            originalShips: totalShips,
            ships: totalShips,
            isDefender: Boolean(star),
            attackAgainst: new Map(), // will be populated later
            specialists,
            players,
            carriers,
            star,
            shipsKilled: 0,
        };
    }

    _computeGroupWeapons(game: Game<ID>, groups: CombatGroup<ID>[], isCarrierToStarCombat: boolean) {
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

    _makeGroups(game: Game<ID>, star: Star<ID> | undefined, carriers: Carrier<ID>[], cgs: CombatPlayerGrouping<ID>) {
        const carriersByPlayerId = groupBy(carriers, (c) => c.ownedByPlayerId!);

        const groups = cgs.groups.map((g) => {
            const carriers = g.flatMap((p) => carriersByPlayerId.get(p._id)!);

            if (star) {
                if (g.find((p) => p._id === star?.ownedByPlayerId)) {
                    return this._createGroup(g, star, carriers);
                } else {
                    return this._createGroup(g, undefined, carriers);
                }
            } else {
                return this._createGroup(g, undefined, carriers);
            }
        });

        this._computeGroupWeapons(game, groups, Boolean(star));

        return groups;
    }

    _performCombatRound(oldState: CombatRoundState<ID>): CombatRoundState<ID> {
        const groupsWithDamage: [CombatGroup<ID>, number[]][] = oldState.groups.map((group, groupIdx) => {
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

    _distributeDamage(group: CombatResultGrouped<ID>): CombatResultGroup<ID> {
        let shipsToKill = group.shipsLost;

        const groupObjects: MO<ID>[] = group.carriers.map(carrier => ({ type: 'carrier', carrier }));
        if (group.star) {
            groupObjects.push({ type: 'star', star: group.star });
        }

        let starRes: CombatResultStar<ID> | undefined;
        const carriersRes: CombatResultCarrier<ID>[] = [];

        const deductShips = (ships: number, obj: MO<ID>) => {
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

        const getShips = (obj: MO<ID>) => {
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
        };
    }

    _computeKills(groups: CombatResultGroup<ID>[]) {
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

    _makeResult(state: CombatRoundState<ID>): CombatResult<ID> {
        const groups: CombatResultGroup<ID>[] = state.groups.map((g) => {
            return this._distributeDamage({
                players: g.players,
                star: g.star,
                carriers: g.carriers,
                shipsBefore: g.originalShips,
                shipsAfter: g.ships,
                shipsLost: g.originalShips - g.ships,
                shipsKilled: g.shipsKilled,
            });
        });

        this._computeKills(groups);

        return {
            groups,
        }
    }

    _isCombatOver(state: CombatRoundState<ID>) {
        return state.groups.filter(g => g.ships > 0).length <= 1; // mutual destruction is possible
    }

    _combatLoop(initState: CombatRoundState<ID>): CombatResult<ID> {
        let state = initState;

        while (true) {
            // check for dead
            if (this._isCombatOver(state)) {
                break;
            }

            state = this._performCombatRound(state);
        }

        return this._makeResult(state);
    }

    computeStar(game: Game<ID>, star: Star<ID>, carriers: Carrier<ID>[]): CombatResult<ID> {
        const playerIds = new Set<ID>([star.ownedByPlayerId!]);

        carriers.forEach((c) => playerIds.add(c.ownedByPlayerId!));

        const players = Array.from(playerIds, (p) => game.galaxy.players.find(pl => pl._id === p)!);

        const combatDiploGroups = this.combatGroupService.computeCombatGroups(game, players);

        const combatGroups = this._makeGroups(game, star, carriers, combatDiploGroups);

        return this._combatLoop({round: 0, groups: combatGroups});
    }

    computeCarrier(game: Game<ID>, carriers: Carrier<ID>[]): CombatResult<ID> {
        const playerIds = new Set<ID>();

        carriers.forEach((c) => playerIds.add(c.ownedByPlayerId!));

        const players = Array.from(playerIds, (p) => game.galaxy.players.find(pl => pl._id === p)!);

        const combatDiploGroups = this.combatGroupService.computeCombatGroups(game, players);

        const combatGroups = this._makeGroups(game, undefined, carriers, combatDiploGroups);

        return this._combatLoop({round: 0, groups: combatGroups});
    }
}