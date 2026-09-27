import { CombatService } from "../../src/services/combat";
import { CombatGroupService } from "../../src/services/combatGroup";
import { TechnologyService } from "../../src/services/technology";
import type {
    CombatBaseCarrier,
    CombatBasePlayer,
    CombatBaseStar,
    CombatGroup,
    DetailedCombatResult,
    DetailedCombatResultGroup,
} from "../../src/types/common/combat";
import type { Game } from "../../src/types/common/game";
import type { WeaponsDetail } from "../../src/services/technology";
import { ValidationError } from "../../src/validation/error";

/**
 * Accuracy tests for the combat estimator (estimateNeeded) in
 * common/src/services/combat.ts.
 *
 * The estimate machinery is exercised through the public API
 * (calculateBasic, calculateGroups, computeStar, computeCarrier) and
 * validated against the actual combat simulation:
 *
 *  1. Validity   - running the simulation with the estimated ship count
 *                  must satisfy the requested termination condition
 *                  ("greaterThanZeroShips" / "eliminateOtherGroups").
 *  2. Minimality - running the simulation with one ship less must NOT
 *                  satisfy the termination condition.
 *  3. Truth      - for a sampled subset, the estimate must equal the
 *                  brute-force minimal ship count found by scanning.
 *
 * Semantics note: the estimate answers "how many ships would this side have
 * needed so that a fresh fight at that size meets the termination
 * condition". Only cases where the condition is not already satisfied by
 * the group's current strength get strict minimal-count checks.
 */

const specialistService = {
    getByIdStar: (_id: number) => null,
    getByIdCarrier: (_id: number) => null,
};

const techService = new TechnologyService(
    specialistService as any,
    { isCapitalStarEliminationMode: () => false } as any,
);

const combatGroupService = new CombatGroupService({
    isFormalAlliancesEnabled: () => false,
    isDiplomaticStatusToPlayersAllied: () => false,
} as any);

// fakes are deliberately partial; the real services only need these members here
const service = new CombatService(
    combatGroupService,
    techService,
    specialistService,
);

type TestPlayer = CombatBasePlayer<string>;
type TestStar = CombatBaseStar<string>;
type TestCarrier = CombatBaseCarrier<string>;
type TestGroup = CombatGroup<string, TestPlayer, TestStar, TestCarrier>;
type TestDetailedGroup = DetailedCombatResultGroup<
    string,
    TestPlayer,
    TestStar,
    TestCarrier
>;

interface SideSpec {
    ships: number;
    weapons: number;
}

type TerminationCondition = "greaterThanZeroShips" | "eliminateOtherGroups";

const fakeGame = (defenderBonus: boolean) =>
    ({
        settings: {
            specialGalaxy: {
                defenderBonus: defenderBonus ? "enabled" : "disabled",
            },
        },
        constants: { star: { homeStarDefenderBonusMultiplier: 1 } },
    }) as unknown as Game<string>;

const fakeWiringGame = (defenderBonus: boolean, playerCount: number) =>
    ({
        settings: {
            specialGalaxy: {
                defenderBonus: defenderBonus ? "enabled" : "disabled",
            },
        },
        constants: { star: { homeStarDefenderBonusMultiplier: 1 } },
        galaxy: {
            players: Array.from({ length: playerCount }, (_, i) => ({
                _id: `p${i}`,
                research: { weapons: { level: 1 + ((i * 2) % 7) } },
            })),
        },
    }) as unknown as Game<string>;

function cloneGroups(groups: TestGroup[]): TestGroup[] {
    return groups.map((g) => ({
        ...g,
        attackAgainst: new Map(
            Array.from(g.attackAgainst).map(([k, v]) => [k, { ...v }]),
        ),
        players: g.players.map((p) => ({
            ...p,
            research: { ...p.research },
        })),
        carriers: g.carriers.map((c) => ({ ...c })),
        star: g.star ? { ...g.star } : undefined,
    }));
}

/**
 * Builds two opposing combat groups in the same shape calculateBasic uses
 * (proxy game so TechnologyService.getDefenderBonus works) and populates
 * attackAgainst via the real computeGroupWeapons.
 */
