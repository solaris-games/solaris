import type { Specialist } from "./specialist";

export interface Defender {
    ships: number;
    weaponsLevel: number;
};

export interface Attacker {
    ships: number;
    weaponsLevel: number;
};

export interface CombatWeapons {
    defender: number;
    defenderBase: number;
    attacker: number;
    attackerBase: number;
};

export interface CombatPart {
    defender: number;
    attacker: number;
};

export interface CombatStar<ID> {
    _id: ID;
    ownedByPlayerId: ID | null;
    specialist: Specialist | null;
    before: number;
    lost: number;
    after: number;
    scrambled: boolean;
};

export interface CombatCarrier<ID> {
    _id: ID;
    name: string;
    ownedByPlayerId: ID;
    specialist: Specialist | null;
    before: number | string;
    lost: number | string;
    after: number | string;
    scrambled: boolean;
};

export interface CombatResultShips {
    weapons: CombatWeapons;
    before: CombatPart;
    after: CombatPart;
    lost: CombatPart;
    needed?: CombatPart | null;
};

export interface CombatResult<ID> extends CombatResultShips {
    star: CombatStar<ID> | null;
    carriers: CombatCarrier<ID>[];
};
