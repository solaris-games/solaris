import type { WeaponsDetail } from "../../services/technology";
import type { StarCaptureResult } from "./star";

export interface CombatBaseStar<ID> {
    _id: ID;
    ships: number | null; // annoying, but for weird compat reasons
    specialistId: number | null;
    ownedByPlayerId: ID | null;
    isAsteroidField: boolean;
    homeStar: boolean;
}

export interface CombatBaseCarrier<ID> {
    _id: ID;
    ships: number | null; // annoying, but for weird compat reasons
    specialistId: number | null;
    specialistTargetedPlayers: ID[];
    ownedByPlayerId: ID | null;
}

export interface CombatBasePlayer<ID> {
    _id: ID;
    research: {
        weapons: {
            level: number;
        };
    };
}

export type CombatGroup<
    ID,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
> = {
    id: string;
    originalShips: number;
    ships: number;
    isDefender: boolean;
    attackAgainst: Map<number, WeaponsDetail>;
    players: P[];
    carriers: C[];
    star: S | undefined;
    shipsKilled: number;
};

export interface DetailedCombatResultObject {
    shipsBefore: number;
    shipsAfter: number;
    shipsLost: number;
}

export interface DetailedCombatResultCarrier<
    ID,
    C extends CombatBaseCarrier<ID>,
> extends DetailedCombatResultObject {
    carrier: C;
}

export interface DetailedCombatResultStar<
    ID,
    S extends CombatBaseStar<ID>,
> extends DetailedCombatResultObject {
    star: S;
}

export type DetailedCombatResultGroup<
    ID,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
> = {
    id: string;
    players: P[];
    carriers: DetailedCombatResultCarrier<ID, C>[];
    star: DetailedCombatResultStar<ID, S> | undefined;
    attackAgainst: Record<string, WeaponsDetail>;
    shipsBefore: number;
    shipsAfter: number;
    shipsLost: number;
    shipsKilled: number;
    carriersKilled: number;
    carriersLost: number;
    specialistsKilled: number;
    specialistsLost: number;
};

export type DetailedCombatResult<
    ID,
    P extends CombatBasePlayer<ID>,
    S extends CombatBaseStar<ID>,
    C extends CombatBaseCarrier<ID>,
> = {
    groups: DetailedCombatResultGroup<ID, P, S, C>[];
    combatGroups: CombatGroup<ID, P, S, C>[];
    isCarrierToStarCombat: boolean;
};

// Suitable for events etc.
export type CombatResultCarrier<ID> = {
    carrierId: ID;
    specialistId: number | null;
    carrierName: string;
    ownedByPlayerId: ID;
    hasScrambler: boolean;
    shipsBefore: number | "???";
    shipsAfter: number | "???";
    shipsLost: number | "???";
};

export type CombatResultStar<ID> = {
    starId: ID;
    specialistId: number | null;
    starName: string;
    ownedByPlayerId: ID;
    hasScrambler: boolean;
    shipsBefore: number | "???";
    shipsAfter: number | "???";
    shipsLost: number | "???";
    captureResult: StarCaptureResult<ID> | null;
};

export type CombatResultGroup<ID> = {
    playerIds: ID[];
    carriers: CombatResultCarrier<ID>[];
    star: CombatResultStar<ID> | undefined;
    attackAgainst: Record<number, WeaponsDetail>; // using a record here because it needs to be stored in MongoDB
    shipsBefore: number | "???";
    shipsAfter: number | "???";
    shipsLost: number | "???";
};

export type CombatResult<ID> = {
    groups: CombatResultGroup<ID>[];
};

// For combat calculator etc
export type BasicCombatResult = {
    defender: {
        shipsBefore: number;
        shipsAfter: number;
        shipsLost: number;
        shipsNeeded: number;
    };
    attacker: {
        shipsBefore: number;
        shipsAfter: number;
        shipsLost: number;
        shipsNeeded: number;
    };
};