function setupGroups(
    defender: SideSpec,
    attacker: SideSpec,
    isCarrierToStarCombat: boolean,
    includeDefenderBonus: boolean,
): TestGroup[] {
    const mkCarrier = (
        id: string,
        ships: number,
    ): CombatBaseCarrier<string> => ({
        _id: `${id}Carrier`,
        ships,
        specialistId: null,
        ownedByPlayerId: id,
        specialistTargetedPlayers: [],
    });
    const mkPlayer = (
        id: string,
        weapons: number,
    ): CombatBasePlayer<string> => ({
        _id: id,
        research: { weapons: { level: weapons } },
    });

    const defenderGroup: TestGroup = {
        id: "defender",
        players: [mkPlayer("defender", defender.weapons)],
        originalShips: defender.ships,
        ships: defender.ships,
        isDefender: isCarrierToStarCombat,
        carriers: isCarrierToStarCombat
            ? []
            : [mkCarrier("defender", defender.ships)],
        star: isCarrierToStarCombat
            ? {
                  _id: "star",
                  ships: defender.ships,
                  specialistId: null,
                  ownedByPlayerId: "defender",
                  homeStar: false,
                  isAsteroidField: false,
              }
            : undefined,
        shipsKilled: 0,
        attackAgainst: new Map<number, WeaponsDetail>(),
    };

    const attackerGroup: TestGroup = {
        id: "attacker",
        players: [mkPlayer("attacker", attacker.weapons)],
        originalShips: attacker.ships,
        ships: attacker.ships,
        isDefender: false,
        carriers: [mkCarrier("attacker", attacker.ships)],
        star: undefined,
        shipsKilled: 0,
        attackAgainst: new Map<number, WeaponsDetail>(),
    };

    const groups = [defenderGroup, attackerGroup];

    service.computeGroupWeapons(
        fakeGame(includeDefenderBonus),
        groups,
        isCarrierToStarCombat,
    );

    return groups;
}

function setGroupShips(group: TestGroup, ships: number): void {
    const delta = ships - group.originalShips;
    group.originalShips = ships;
    group.ships = ships;

    if (group.star) {
        group.star.ships = (group.star.ships || 0) + delta;
    } else if (group.carriers.length) {
        group.carriers[0].ships = (group.carriers[0].ships || 0) + delta;
    }
}

/** Runs a fresh simulation with `targetGroupId` set to `ships` ships. */
function simulate(
    resultGroups: TestGroup[],
    targetGroupId: string,
    ships: number,
    isCarrierToStarCombat: boolean,
): TestDetailedGroup[] {
    const modified = cloneGroups(resultGroups).map((g) => {
        if (g.id === targetGroupId) {
            setGroupShips(g, ships);
        }
        return g;
    });

    return service.calculateGroups(modified, isCarrierToStarCombat).groups;
}

function isConditionMet(
    simGroups: TestDetailedGroup[],
    targetGroupId: string,
    terminationCondition: TerminationCondition,
): boolean {
    const target = simGroups.find((g) => g.id === targetGroupId)!;
    const others = simGroups.filter((g) => g.id !== targetGroupId);

    if (terminationCondition === "greaterThanZeroShips") {
        return target.shipsAfter > 0;
    }

    return others.every((o) => !o.shipsAfter);
}

function findDetailedGroup(
    result: { groups: TestDetailedGroup[] },
    id: string,
): TestDetailedGroup {
    const group = result.groups.find((g) => g.id === id);
    if (!group) {
        throw new Error(`Group ${id} not found in combat result`);
    }
    return group;
}

const bruteForceMax = 480;

function bruteForceEstimate(
    resultGroups: TestGroup[],
    targetGroupId: string,
    terminationCondition: TerminationCondition,
    isCarrierToStarCombat: boolean,
): number | undefined {
    for (let ships = 0; ships <= bruteForceMax; ships++) {
        const sim = simulate(
            resultGroups,
            targetGroupId,
            ships,
            isCarrierToStarCombat,
        );

        if (isConditionMet(sim, targetGroupId, terminationCondition)) {
            return ships;
        }
    }

    return undefined;
}

