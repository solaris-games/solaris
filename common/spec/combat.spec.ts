import { CombatService } from '../src/services/combat';
import type { CombatBaseCarrier, CombatBasePlayer, CombatBaseStar, CombatGroup } from '../src/types/common/combat';
import type { WeaponsDetail } from '../src/services/technology';

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
function makeAttackMap(targets: Array<[targetIdx: number, level: number]>): Map<number, WeaponsDetail> {
    const m = new Map<number, WeaponsDetail>();
    for (const [idx, level] of targets) {
        m.set(idx, makeWeaponsDetail(level));
    }
    return m;
}

type TestPlayer = CombatBasePlayer<string>;
type TestStar   = CombatBaseStar<string>;
type TestCarrier = CombatBaseCarrier<string>;
type TestGroup  = CombatGroup<string, TestPlayer, TestStar, TestCarrier>;

function makePlayer(id: string, weaponsLevel: number): TestPlayer {
    return { _id: id, research: { weapons: { level: weaponsLevel } } };
}

function makeCarrier(id: string, ownedByPlayerId: string, ships: number): TestCarrier {
    return { _id: id, ships, specialistId: null, specialistTargetedPlayers: [], ownedByPlayerId };
}

function makeStar(id: string, ownedByPlayerId: string, ships: number): TestStar {
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

describe('CombatService – computeBasic', () => {

    // -----------------------------------------------------------------------
    // Carrier-to-star (isCarrierToStarCombat = true)
    // -----------------------------------------------------------------------

    describe('carrier-to-star', () => {

        it('equal ships, equal weapons – defender wins by first-mover advantage', () => {
            // D=10 @ weps 1, A=10 @ weps 1.
            // Round 0 (defender first): D=10, A=9.
            // Rounds 1-9 (simultaneous, 1 dmg each side): D-=1, A-=1.
            // After round 9: D=1, A=0 → defender wins.
            const result = service.computeBasic(
                { ships: 10, weaponsLevel: 1 },
                { ships: 10, weaponsLevel: 1 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(1);
            expect(result.attacker.shipsAfter).toBe(0);
        });

        it('attacker overwhelming – attacker wins', () => {
            // D=10 @ weps 1, A=50 @ weps 1.
            // Round 0: D=10, A=49.
            // 10 more rounds simultaneous: D reaches 0, A still has 39.
            const result = service.computeBasic(
                { ships: 10, weaponsLevel: 1 },
                { ships: 50, weaponsLevel: 1 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(0);
            expect(result.attacker.shipsAfter).toBe(39);
        });

        it('defender overwhelming – defender wins', () => {
            // D=50 @ weps 1, A=10 @ weps 1.
            // Round 0: D=50, A=9.
            // 9 more rounds: D=41, A=0.
            const result = service.computeBasic(
                { ships: 50, weaponsLevel: 1 },
                { ships: 10, weaponsLevel: 1 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(41);
            expect(result.attacker.shipsAfter).toBe(0);
        });

        it('defender higher weapons – defender wins with ships to spare', () => {
            // D=10 @ weps 3, A=10 @ weps 1.
            // Round 0: D=10, A=7  (defender deals 3).
            // Round 1: D=9, A=4; Round 2: D=8, A=1; Round 3: D=7, A=0.
            const result = service.computeBasic(
                { ships: 10, weaponsLevel: 3 },
                { ships: 10, weaponsLevel: 1 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(7);
            expect(result.attacker.shipsAfter).toBe(0);
        });

        it('attacker higher weapons – attacker wins', () => {
            // D=10 @ weps 1, A=10 @ weps 3.
            // Round 0: D=10, A=9.
            // Round 1: D=7, A=8; Round 2: D=4, A=7; Round 3: D=1, A=6; Round 4: D=0, A=5.
            const result = service.computeBasic(
                { ships: 10, weaponsLevel: 1 },
                { ships: 10, weaponsLevel: 3 },
                true,
            );

            expect(result.defender.shipsAfter).toBe(0);
            expect(result.attacker.shipsAfter).toBe(5);
        });

        it('mutual destruction – both sides reach zero', () => {
            // D=1 @ weps 1, A=2 @ weps 1.
            // Round 0: D=1, A=1.  Round 1: D=0, A=0.
            const result = service.computeBasic(
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

    describe('carrier-to-carrier', () => {

        it('equal ships, equal weapons – mutual destruction (no first-mover)', () => {
            // Both deal 1 damage simultaneously each round.
            // After 10 rounds: both at 0.
            const result = service.computeBasic(
                { ships: 10, weaponsLevel: 1 },
                { ships: 10, weaponsLevel: 1 },
                false,
            );

            expect(result.defender.shipsAfter).toBe(0);
            expect(result.attacker.shipsAfter).toBe(0);
        });

        it('attacker has more ships – attacker wins', () => {
            // D=5 @ weps 1, A=10 @ weps 1.
            // After 5 rounds: D=0, A=5.
            const result = service.computeBasic(
                { ships: 5, weaponsLevel: 1 },
                { ships: 10, weaponsLevel: 1 },
                false,
            );

            expect(result.defender.shipsAfter).toBe(0);
            expect(result.attacker.shipsAfter).toBe(5);
        });

        it('defender has more ships – defender wins', () => {
            // D=10 @ weps 1, A=5 @ weps 1.
            // After 5 rounds: D=5, A=0.
            const result = service.computeBasic(
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

    it('shipsBefore equals the original ship count for both sides', () => {
        const result = service.computeBasic(
            { ships: 17, weaponsLevel: 2 },
            { ships: 11, weaponsLevel: 3 },
            true,
        );

        expect(result.defender.shipsBefore).toBe(17);
        expect(result.attacker.shipsBefore).toBe(11);
    });

    it('shipsLost = shipsBefore - shipsAfter for both sides', () => {
        const result = service.computeBasic(
            { ships: 20, weaponsLevel: 1 },
            { ships: 15, weaponsLevel: 2 },
            true,
        );

        expect(result.defender.shipsLost).toBe(result.defender.shipsBefore - result.defender.shipsAfter);
        expect(result.attacker.shipsLost).toBe(result.attacker.shipsBefore - result.attacker.shipsAfter);
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

describe('CombatService – computeGroups', () => {

    // -----------------------------------------------------------------------
    // Two-group scenarios – validates that computeGroups and computeBasic
    // agree when given equivalent setups.
    // -----------------------------------------------------------------------

    describe('two groups', () => {

        it('carrier-to-star: equal forces – defender wins by first-mover advantage', () => {
            // Mirrors computeBasic C-to-S equal-forces case.
            // G0 (star/defender, idx 0) attacks G1; G1 (attacker, idx 1) attacks G0.
            const star = makeStar('s0', 'p0', 10);
            const groups: TestGroup[] = [
                makeGroup('p0', 10, 1, true,  [[1, 1]], star),
                makeGroup('p1', 10, 1, false, [[0, 1]]),
            ];

            const result = service.computeGroups(groups, true);

            expect(result.groups[0].shipsAfter).toBe(1);
            expect(result.groups[1].shipsAfter).toBe(0);
        });

        it('carrier-to-carrier: equal forces – mutual destruction', () => {
            // Both groups attack each other simultaneously; equal damage per round.
            const groups: TestGroup[] = [
                makeGroup('p0', 10, 1, false, [[1, 1]]),
                makeGroup('p1', 10, 1, false, [[0, 1]]),
            ];

            const result = service.computeGroups(groups, false);

            expect(result.groups[0].shipsAfter).toBe(0);
            expect(result.groups[1].shipsAfter).toBe(0);
        });

        it('carrier-to-carrier: unequal ships – larger group wins', () => {
            // G0: 15 ships, G1: 7 ships, equal weapons.
            // After 7 rounds: G0=8, G1=0.
            const groups: TestGroup[] = [
                makeGroup('p0', 15, 1, false, [[1, 1]]),
                makeGroup('p1',  7, 1, false, [[0, 1]]),
            ];

            const result = service.computeGroups(groups, false);

            expect(result.groups[0].shipsAfter).toBe(8);
            expect(result.groups[1].shipsAfter).toBe(0);
        });

    });

    // -----------------------------------------------------------------------
    // Three-group scenarios
    // -----------------------------------------------------------------------

    describe('three groups', () => {

        it('carrier-to-carrier: one strong group outlasts two weaker groups', () => {
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
                makeGroup('p0', 10, 1, false, [[1, 1], [2, 1]]),
                makeGroup('p1',  5, 1, false, [[0, 1], [2, 1]]),
                makeGroup('p2',  5, 1, false, [[0, 1], [1, 1]]),
            ];

            const result = service.computeGroups(groups, false);

            expect(result.groups[0].shipsAfter).toBe(4);
            expect(result.groups[1].shipsAfter).toBe(0);
            expect(result.groups[2].shipsAfter).toBe(0);
        });

        it('carrier-to-star: two attackers vs defender – defender wins when its fleet is large enough', () => {
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
            const star = makeStar('s0', 'p0', 20);
            const groups: TestGroup[] = [
                makeGroup('p0', 20, 1, true,  [[1, 1], [2, 1]], star),
                makeGroup('p1', 10, 1, false, [[0, 1], [2, 1]]),
                makeGroup('p2', 10, 1, false, [[0, 1], [1, 1]]),
            ];

            const result = service.computeGroups(groups, true);

            expect(result.groups[0].shipsAfter).toBe(10);
            expect(result.groups[1].shipsAfter).toBe(0);
            expect(result.groups[2].shipsAfter).toBe(0);
        });

        it('carrier-to-star: two strong attackers eliminate the defender then destroy each other', () => {
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
            const star = makeStar('s0', 'p0', 10);
            const groups: TestGroup[] = [
                makeGroup('p0', 10, 1, true,  [[1, 1], [2, 1]], star),
                makeGroup('p1', 15, 1, false, [[0, 1], [2, 1]]),
                makeGroup('p2', 15, 1, false, [[0, 1], [1, 1]]),
            ];

            const result = service.computeGroups(groups, true);

            expect(result.groups[0].shipsAfter).toBe(0);
            expect(result.groups[1].shipsAfter).toBe(0);
            expect(result.groups[2].shipsAfter).toBe(0);
        });

        it('carrier-to-carrier: asymmetric weapons – high-weapons group wins despite fewer ships', () => {
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
                makeGroup('p0',  5, 3, false, [[1, 3], [2, 3]]),
                makeGroup('p1', 10, 1, false, [[0, 1], [2, 1]]),
                makeGroup('p2', 10, 1, false, [[0, 1], [1, 1]]),
            ];

            const result = service.computeGroups(groups, false);

            expect(result.groups[0].shipsAfter).toBe(0);
            expect(result.groups[1].shipsAfter).toBe(0);
            expect(result.groups[2].shipsAfter).toBe(0);
        });

    });

    // -----------------------------------------------------------------------
    // Result shape
    // -----------------------------------------------------------------------

    it('each result group records the correct shipsBefore', () => {
        const groups: TestGroup[] = [
            makeGroup('p0', 25, 1, false, [[1, 1]]),
            makeGroup('p1', 12, 1, false, [[0, 1]]),
        ];

        const result = service.computeGroups(groups, false);

        expect(result.groups[0].shipsBefore).toBe(25);
        expect(result.groups[1].shipsBefore).toBe(12);
    });

    it('shipsLost = shipsBefore - shipsAfter for every group', () => {
        const groups: TestGroup[] = [
            makeGroup('p0', 20, 2, false, [[1, 2], [2, 2]]),
            makeGroup('p1', 10, 1, false, [[0, 1], [2, 1]]),
            makeGroup('p2', 10, 1, false, [[0, 1], [1, 1]]),
        ];

        const result = service.computeGroups(groups, false);

        for (const g of result.groups) {
            expect(g.shipsLost).toBe(g.shipsBefore - g.shipsAfter);
        }
    });

});
