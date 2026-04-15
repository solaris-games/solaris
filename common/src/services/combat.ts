import type {Id} from "../types/id";
import type {CombatPlayerGrouping, CombatGroupService} from "./combatGroup";
import type {Star} from "../types/common/star";
import type {Carrier} from "../types/common/carrier";
import type {Game} from "../types/common/game";
import {groupBy} from "../utilities/utils";
import type {Player} from "../types/common/player";
import {TechnologyService, type WeaponsDetail} from "./technology";
import type {Specialist} from "../types/common/specialist";
import type {CombatResult, CombatResultGroup} from "../types/common/combat";

type CombatGroup<ID> = {
    specialists: Specialist[],
    originalShips: number,
    ships: number,
    isDefender: boolean,
    attackAgainst: Map<number, WeaponsDetail>,
    players: Player<ID>[],
    carriers: Carrier<ID>[],
    star: Star<ID> | undefined,
}

type CombatRoundState<ID> = {
    round: number,
    groups: CombatGroup<ID>[],
}

interface ISpecialistService {
    getByIdStar(id: number): Specialist | null;
    getByIdCarrier(id: number): Specialist | null;
}

// TODO: Track ship kills per player

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
        };
    }

    _weaponsAgainstGroup(game: Game<ID>, group: CombatGroup<ID>, otherGroup: CombatGroup<ID>, isCarrierToStarCombat: boolean): WeaponsDetail {
        // todo: infiltrator etc.

        if (group.star) {
            return this.technologyService.getStarEffectiveWeaponsLevel(game, group.players, group.star, group.carriers);
        } else if (isCarrierToStarCombat) { //C2S, one of the attackers
            return this.technologyService.getCarriersEffectiveWeaponsLevel(game, group.players, group.carriers, true, true, 'anyCarrier');
        } else { //C2C
            return this.technologyService.getCarriersEffectiveWeaponsLevel(game, group.players, group.carriers, false, false, 'anyCarrier');
        }
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

                const weps = this._weaponsAgainstGroup(game, group, otherGroup, isCarrierToStarCombat);
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
        const newGroups = oldState.groups.map((group, groupIdx) => {
            const incomingDamage = oldState.groups.reduce((dmg, otherGroup, otherGroupIdx) => {
                if (otherGroupIdx === groupIdx) {
                    return dmg;
                } else {
                    const dmgFromOther = otherGroup.attackAgainst.get(groupIdx)!;

                    return dmg + dmgFromOther.total;
                }
            }, 0);

            return {
                ...group,
                ships: group.ships - incomingDamage,
            };
        });


        return {
            round: oldState.round + 1,
            groups: newGroups,
        }
    }

    _makeResult(state: CombatRoundState<ID>): CombatResult<ID> {
        const groups: CombatResultGroup<ID>[] = state.groups.map((g) => {
            return {
                players: g.players,
                carriers: g.carriers,
                star: g.star,
                shipsBefore: g.originalShips,
                shipsAfter: g.ships,
                shipsLost: g.originalShips - g.ships,
                shipsNeededToWin: 0, // TODO
            };
        });

        return {
            groups,
        }
    }

    _combatLoop(initState: CombatRoundState<ID>): CombatResult<ID> {
        let state = initState;

        while (true) {
            // check for dead
            if (state.groups.find((g) => g.ships <= 0)) {
                break;
            }

            state = this._performCombatRound(state);
        }

        return this._makeResult(state);
    }

    computeStar(game: Game<ID>, star: Star<ID>, carriers: Carrier<ID>[]) {
        const playerIds = new Set<ID>([star.ownedByPlayerId!]);

        carriers.forEach((c) => playerIds.add(c.ownedByPlayerId!));

        const players = Array.from(playerIds, (p) => game.galaxy.players.find(pl => pl._id === p)!);

        const combatDiploGroups = this.combatGroupService.computeCombatGroups(game, players);

        const combatGroups = this._makeGroups(game, star, carriers, combatDiploGroups);

        return this._combatLoop({round: 0, groups: combatGroups});
    }

    computeCarrier(game: Game<ID>, carriers: Carrier<ID>[]) {
        const playerIds = new Set<ID>();

        carriers.forEach((c) => playerIds.add(c.ownedByPlayerId!));

        const players = Array.from(playerIds, (p) => game.galaxy.players.find(pl => pl._id === p)!);

        const combatDiploGroups = this.combatGroupService.computeCombatGroups(game, players);

        const combatGroups = this._makeGroups(game, undefined, carriers, combatDiploGroups);

        return this._combatLoop({round: 0, groups: combatGroups});
    }
}