interface Mismatch {
    params: string;
    kind: string;
    detail: string;
}

let report: Mismatch[] = [];

function describeParams(state: {
    isCarrierToStarCombat: boolean;
    includeDefenderBonus: boolean;
    defender: SideSpec;
    attacker: SideSpec;
}): string {
    return `carrierToStar=${state.isCarrierToStarCombat} defenderBonus=${state.includeDefenderBonus} defender=${state.defender.ships}ships/w${state.defender.weapons} attacker=${state.attacker.ships}ships/w${state.attacker.weapons}`;
}

/**
 * One check step: validates a single (side, termination condition) estimate
 * produced by the engine. Strict checks (validity / minimality / truth) are
 * skipped when the condition is already satisfied by the group's current
 * strength, since the estimator only answers the "flip the result" question
 * meaningfully in that case.
 */
function checkEstimate(
    params: string,
    resultGroups: TestGroup[],
    originalResult: { groups: TestDetailedGroup[] },
    targetGroupId: string,
    terminationCondition: TerminationCondition,
    isCarrierToStarCombat: boolean,
    compareTruth: boolean,
): void {
    const targetResultGroup = findDetailedGroup(originalResult, targetGroupId);

    let estimate: number;

    try {
        estimate = service.estimateNeeded(
            originalResult as any,
            targetResultGroup,
            terminationCondition,
        );
    } catch (e) {
        report.push({
            params,
            kind: "throw",
            detail: `estimateNeeded threw: ${(e as Error).message}`,
        });
        return;
    }

    if (
        typeof estimate !== "number" ||
        !Number.isFinite(estimate) ||
        estimate < 0
    ) {
        report.push({
            params,
            kind: "type",
            detail: `${targetGroupId} ${terminationCondition} estimate is not a valid number: ${String(estimate)}`,
        });
        return;
    }

    const alreadySatisfied = isConditionMet(
        simulate(
            resultGroups,
            targetGroupId,
            targetResultGroup.shipsAfter,
            isCarrierToStarCombat,
        ),
        targetGroupId,
        terminationCondition,
    );

    if (alreadySatisfied) {
        // estimator only answers "ships to flip the result"; nothing to verify
        return;
    }

    const met = isConditionMet(
        simulate(resultGroups, targetGroupId, estimate, isCarrierToStarCombat),
        targetGroupId,
        terminationCondition,
    );

    if (!met) {
        report.push({
            params,
            kind: "validity",
            detail: `${targetGroupId} ${terminationCondition} estimate ${estimate} does not satisfy the condition`,
        });
    }

    if (estimate > 0) {
        const metBelow = isConditionMet(
            simulate(
                resultGroups,
                targetGroupId,
                estimate - 1,
                isCarrierToStarCombat,
            ),
            targetGroupId,
            terminationCondition,
        );

        if (metBelow) {
            report.push({
                params,
                kind: "minimality",
                detail: `${targetGroupId} ${terminationCondition} estimate ${estimate} is not minimal: ${estimate - 1} also satisfies the condition`,
            });
        }
    }

    if (compareTruth) {
        const truth = bruteForceEstimate(
            resultGroups,
            targetGroupId,
            terminationCondition,
            isCarrierToStarCombat,
        );

        if (estimate !== truth) {
            report.push({
                params,
                kind: "truth",
                detail: `${targetGroupId} ${terminationCondition} estimate ${estimate} != brute-force minimum ${truth}`,
            });
        }
    }
}

/** Full accuracy check for one grid case: both sides, both conditions. */
function checkCase(
    isCarrierToStarCombat: boolean,
    includeDefenderBonus: boolean,
    defender: SideSpec,
    attacker: SideSpec,
    compareTruth: boolean,
): void {
    const params = describeParams({
        isCarrierToStarCombat,
        includeDefenderBonus,
        defender,
        attacker,
    });

    const resultGroups = setupGroups(
        defender,
        attacker,
        isCarrierToStarCombat,
        includeDefenderBonus,
    );

    const originalResult = service.calculateGroups(
        cloneGroups(resultGroups),
        isCarrierToStarCombat,
    );

    for (const targetGroupId of ["defender", "attacker"]) {
        for (const terminationCondition of [
            "greaterThanZeroShips",
            "eliminateOtherGroups",
        ] as const) {
            checkEstimate(
                params,
                resultGroups,
                originalResult,
                targetGroupId,
                terminationCondition,
                isCarrierToStarCombat,
                compareTruth,
            );
        }
    }
}

