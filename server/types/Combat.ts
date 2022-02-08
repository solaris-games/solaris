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

export interface CombatResult {
    weapons: CombatPart;
    before: CombatPart;
    after: CombatPart;
    lost: CombatPart;
    needed?: CombatPart | null;
};
