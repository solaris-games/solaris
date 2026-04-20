import type {Player} from "./player";
import type {Carrier} from "./carrier";
import type {Star} from "./star";
import type {Specialist} from "./specialist";
import type {WeaponsDetail} from "../../services/technology";

export type CombatResultGrouped<ID> = {
    players: Player<ID>[],
    carriers: Carrier<ID>[],
    star: Star<ID> | undefined,
    shipsKilled: number,
    shipsBefore: number,
    shipsAfter: number,
    shipsLost: number,
}

export type CombatResultCarrier<ID> = {
    carrier: Carrier<ID>,
    shipsBefore: number,
    shipsAfter: number,
    shipsLost: number,
}

export type CombatResultStar<ID> = {
    star: Star<ID>,
    shipsBefore: number,
    shipsAfter: number,
    shipsLost: number,
}

export type CombatResultGroup<ID> = {
    players: Player<ID>[],
    carriers: CombatResultCarrier<ID>[],
    star: CombatResultStar<ID> | undefined,
    shipsBefore: number,
    shipsAfter: number,
    shipsLost: number,
    shipsKilled: number,
    carriersKilled: number,
    carriersLost: number,
    specialistsKilled: number,
    specialistsLost: number,
}

export type GroupedCombatResult<ID> = {
    groups: CombatResultGrouped<ID>[],
}

export type CombatResult<ID> = {
    groups: CombatResultGroup<ID>[],
}

export type CombatGroup<ID> = {
    specialists: Specialist[],
    originalShips: number,
    ships: number,
    isDefender: boolean,
    attackAgainst: Map<number, WeaponsDetail>,
    players: Player<ID>[],
    carriers: Carrier<ID>[],
    star: Star<ID> | undefined,
    shipsKilled: number,
}
