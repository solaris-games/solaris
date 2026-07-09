import { CombatService } from "../src/services/combat";
import type {
    CombatBaseCarrier,
    CombatBasePlayer,
    CombatBaseStar,
    CombatGroup,
} from "../src/types/common/combat";
import type { WeaponsDetail } from "../src/services/technology";

// ---------------------------------------------------------------------------
// Stub dependencies
// computeBasic and computeGroups operate on pre-built groups and never reach
// the technology or combatGroup services, so empty stubs suffice here.
// ---------------------------------------------------------------------------
// @ts-ignore
const service = new CombatService({}, {}, {});

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function makeWeaponsDetail(level: number): WeaponsDetail {
    return {
        total: level,
        weaponsLevel: level,
        weaponsBuff: 0,
        appliedBuffs: [],
    };
}

/** Build an attackAgainst map: each entry targets one group index at the given level. */
function makeAttackMap(
    targets: Array<[targetIdx: number, level: number]>,
): Map<number, WeaponsDetail> {
    const m = new Map<number, WeaponsDetail>();
    for (const [idx, level] of targets) {
        m.set(idx, makeWeaponsDetail(level));
    }
    return m;
}

type TestPlayer = CombatBasePlayer<string>;
type TestStar = CombatBaseStar<string>;
type TestCarrier = CombatBaseCarrier<string>;
type TestGroup = CombatGroup<string, TestPlayer, TestStar, TestCarrier>;

function makePlayer(id: string, weaponsLevel: number): TestPlayer {
    return { _id: id, research: { weapons: { level: weaponsLevel } } };
}

function makeCarrier(
    id: string,
    ownedByPlayerId: string,
    ships: number,
): TestCarrier {
    return {
        _id: id,
        ships,
        specialistId: null,
        specialistTargetedPlayers: [],
        ownedByPlayerId,
    };
}

function makeStar(
    id: string,
    ownedByPlayerId: string,
    ships: number,
): TestStar {
    return { _id: id, ships, specialistId: null, ownedByPlayerId };
}

/**
 * Construct a CombatGroup for use with computeGroups.
 *
 * @param id            Player / group identifier string
 * @param ships         Total ships in the group
 * @param isDefender    True if this group holds the contested star
 * @param attackTargets Pairs of [targetGroupIndex, weaponsLevel] this group fires at
 * @param star          Optional star belonging to this group (for carrier-to-star scenarios)
 */
function makeGroup(
    id: string,
    ships: number,
    weaponsLevel: number,
    isDefender: boolean,
    attackTargets: Array<[targetIdx: number, level: number]>,
    star?: TestStar,
): TestGroup {
    const player = makePlayer(id, weaponsLevel);
    const carrier = makeCarrier(`${id}-carrier`, id, ships);

    return {
        id,
        originalShips: ships,
        ships,
        isDefender,
        attackAgainst: makeAttackMap(attackTargets),
        players: [player],
        carriers: star ? [] : [carrier],
        star,
        shipsKilled: 0,
    };
}

// ---------------------------------------------------------------------------
// computeBasic
// ---------------------------------------------------------------------------
//
// computeBasic(defender, attacker, isCarrierToStarCombat) takes only ships and
// weaponsLevel for each side; it builds the combat groups internally.
//
// Carrier-to-star mechanics: the defender (star) fires first in round 0,
// giving it a one-round head start.  Both sides attack simultaneously every
// subsequent round.
//
// Carrier-to-carrier: both sides attack simultaneously from round 0 – no
// first-mover advantage, so equal forces result in mutual destruction.
//
// ---------------------------------------------------------------------------