describe("combat estimates", () => {
    beforeEach(() => {
        report = [];
    });

    const weaponsPairs: [number, number][] = [
        [1, 1],
        [2, 1],
        [1, 2],
        [3, 3],
        [4, 2],
        [2, 4],
        [5, 1],
        [1, 5],
        [6, 6],
        [8, 1],
        [1, 8],
        [8, 8],
    ];
    const shipCounts = [0, 1, 2, 3, 4, 6, 8, 10, 12, 15, 20, 30, 40];

    const runGrid = (
        isCarrierToStarCombat: boolean,
        includeDefenderBonus: boolean,
    ): void => {
        for (const dShips of shipCounts) {
            for (const aShips of shipCounts) {
                for (const [dWeapons, aWeapons] of weaponsPairs) {
                    checkCase(
                        isCarrierToStarCombat,
                        includeDefenderBonus,
                        { ships: dShips, weapons: dWeapons },
                        { ships: aShips, weapons: aWeapons },
                        false,
                    );
                }
            }
        }
    };

    it("carrier-to-star estimates (defender bonus off)", () => {
        runGrid(true, false);

        expect(report).toEqual([]);
    });

    it("carrier-to-star estimates (defender bonus on)", () => {
        runGrid(true, true);

        expect(report).toEqual([]);
    });

    it("carrier-to-carrier estimates (defender bonus off)", () => {
        runGrid(false, false);

        expect(report).toEqual([]);
    });

    it("carrier-to-carrier estimates (defender bonus on)", () => {
        runGrid(false, true);

        expect(report).toEqual([]);
    });

    it("estimates equal the brute-force minimal ship count (sampled)", () => {
        const shipRange = [0, 3, 6, 9, 12, 15, 20, 25, 30, 40];
        const sampledWeapons: [number, number][] = [
            [1, 1],
            [2, 1],
            [1, 3],
            [4, 2],
            [6, 6],
            [8, 8],
        ];

        for (const isCarrierToStarCombat of [true, false]) {
            for (const includeDefenderBonus of [true, false]) {
                for (const dShips of shipRange) {
                    for (const aShips of shipRange) {
                        for (const [dW, aW] of sampledWeapons) {
                            checkCase(
                                isCarrierToStarCombat,
                                includeDefenderBonus,
                                { ships: dShips, weapons: dW },
                                { ships: aShips, weapons: aW },
                                true,
                            );
                        }
                    }
                }
            }
        }

        expect(report).toEqual([]);
    });

    it("0-ship corners return well-formed estimates without crashing", () => {
        for (const isCarrierToStarCombat of [true, false]) {
            for (const includeDefenderBonus of [true, false]) {
                // both sides 0 ships
                checkCase(
                    isCarrierToStarCombat,
                    includeDefenderBonus,
                    { ships: 0, weapons: 2 },
                    { ships: 0, weapons: 2 },
                    false,
                );

                // only defender 0 ships
                checkCase(
                    isCarrierToStarCombat,
                    includeDefenderBonus,
                    { ships: 0, weapons: 2 },
                    { ships: 10, weapons: 2 },
                    false,
                );

                // only attacker 0 ships
                checkCase(
                    isCarrierToStarCombat,
                    includeDefenderBonus,
                    { ships: 10, weapons: 2 },
                    { ships: 0, weapons: 2 },
                    false,
                );
            }
        }

        expect(report).toEqual([]);
    });

    it("calculateBasic ship bookkeeping is consistent", () => {
        const sample: {
            defender: SideSpec;
            attacker: SideSpec;
        }[] = [];

        for (const [dW, aW] of [
            [1, 3],
            [3, 1],
            [2, 2],
            [5, 5],
            [8, 1],
            [1, 8],
        ] as [number, number][]) {
            for (let dShips = 0; dShips <= 40; dShips += 4) {
                for (let aShips = 0; aShips <= 40; aShips += 4) {
                    for (const isC2S of [true, false]) {
                        for (const bonus of [true, false]) {
                            const result = service.calculateBasic(
                                { ships: dShips, weaponsLevel: dW },
                                { ships: aShips, weaponsLevel: aW },
                                isC2S,
                                bonus,
                            );

                            for (const side of [
                                "defender",
                                "attacker",
                            ] as const) {
                                const s = result[side];

                                if (
                                    s.shipsBefore !==
                                    s.shipsAfter + s.shipsLost
                                ) {
                                    report.push({
                                        params: describeParams({
                                            isCarrierToStarCombat: isC2S,
                                            includeDefenderBonus: bonus,
                                            defender: {
                                                ships: dShips,
                                                weapons: dW,
                                            },
                                            attacker: {
                                                ships: aShips,
                                                weapons: aW,
                                            },
                                        }),
                                        kind: "bookkeeping",
                                        detail: `${side}: shipsBefore ${s.shipsBefore} != shipsAfter ${s.shipsAfter} + shipsLost ${s.shipsLost}`,
                                    });
                                }

                                if (s.shipsNeeded !== undefined) {
                                    if (
                                        typeof s.shipsNeeded !== "number" ||
                                        !Number.isFinite(s.shipsNeeded) ||
                                        s.shipsNeeded < 0
                                    ) {
                                        report.push({
                                            params: describeParams({
                                                isCarrierToStarCombat: isC2S,
                                                includeDefenderBonus: bonus,
                                                defender: {
                                                    ships: dShips,
                                                    weapons: dW,
                                                },
                                                attacker: {
                                                    ships: aShips,
                                                    weapons: aW,
                                                },
                                            }),
                                            kind: "bookkeeping",
                                            detail: `${side} shipsNeeded is not a valid number: ${String(s.shipsNeeded)}`,
                                        });
                                    }
                                }
                            }
                        }
                    }
                    sample.push({
                        defender: { ships: dShips, weapons: dW },
                        attacker: { ships: aShips, weapons: aW },
                    });
                }
            }
        }

        expect(report).toEqual([]);
        expect(sample.length).toBeGreaterThan(0);
    });

    it("calculateBasic shipsNeeded matches an independent estimateNeeded run", () => {
        let matches = 0;

        for (const isC2S of [true, false]) {
            for (const bonus of [true, false]) {
                for (const [dW, aW] of [
                    [1, 3],
                    [3, 1],
                    [2, 2],
                    [5, 5],
                    [8, 1],
                    [1, 8],
                ] as [number, number][]) {
                    for (let dShips = 0; dShips <= 40; dShips += 4) {
                        for (let aShips = 0; aShips <= 40; aShips += 4) {
                            const basic = service.calculateBasic(
                                { ships: dShips, weaponsLevel: dW },
                                { ships: aShips, weaponsLevel: aW },
                                isC2S,
                                bonus,
                            );

                            const groups = setupGroups(
                                { ships: dShips, weapons: dW },
                                { ships: aShips, weapons: aW },
                                isC2S,
                                bonus,
                            );

                            const result = service.calculateGroups(
                                cloneGroups(groups),
                                isC2S,
                            );

                            const defenderGroup = findDetailedGroup(
                                result,
                                "defender",
                            );
                            const attackerGroup = findDetailedGroup(
                                result,
                                "attacker",
                            );

                            const attackerWon =
                                attackerGroup.shipsAfter >
                                defenderGroup.shipsAfter;

                            // calculateBasic asks exactly these two questions
                            const defNeed = attackerWon
                                ? service.estimateNeeded(
                                      result,
                                      defenderGroup,
                                      "eliminateOtherGroups",
                                  )
                                : undefined;
                            const attNeed = attackerWon
                                ? undefined
                                : service.estimateNeeded(
                                      result,
                                      attackerGroup,
                                      "greaterThanZeroShips",
                                  );

                            if (
                                basic.defender.shipsNeeded !== defNeed ||
                                basic.attacker.shipsNeeded !== attNeed
                            ) {
                                report.push({
                                    params: describeParams({
                                        isCarrierToStarCombat: isC2S,
                                        includeDefenderBonus: bonus,
                                        defender: {
                                            ships: dShips,
                                            weapons: dW,
                                        },
                                        attacker: {
                                            ships: aShips,
                                            weapons: aW,
                                        },
                                    }),
                                    kind: "calculateBasic",
                                    detail: `calculateBasic defender/attacker needed (${basic.defender.shipsNeeded}/${basic.attacker.shipsNeeded}) != independent (${defNeed}/${attNeed})`,
                                });
                            } else {
                                matches++;
                            }
                        }
                    }
                }
            }
        }

        expect(report).toEqual([]);
        expect(matches).toBeGreaterThan(0);
    });

    it("computeStar/computeCarrier produced groups get valid public estimates", () => {
        let checked = 0;

        for (const bonus of [true, false]) {
            for (const playerCount of [2, 3]) {
                for (const starSideShips of [0, 5, 40]) {
                    for (const otherShips of [0, 1, 7, 30]) {
                        for (const mode of ["star", "carrier"] as const) {
                            const game = fakeWiringGame(bonus, playerCount);

                            const star =
                                mode === "star"
                                    ? ({
                                          _id: "s1",
                                          ownedByPlayerId: "p0",
                                          ships: starSideShips,
                                          specialistId: null,
                                          homeStar: false,
                                          isAsteroidField: false,
                                      } as any)
                                    : undefined;

                            const starSideCarriers =
                                mode === "star"
                                    ? []
                                    : [
                                          {
                                              _id: "c0",
                                              ownedByPlayerId: "p0",
                                              ships: starSideShips,
                                              specialistId: null,
                                              specialistTargetedPlayers: [],
                                          } as any,
                                      ];

                            const otherCarriers = Array.from(
                                { length: playerCount - 1 },
                                (_, i) =>
                                    ({
                                        _id: `cOther${i}`,
                                        ownedByPlayerId: `p${i + 1}`,
                                        ships: otherShips,
                                        specialistId: null,
                                        specialistTargetedPlayers: [],
                                    }) as any,
                            );

                            const result =
                                mode === "star"
                                    ? service.computeStar(
                                          game,
                                          star!,
                                          otherCarriers,
                                      )
                                    : service.computeCarrier(
                                          game,
                                          (starSideCarriers as any[]).concat(
                                              otherCarriers,
                                          ),
                                      );

                            if (!result) {
                                report.push({
                                    params: `${mode} p${playerCount} bonus=${bonus} star=${starSideShips} other=${otherShips}`,
                                    kind: "wiring",
                                    detail: "expected combat but computeStar/computeCarrier returned undefined",
                                });
                                continue;
                            }

                            const isC2S = Boolean(
                                result.groups.find((g) => g.star),
                            );

                            const params = `${mode} p${playerCount} bonus=${bonus} starSide=${starSideShips} other=${otherShips}`;

                            for (const group of result.groups as unknown as TestDetailedGroup[]) {
                                for (const terminationCondition of [
                                    "greaterThanZeroShips",
                                    "eliminateOtherGroups",
                                ] as const) {
                                    const before = report.length;

                                    checkEstimate(
                                        params,
                                        result.combatGroups as unknown as TestGroup[],
                                        result as unknown as {
                                            groups: TestDetailedGroup[];
                                        },
                                        group.id,
                                        terminationCondition,
                                        isC2S,
                                        false,
                                    );

                                    if (report.length === before) {
                                        checked++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        expect(report).toEqual([]);
        // every estimate that was not gated must have been exercised
        expect(checked).toBeGreaterThan(0);
    });
});

describe("combat estimate malformed input guards", () => {
    interface MaskedResult {
        defender: TestDetailedGroup;
        attacker: TestDetailedGroup;
        result: DetailedCombatResult<string, TestPlayer, TestStar, TestCarrier>;
        combatGroups: TestGroup[];
    }

    const makeMasked = (mask: (target: MaskedResult) => void): MaskedResult => {
        const groups = setupGroups(
            { ships: 10, weapons: 2 },
            { ships: 5, weapons: 2 },
            true,
            false,
        );

        const result = service.calculateGroups(cloneGroups(groups), true);

        const target: MaskedResult = {
            defender: findDetailedGroup(result, "defender"),
            attacker: findDetailedGroup(result, "attacker"),
            result,
            combatGroups: result.combatGroups as unknown as TestGroup[],
        };

        mask(target);

        return target;
    };

    it("throws when the estimate-for group's shipsAfter is masked", () => {
        const masked = makeMasked((t) => {
            (t.defender as any).shipsAfter = "???";
        });

        expect(() =>
            service.estimateNeeded(
                masked.result,
                masked.defender,
                "greaterThanZeroShips",
            ),
        ).toThrowError(ValidationError);
    });

    it("throws when the estimate-for group's shipsLost is masked", () => {
        const masked = makeMasked((t) => {
            (t.defender as any).shipsLost = "???";
        });

        expect(() =>
            service.estimateNeeded(
                masked.result,
                masked.defender,
                "greaterThanZeroShips",
            ),
        ).toThrowError(ValidationError);
    });

    it("throws when the estimate-for group's shipsKilled is masked", () => {
        const masked = makeMasked((t) => {
            (t.defender as any).shipsKilled = "???";
        });

        expect(() =>
            service.estimateNeeded(
                masked.result,
                masked.defender,
                "greaterThanZeroShips",
            ),
        ).toThrowError(ValidationError);
    });

    it("throws when all estimate-for fields are masked", () => {
        const masked = makeMasked((t) => {
            (t.defender as any).shipsAfter = "???";
            (t.defender as any).shipsLost = "???";
            (t.defender as any).shipsKilled = "???";
        });

        expect(() =>
            service.estimateNeeded(
                masked.result,
                masked.defender,
                "greaterThanZeroShips",
            ),
        ).toThrowError(ValidationError);
    });

    it("throws when group ship data in the combat result is masked", () => {
        const masked = makeMasked((t) => {
            (t.combatGroups[0] as any).originalShips = "???";
        });

        expect(() =>
            service.estimateNeeded(
                masked.result,
                masked.defender,
                "greaterThanZeroShips",
            ),
        ).toThrowError(ValidationError);
    });

    it("throws when star ships in the combat result are masked", () => {
        const masked = makeMasked((t) => {
            (t.combatGroups[0].star as any).ships = "???";
        });

        expect(() =>
            service.estimateNeeded(
                masked.result,
                masked.defender,
                "greaterThanZeroShips",
            ),
        ).toThrowError(ValidationError);
    });

    it("throws when carrier ships in the combat result are masked", () => {
        const masked = makeMasked((t) => {
            (t.combatGroups[1].carriers[0] as any).ships = "???";
        });

        expect(() =>
            service.estimateNeeded(
                masked.result,
                masked.defender,
                "greaterThanZeroShips",
            ),
        ).toThrowError(ValidationError);
    });

    it("throws on non-finite numbers", () => {
        const masked = makeMasked((t) => {
            (t.defender as any).shipsAfter = NaN;
        });

        expect(() =>
            service.estimateNeeded(
                masked.result,
                masked.defender,
                "greaterThanZeroShips",
            ),
        ).toThrowError(ValidationError);
    });

    it("throws when star ships in the combat result are null (modifyGroups delta math would loop)", () => {
        const masked = makeMasked((t) => {
            t.combatGroups[0].star!.ships = null;
        });

        expect(() =>
            service.estimateNeeded(
                masked.result,
                masked.defender,
                "greaterThanZeroShips",
            ),
        ).toThrowError(ValidationError);
    });

    it("throws when carrier ships in the combat result are null (modifyGroups delta math would loop)", () => {
        const masked = makeMasked((t) => {
            t.combatGroups[1].carriers[0].ships = null;
        });

        expect(() =>
            service.estimateNeeded(
                masked.result,
                masked.attacker,
                "greaterThanZeroShips",
            ),
        ).toThrowError(ValidationError);
    });
});
