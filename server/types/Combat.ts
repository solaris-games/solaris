import { DBObjectId } from "./DBObjectId";
import { Specialist } from "./Specialist";

export interface Defender {
    ships: number;
    weaponsLevel: number;
};

export interface Attacker {
    ships: number;
    weaponsLevel: number;
};

export interface CombatPart {
    defender: number;
    attacker: number;
};

export interface CombatStar {
    _id: DBObjectId;
    ownedByPlayerId: DBObjectId | null;
    specialist: Specialist;
    before: number;
    lost: number;
    after: number;
};

export interface CombatCarrier {
    _id: DBObjectId;
    name: string;
    ownedByPlayerId: DBObjectId;
    specialist: Specialist;
    before: number | string;
    lost: number | string;
    after: number | string;
};

export interface CombatResultShips {
    weapons: CombatPart;
    before: CombatPart;
    after: CombatPart;
    lost: CombatPart;
    needed?: CombatPart | null;
};

export interface CombatResult extends CombatResultShips {
    star: CombatStar | null;
    carriers: CombatCarrier[];
};