describe("CombatService – computeBasic", () => {
    // -----------------------------------------------------------------------
    // Carrier-to-star (isCarrierToStarCombat = true)
    // -----------------------------------------------------------------------

    describe("carrier-to-star", () => {
        it("equal ships, equal weapons – defender wins by first-mover advantage", () => {
            // D=10 @ weps 1, A=10 @ weps 1.
            // Round 0 (defender first): D=10, A=9.
            // Rounds 1-9 (simultaneous, 1 dmg each side): D-=1, A-=1.
            // After round 9: D=1, A=0 → defender wins.
            const result = service.calculateBasic(
                { ships: 10, weaponsLevel: 1 },
                { ships: 10, weaponsLevel: 1 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(1);
            expect(result.attacker.shipsAfter).toBe(0);
        });

        it("attacker overwhelming – attacker wins", () => {
            // D=10 @ weps 1, A=50 @ weps 1.
            // Round 0: D=10, A=49.
            // 10 more rounds simultaneous: D reaches 0, A still has 39.
            const result = service.calculateBasic(
                { ships: 10, weaponsLevel: 1 },
                { ships: 50, weaponsLevel: 1 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(0);
            expect(result.attacker.shipsAfter).toBe(39);
        });

        it("defender overwhelming – defender wins", () => {
            // D=50 @ weps 1, A=10 @ weps 1.
            // Round 0: D=50, A=9.
            // 9 more rounds: D=41, A=0.
            const result = service.calculateBasic(
                { ships: 50, weaponsLevel: 1 },
                { ships: 10, weaponsLevel: 1 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(41);
            expect(result.attacker.shipsAfter).toBe(0);
        });

        it("defender higher weapons – defender wins with ships to spare", () => {
            // D=10 @ weps 3, A=10 @ weps 1.
            // Round 0: D=10, A=7  (defender deals 3).
            // Round 1: D=9, A=4; Round 2: D=8, A=1; Round 3: D=7, A=0.
            const result = service.calculateBasic(
                { ships: 10, weaponsLevel: 3 },
                { ships: 10, weaponsLevel: 1 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(7);
            expect(result.attacker.shipsAfter).toBe(0);
        });

        it("attacker higher weapons – attacker wins", () => {
            // D=10 @ weps 1, A=10 @ weps 3.
            // Round 0: D=10, A=9.
            // Round 1: D=7, A=8; Round 2: D=4, A=7; Round 3: D=1, A=6; Round 4: D=0, A=5.
            const result = service.calculateBasic(
                { ships: 10, weaponsLevel: 1 },
                { ships: 10, weaponsLevel: 3 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(0);
            expect(result.attacker.shipsAfter).toBe(5);
        });

        it("mutual destruction – both sides reach zero", () => {
            // D=1 @ weps 1, A=2 @ weps 1.
            // Round 0: D=1, A=1.  Round 1: D=0, A=0.
            const result = service.calculateBasic(
                { ships: 1, weaponsLevel: 1 },
                { ships: 2, weaponsLevel: 1 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(0);
            expect(result.attacker.shipsAfter).toBe(0);
        });
    });

    // -----------------------------------------------------------------------
    // Carrier-to-carrier (isCarrierToStarCombat = false)
    // -----------------------------------------------------------------------

    describe("carrier-to-carrier", () => {
        it("equal ships, equal weapons – mutual destruction (no first-mover)", () => {
            // Both deal 1 damage simultaneously each round.
            // After 10 rounds: both at 0.
            const result = service.calculateBasic(
                { ships: 10, weaponsLevel: 1 },
                { ships: 10, weaponsLevel: 1 },
                false,
            );

            expect(result.defender.shipsAfter).toBe(0);
            expect(result.attacker.shipsAfter).toBe(0);
        });

        it("attacker has more ships – attacker wins", () => {
            // D=5 @ weps 1, A=10 @ weps 1.
            // After 5 rounds: D=0, A=5.
            const result = service.calculateBasic(
                { ships: 5, weaponsLevel: 1 },
                { ships: 10, weaponsLevel: 1 },
                false,
            );

            expect(result.defender.shipsAfter).toBe(0);
            expect(result.attacker.shipsAfter).toBe(5);
        });

        it("defender has more ships – defender wins", () => {
            // D=10 @ weps 1, A=5 @ weps 1.
            // After 5 rounds: D=5, A=0.
            const result = service.calculateBasic(
                { ships: 10, weaponsLevel: 1 },
                { ships: 5, weaponsLevel: 1 },
                false,
            );

            expect(result.defender.shipsAfter).toBe(5);
            expect(result.attacker.shipsAfter).toBe(0);
        });
    });

    // -----------------------------------------------------------------------
    // shipsBefore consistency
    // -----------------------------------------------------------------------

    it("shipsBefore equals the original ship count for both sides", () => {
        const result = service.calculateBasic(
            { ships: 17, weaponsLevel: 2 },
            { ships: 11, weaponsLevel: 3 },
            true,
        );

        expect(result.defender.shipsBefore).toBe(17);
        expect(result.attacker.shipsBefore).toBe(11);
    });

    it("shipsLost = shipsBefore - shipsAfter for both sides", () => {
        const result = service.calculateBasic(
            { ships: 20, weaponsLevel: 1 },
            { ships: 15, weaponsLevel: 2 },
            true,
        );

        expect(result.defender.shipsLost).toBe(
            result.defender.shipsBefore - result.defender.shipsAfter,
        );
        expect(result.attacker.shipsLost).toBe(
            result.attacker.shipsBefore - result.attacker.shipsAfter,
        );
    });
});

// ---------------------------------------------------------------------------
// computeGroups
// ---------------------------------------------------------------------------
//
// computeGroups accepts fully-constructed CombatGroup objects whose
// attackAgainst maps are already populated.  This lets tests exercise
// multi-group (3+) scenarios and arbitrary weapons configurations that
// computeBasic cannot express.
//
// Group indices in attackAgainst correspond to positions in the groups array
// passed to computeGroups.
//
// ---------------------------------------------------------------------------

describe("CombatService – computeGroups", () => {
    // -----------------------------------------------------------------------
    // Two-group scenarios – validates that computeGroups and computeBasic
    // agree when given equivalent setups.
    // -----------------------------------------------------------------------

    describe("two groups", () => {
        it("carrier-to-star: equal forces – defender wins by first-mover advantage", () => {
            // Mirrors computeBasic C-to-S equal-forces case.
            // G0 (star/defender, idx 0) attacks G1; G1 (attacker, idx 1) attacks G0.
            const star = makeStar("s0", "p0", 10);
            const groups: TestGroup[] = [
                makeGroup("p0", 10, 1, true, [[1, 1]], star),
                makeGroup("p1", 10, 1, false, [[0, 1]]),
            ];

            const result = service.calculateGroups(groups, true);

            expect(result.groups[0].shipsAfter).toBe(1);
            expect(result.groups[1].shipsAfter).toBe(0);
        });

        it("carrier-to-carrier: equal forces – mutual destruction", () => {
            // Both groups attack each other simultaneously; equal damage per round.
            const groups: TestGroup[] = [
                makeGroup("p0", 10, 1, false, [[1, 1]]),
                makeGroup("p1", 10, 1, false, [[0, 1]]),
            ];

            const result = service.calculateGroups(groups, false);

            expect(result.groups[0].shipsAfter).toBe(0);
            expect(result.groups[1].shipsAfter).toBe(0);
        });

        it("carrier-to-carrier: unequal ships – larger group wins", () => {
            // G0: 15 ships, G1: 7 ships, equal weapons.
            // After 7 rounds: G0=8, G1=0.
            const groups: TestGroup[] = [
                makeGroup("p0", 15, 1, false, [[1, 1]]),
                makeGroup("p1", 7, 1, false, [[0, 1]]),
            ];

            const result = service.calculateGroups(groups, false);

            expect(result.groups[0].shipsAfter).toBe(8);
            expect(result.groups[1].shipsAfter).toBe(0);
        });
    });

    // -----------------------------------------------------------------------
    // Three-group scenarios
    // -----------------------------------------------------------------------

    describe("three groups", () => {
        it("carrier-to-carrier: one strong group outlasts two weaker groups", () => {
            // G0: 10 ships @ weps 1; G1: 5 ships @ weps 1; G2: 5 ships @ weps 1.
            // Every group attacks all others.
            //
            // Per round (simultaneous):
            //   G0 takes: min(G1,1) + min(G2,1) = 2
            //   G1 takes: min(G0,1) + min(G2,1) = 2
            //   G2 takes: min(G0,1) + min(G1,1) = 2
            //
            // Round 0: G0=8, G1=3, G2=3
            // Round 1: G0=6, G1=1, G2=1
            // Round 2: G0=4, G1=0, G2=0  → G0 wins.
            const groups: TestGroup[] = [
                makeGroup("p0", 10, 1, false, [
                    [1, 1],
                    [2, 1],
                ]),
                makeGroup("p1", 5, 1, false, [
                    [0, 1],
                    [2, 1],
                ]),
                makeGroup("p2", 5, 1, false, [
                    [0, 1],
                    [1, 1],
                ]),
            ];

            const result = service.calculateGroups(groups, false);

            expect(result.groups[0].shipsAfter).toBe(4);
            expect(result.groups[1].shipsAfter).toBe(0);
            expect(result.groups[2].shipsAfter).toBe(0);
        });

        it("carrier-to-star: two attackers vs defender – defender wins when its fleet is large enough", () => {
            // G0 (star, idx 0): 20 ships @ weps 1 – attacks both attackers.
            // G1 (attacker, idx 1): 10 ships @ weps 1 – attacks G0 and G2.
            // G2 (attacker, idx 2): 10 ships @ weps 1 – attacks G0 and G1.
            //
            // Round 0 (defender fires first):
            //   G0 attacks: G1 → 9, G2 → 9.  G0 takes 0.
            //
            // Rounds 1+ (simultaneous, each group deals 1 to each target):
            //   G0 takes 2/round; G1 and G2 each take 2/round.
            //
            // Round 1: G0=18, G1=7,  G2=7
            // Round 2: G0=16, G1=5,  G2=5
            // Round 3: G0=14, G1=3,  G2=3
            // Round 4: G0=12, G1=1,  G2=1
            // Round 5: G0=10, G1=0,  G2=0  → defender wins.
            const star = makeStar("s0", "p0", 20);
            const groups: TestGroup[] = [
                makeGroup(
                    "p0",
                    20,
                    1,
                    true,
                    [
                        [1, 1],
                        [2, 1],
                    ],
                    star,
                ),
                makeGroup("p1", 10, 1, false, [
                    [0, 1],
                    [2, 1],
                ]),
                makeGroup("p2", 10, 1, false, [
                    [0, 1],
                    [1, 1],
                ]),
            ];

            const result = service.calculateGroups(groups, true);

            expect(result.groups[0].shipsAfter).toBe(10);
            expect(result.groups[1].shipsAfter).toBe(0);
            expect(result.groups[2].shipsAfter).toBe(0);
        });

        it("carrier-to-star: two strong attackers eliminate the defender then destroy each other", () => {
            // G0 (star, idx 0): 10 ships @ weps 1.
            // G1 (attacker, idx 1): 15 ships @ weps 1.
            // G2 (attacker, idx 2): 15 ships @ weps 1.
            //
            // Round 0 (defender fires first):
            //   G0 attacks: G1 → 14, G2 → 14.  G0 takes 0.
            //
            // Rounds 1-5 (simultaneous, 2 dmg to G0; 2 dmg to each attacker):
            //   Round 1: G0=8,  G1=12, G2=12
            //   Round 2: G0=6,  G1=10, G2=10
            //   Round 3: G0=4,  G1=8,  G2=8
            //   Round 4: G0=2,  G1=6,  G2=6
            //   Round 5: G0=0,  G1=4,  G2=4  → defender eliminated.
            //
            // Rounds 6-9 (G0=0, G1 and G2 trade 1 dmg each round):
            //   Round 6: G1=3, G2=3
            //   Round 7: G1=2, G2=2
            //   Round 8: G1=1, G2=1
            //   Round 9: G1=0, G2=0  → mutual destruction.
            const star = makeStar("s0", "p0", 10);
            const groups: TestGroup[] = [
                makeGroup(
                    "p0",
                    10,
                    1,
                    true,
                    [
                        [1, 1],
                        [2, 1],
                    ],
                    star,
                ),
                makeGroup("p1", 15, 1, false, [
                    [0, 1],
                    [2, 1],
                ]),
                makeGroup("p2", 15, 1, false, [
                    [0, 1],
                    [1, 1],
                ]),
            ];

            const result = service.calculateGroups(groups, true);

            expect(result.groups[0].shipsAfter).toBe(0);
            expect(result.groups[1].shipsAfter).toBe(0);
            expect(result.groups[2].shipsAfter).toBe(0);
        });

        it("carrier-to-carrier: asymmetric weapons – high-weapons group wins despite fewer ships", () => {
            // G0: 5 ships @ weps 3; G1: 10 ships @ weps 1; G2: 10 ships @ weps 1.
            // G0 attacks {1: 3, 2: 3}; G1 attacks {0: 1, 2: 1}; G2 attacks {0: 1, 1: 1}.
            //
            // Per round:
            //   G0 takes: min(G1,1) + min(G2,1) = 2/round
            //   G1 takes: min(G0,3) + min(G2,1) = 3+1 = 4/round (while G0 alive)
            //   G2 takes: min(G0,3) + min(G1,1) = 3+1 = 4/round (while G0 alive)
            //
            // Round 0: G0=3, G1=6,  G2=6
            // Round 1: G0=1, G1=2,  G2=2
            // Round 2: G0=max(0,1-2)=0, G1=max(0,2-4)=0, G2=max(0,2-4)=0.
            //   (G0 takes 2; G1 takes min(1,3)+min(2,1)=3+1=4 → 0; G2 similarly → 0)
            //   All three reach zero simultaneously.
            const groups: TestGroup[] = [
                makeGroup("p0", 5, 3, false, [
                    [1, 3],
                    [2, 3],
                ]),
                makeGroup("p1", 10, 1, false, [
                    [0, 1],
                    [2, 1],
                ]),
                makeGroup("p2", 10, 1, false, [
                    [0, 1],
                    [1, 1],
                ]),
            ];

            const result = service.calculateGroups(groups, false);

            expect(result.groups[0].shipsAfter).toBe(0);
            expect(result.groups[1].shipsAfter).toBe(0);
            expect(result.groups[2].shipsAfter).toBe(0);
        });
    });

    // -----------------------------------------------------------------------
    // Result shape
    // -----------------------------------------------------------------------

    it("each result group records the correct shipsBefore", () => {
        const groups: TestGroup[] = [
            makeGroup("p0", 25, 1, false, [[1, 1]]),
            makeGroup("p1", 12, 1, false, [[0, 1]]),
        ];

        const result = service.calculateGroups(groups, false);

        expect(result.groups[0].shipsBefore).toBe(25);
        expect(result.groups[1].shipsBefore).toBe(12);
    });

    it("shipsLost = shipsBefore - shipsAfter for every group", () => {
        const groups: TestGroup[] = [
            makeGroup("p0", 20, 2, false, [
                [1, 2],
                [2, 2],
            ]),
            makeGroup("p1", 10, 1, false, [
                [0, 1],
                [2, 1],
            ]),
            makeGroup("p2", 10, 1, false, [
                [0, 1],
                [1, 1],
            ]),
        ];

        const result = service.calculateGroups(groups, false);

        for (const g of result.groups) {
            expect(g.shipsLost).toBe(g.shipsBefore - g.shipsAfter);
        }
    });

    // -----------------------------------------------------------------------
    // Multi-carrier damage distribution
    //
    // These tests exercise distributeDamage when a group has more than one
    // carrier, specifically the case where shipsLost is not evenly divisible
    // by the number of live carriers.  Without the Math.ceil fix the loop
    // hangs because Math.floor(shipsToKill / carriers) rounds down to 0 for
    // every carrier, so shipsToKill never decrements.
    // -----------------------------------------------------------------------

    it("multi-carrier group: odd shipsLost across two carriers does not hang", () => {
        // G0 has two carriers (1 ship each, 2 total); G1 has 3 ships.
        // C-to-C, simultaneous: G0 deals 1/round to G1, G1 deals 1/round to G0.
        // After round 1: G0 ships=1 (lost 1), G1 ships=2.
        // After round 2: G0 ships=0, G1 ships=1.
        // G0 loses 2 ships total across 2 carriers (1 each) – evenly divisible.
        // G1 loses 2 ships in its single carrier.
        // The interesting case is a prior round result where G0 loses 1 ship
        // across 2 carriers (shipsToKill=1, objectsToDeduct.length=2 → floor=0).
        const multiCarrierGroup: TestGroup = {
            id: "p0",
            originalShips: 2,
            ships: 2,
            isDefender: false,
            attackAgainst: makeAttackMap([[1, 1]]),
            players: [makePlayer("p0", 1)],
            carriers: [
                makeCarrier("p0-c1", "p0", 1),
                makeCarrier("p0-c2", "p0", 1),
            ],
            star: undefined,
            shipsKilled: 0,
        };
        const groups: TestGroup[] = [
            multiCarrierGroup,
            makeGroup("p1", 3, 1, false, [[0, 1]]),
        ];

        const result = service.calculateGroups(groups, false);

        // G1 wins: G0 is destroyed after 2 rounds, G1 has 1 ship left.
        expect(result.groups[0].shipsAfter).toBe(0);
        expect(result.groups[1].shipsAfter).toBe(1);
        // Total ships lost across G0's carriers must equal shipsLost.
        const g0 = result.groups[0];
        expect(g0.shipsLost).toBe(g0.shipsBefore - g0.shipsAfter);
    });

    it("multi-carrier group: shipsLost indivisible by three carriers does not hang", () => {
        // G0 has three carriers (2 ships each, 6 total); G1 has 8 ships.
        // G0 loses 2 ships per round; after 3 rounds G0 has 0 ships.
        // shipsLost=6, carriers=3 → evenly divides, but intermediate rounds
        // lose 2 ships across 3 carriers (floor(2/3)=0 per carrier without fix).
        const multiCarrierGroup: TestGroup = {
            id: "p0",
            originalShips: 6,
            ships: 6,
            isDefender: false,
            attackAgainst: makeAttackMap([[1, 2]]),
            players: [makePlayer("p0", 2)],
            carriers: [
                makeCarrier("p0-c1", "p0", 2),
                makeCarrier("p0-c2", "p0", 2),
                makeCarrier("p0-c3", "p0", 2),
            ],
            star: undefined,
            shipsKilled: 0,
        };
        const groups: TestGroup[] = [
            multiCarrierGroup,
            makeGroup("p1", 8, 1, false, [[0, 1]]),
        ];

        const result = service.calculateGroups(groups, false);

        // G0 wins with 2 ships remaining.
        expect(result.groups[0].shipsAfter).toBe(2);
        expect(result.groups[1].shipsAfter).toBe(0);
        // shipsLost consistency
        for (const g of result.groups) {
            expect(g.shipsLost).toBe(g.shipsBefore - g.shipsAfter);
        }
    });

    it("shipKill counts - does not over-credit or under-credit shipsKilled", () => {
        // This test is designed to catch the bug where each attacker gets credited
        // with min(rawDamage, targetActualKills), causing total credited kills to
        // exceed total ships actually lost.
        //
        // Initial:
        // G0: 5 ships, deals 0 damage
        // G1: 8 ships, deals 8 to G0 and 8 to G2
        // G2: 8 ships, deals 8 to G0 and 8 to G1
        //
        // Single simultaneous carrier-to-carrier round:
        // G0 takes 16 incoming damage but only has 5 ships -> loses 5
        // G1 takes 8 incoming damage -> loses 8
        // G2 takes 8 incoming damage -> loses 8
        //
        // All groups are dead after one round.
        //
        // Actual total ships lost = 5 + 8 + 8 = 21.
        //
        // Broken per-attacker cap behavior:
        // G1 gets min(8, 5) = 5 kills on G0, plus 8 kills on G2 = 13
        // G2 gets min(8, 5) = 5 kills on G0, plus 8 kills on G1 = 13
        // Total credited kills = 26, which is impossible.

        const groups: TestGroup[] = [
            makeGroup("p0", 5, 0, false, [
                [1, 0],
                [2, 0],
            ]),
            makeGroup("p1", 8, 8, false, [
                [0, 8],
                [2, 8],
            ]),
            makeGroup("p2", 8, 8, false, [
                [0, 8],
                [1, 8],
            ]),
        ];

        const result = service.calculateGroups(groups, false);

        expect(result.groups[0].shipsAfter).toBe(0);
        expect(result.groups[1].shipsAfter).toBe(0);
        expect(result.groups[2].shipsAfter).toBe(0);

        const totalShipsLost = result.groups.reduce(
            (sum, group) => sum + group.shipsLost,
            0,
        );

        const totalShipsKilled = result.groups.reduce(
            (sum, group) => sum + group.shipsKilled,
            0,
        );

        expect(totalShipsLost).toBe(21);
        expect(totalShipsKilled).toBe(totalShipsLost);
    });
});

describe("CombatService - shipsKilled", () => {
    type TestPlayer = {
        _id: string;
        research: {
            weapons: {
                level: number;
            };
        };
    };

    function makeWeaponsDetail(level: number): WeaponsDetail {
        return {
            total: level,
            weaponsLevel: level,
            weaponsBuff: 0,
            appliedBuffs: [],
        };
    }

    function makePlayer(id: string, weaponsLevel: number): TestPlayer {
        return {
            _id: id,
            research: {
                weapons: {
                    level: weaponsLevel,
                },
            },
        };
    }

    function makeGame(players: TestPlayer[]) {
        return {
            galaxy: {
                players,
            },
        } as any;
    }

    function makeStar(id: string, ownedByPlayerId: string, ships: number) {
        return {
            _id: id,
            ownedByPlayerId,
            ships,
            specialistId: null,
            specialistTargetedPlayers: [],
            isAsteroidField: false,
            homeStar: false,
        } as any;
    }

    function makeCarrier(id: string, ownedByPlayerId: string, ships: number) {
        return {
            _id: id,
            ownedByPlayerId,
            ships,
            specialistId: null,
            specialistTargetedPlayers: [],
        } as any;
    }

    function makeService() {
        const combatGroupService = {
            computeCombatGroups: jasmine
                .createSpy("computeCombatGroups")
                .and.callFake((_game: any, players: TestPlayer[]) => {
                    return {
                        groups: players.map((p) => [p]),
                    };
                }),
        };

        const technologyService = {
            getEffectiveWeaponsDetail: jasmine
                .createSpy("getEffectiveWeaponsDetail")
                .and.callFake((_game: any, group: any) => {
                    return makeWeaponsDetail(group.players[0].research.weapons.level);
                }),
        };

        const specialistService = {
            getByIdStar: jasmine.createSpy("getByIdStar").and.returnValue(null),
            getByIdCarrier: jasmine.createSpy("getByIdCarrier").and.returnValue(null),
        };

        return new CombatService(
            combatGroupService as any,
            technologyService as any,
            specialistService as any,
        );
    }

    function runComputeStarScenario(params: {
        starShips: number;
        carrierShips: number;
        defenderWeapons?: number;
        attackerWeapons?: number;
    }) {
        const defenderWeapons = params.defenderWeapons ?? 1;
        const attackerWeapons = params.attackerWeapons ?? 1;

        const defender = makePlayer("defender", defenderWeapons);
        const attacker = makePlayer("attacker", attackerWeapons);

        const game = makeGame([defender, attacker]);
        const star = makeStar("star", "defender", params.starShips);
        const carrier = makeCarrier("carrier", "attacker", params.carrierShips);

        const service = makeService();

        const callbackStates: any[] = [];

        const result = service.computeStar(
            game,
            star,
            [carrier],
            (state) => callbackStates.push(state),
        );

        expect(result).toBeDefined();

        const defenderGroup = result!.groups.find((g) => g.star)!;
        const attackerGroup = result!.groups.find((g) => g.carriers.length)!;

        return {
            result: result!,
            defenderGroup,
            attackerGroup,
            callbackStates,
        };
    }

    [
        {
            name: "equal 10v10 takes multiple rounds and defender first shot matters",
            starShips: 10,
            carrierShips: 10,
            expectedDefenderShipsAfter: 1,
            expectedAttackerShipsAfter: 0,
            expectedDefenderShipsKilled: 10,
            expectedAttackerShipsKilled: 9,
        },
        {
            name: "1v2 mutual destruction catches defender-first off-by-one",
            starShips: 1,
            carrierShips: 2,
            expectedDefenderShipsAfter: 0,
            expectedAttackerShipsAfter: 0,
            expectedDefenderShipsKilled: 2,
            expectedAttackerShipsKilled: 1,
        },
        {
            name: "10v50 attacker wins but defender still killed more than one round",
            starShips: 10,
            carrierShips: 50,
            expectedDefenderShipsAfter: 0,
            expectedAttackerShipsAfter: 39,
            expectedDefenderShipsKilled: 11,
            expectedAttackerShipsKilled: 10,
        },
        {
            name: "25v50 with 7v8 weapons caps final-round overkill",
            starShips: 25,
            carrierShips: 50,
            defenderWeapons: 7,
            attackerWeapons: 8,
            expectedDefenderShipsAfter: 0,
            expectedAttackerShipsAfter: 21,
            expectedDefenderShipsKilled: 29,
            expectedAttackerShipsKilled: 25,
        },
    ].forEach((tc) => {
        it(`shipsKilled counts - records total shipsKilled for computeStar: ${tc.name}`, () => {
            const { defenderGroup, attackerGroup, callbackStates } =
                runComputeStarScenario({
                    starShips: tc.starShips,
                    carrierShips: tc.carrierShips,
                    defenderWeapons: tc.defenderWeapons,
                    attackerWeapons: tc.attackerWeapons,
                });

            expect(callbackStates[callbackStates.length - 1].round).toBeGreaterThan(1);

            expect(defenderGroup.shipsAfter).toBe(tc.expectedDefenderShipsAfter);
            expect(attackerGroup.shipsAfter).toBe(tc.expectedAttackerShipsAfter);

            expect(defenderGroup.shipsKilled).toBe(tc.expectedDefenderShipsKilled);
            expect(attackerGroup.shipsKilled).toBe(tc.expectedAttackerShipsKilled);

            expect(defenderGroup.shipsKilled).toBe(attackerGroup.shipsLost);
            expect(attackerGroup.shipsKilled).toBe(defenderGroup.shipsLost);
        });
    });

    it("shipKill counts - assigns multiple leftover fractional kill credits when needed", () => {
        // This catches a bug where only one fractional leftover kill is assigned.
        //
        // Group 0 has 2 ships.
        // Groups 1, 2, and 3 each deal 1 damage to Group 0.
        //
        // Group 0 receives 3 raw damage but only loses 2 ships.
        //
        // Exact kill credit against Group 0:
        // Group 1: 1 / 3 * 2 = 0.666...
        // Group 2: 1 / 3 * 2 = 0.666...
        // Group 3: 1 / 3 * 2 = 0.666...
        //
        // Flooring gives:
        // 0 + 0 + 0 = 0
        //
        // There are 2 leftover kills to assign.
        // A broken "only assign one fractional kill" implementation would credit
        // only 1 kill for Group 0's 2 lost ships.

        const groups: TestGroup[] = [
            makeGroup("p0", 2, 0, false, [
                [1, 0],
                [2, 0],
                [3, 0],
            ]),
            makeGroup("p1", 1, 1, false, [
                [0, 1],
                [2, 1],
                [3, 1],
            ]),
            makeGroup("p2", 1, 1, false, [
                [0, 1],
                [1, 1],
                [3, 1],
            ]),
            makeGroup("p3", 1, 1, false, [
                [0, 1],
                [1, 1],
                [2, 1],
            ]),
        ];

        const result = service.calculateGroups(groups, false);

        result.groups.forEach((group) => {
            expect(group.shipsAfter).toBe(0);
        });

        const totalShipsLost = result.groups.reduce(
            (sum, group) => sum + group.shipsLost,
            0,
        );

        const totalShipsKilled = result.groups.reduce(
            (sum, group) => sum + group.shipsKilled,
            0,
        );

        expect(totalShipsLost).toBe(5);
        expect(totalShipsKilled).toBe(totalShipsLost);
    });
});