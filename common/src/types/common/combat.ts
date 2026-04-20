import type {WeaponsDetail} from "../../services/technology";

export interface CombatBaseStar<ID> {
    _id: ID;
    ships: number | null; // annoying, but for weird compat reasons
    specialistId: number | null;
    ownedByPlayerId: ID | null;
}

export interface CombatBaseCarrier<ID> {
    _id: ID;
    ships: number | null; // annoying, but for weird compat reasons
    specialistId: number | null;
    ownedByPlayerId: ID | null;
}

export interface CombatBasePlayer<ID> {
    _id: ID;
    research: {
        weapons: {
            level: number;
        }
    }
}

export type CombatResultGrouped<ID, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>> = {
    players: P[],
    carriers: C[],
    star: S | undefined,
    shipsKilled: number,
    shipsBefore: number,
    shipsAfter: number,
    shipsLost: number,
}

export type CombatResultCarrier<ID, C extends CombatBaseCarrier<ID>> = {
    carrier: C,
    shipsBefore: number,
    shipsAfter: number,
    shipsLost: number,
}

export type CombatResultStar<ID, S extends CombatBaseStar<ID>> = {
    star: S,
    shipsBefore: number,
    shipsAfter: number,
    shipsLost: number,
}

export type CombatResultGroup<ID, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>> = {
    players: P[],
    carriers: CombatResultCarrier<ID, C>[],
    star: CombatResultStar<ID, S> | undefined,
    shipsBefore: number,
    shipsAfter: number,
    shipsLost: number,
    shipsKilled: number,
    carriersKilled: number,
    carriersLost: number,
    specialistsKilled: number,
    specialistsLost: number,
}

export type GroupedCombatResult<ID, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>> = {
    groups: CombatResultGrouped<ID, P, S, C>[],
}

export type CombatResult<ID, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>> = {
    groups: CombatResultGroup<ID, P, S, C>[],
}

export type CombatGroup<ID, P extends CombatBasePlayer<ID>, S extends CombatBaseStar<ID>, C extends CombatBaseCarrier<ID>> = {
    originalShips: number,
    ships: number,
    isDefender: boolean,
    attackAgainst: Map<number, WeaponsDetail>,
    players: P[],
    carriers: C[],
    star: S | undefined,
    shipsKilled: number,
}
