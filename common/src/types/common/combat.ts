import type {Player} from "./player";
import type {Carrier} from "./carrier";
import type {Star} from "./star";

export type CombatResultGroup<ID> = {
    players: Player<ID>[],
    carriers: Carrier<ID>[],
    star: Star<ID> | undefined,
    shipsBefore: number,
    shipsAfter: number,
    shipsLost: number,
    shipsNeededToWin: number,
}

export type CombatResult<ID> = {
    groups: CombatResultGroup<ID>[],
}