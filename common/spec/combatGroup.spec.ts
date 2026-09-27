import { CombatGroupService } from "../src/services/combatGroup";
import type { CombatBasePlayer } from "../src/types/common/combat";

type TestPlayer = CombatBasePlayer<string>;

const playerA: TestPlayer = {
    _id: "A",
    research: { weapons: { level: 1 } },
};
const playerB: TestPlayer = {
    _id: "B",
    research: { weapons: { level: 1 } },
};
const playerC: TestPlayer = {
    _id: "C",
    research: { weapons: { level: 1 } },
};
const playerD: TestPlayer = {
    _id: "D",
    research: { weapons: { level: 1 } },
};

let alliedPairs: Set<string>;

const diplomacyService = {
    isFormalAlliancesEnabled() {
        return false;
    },
    isDiplomaticStatusToPlayersAllied(
        _game: unknown,
        playerId: string,
        otherPlayerIds: string[],
    ) {
        return otherPlayerIds.every((otherPlayerId) =>
            alliedPairs.has(`${playerId}|${otherPlayerId}`),
        );
    },
};

const service = new CombatGroupService<string>(diplomacyService);

describe("combat groups", () => {
    beforeEach(() => {
        alliedPairs = new Set();
    });

    it("should merge two allied players into a single group", () => {
        alliedPairs.add("A|B");
        alliedPairs.add("B|A");

        const result = service.computeCombatGroups({} as any, [
            playerA,
            playerB,
        ]);

        expect(result.groups.length).toBe(1);
        expect(result.groups[0].map((p) => p._id).sort()).toEqual(["A", "B"]);
        expect(result.mapping.get("A")).toBe(0);
        expect(result.mapping.get("B")).toBe(0);
    });

    it("should merge a transitive alliance chain into a single group regardless of input order", () => {
        alliedPairs.add("A|B");
        alliedPairs.add("B|A");
        alliedPairs.add("B|C");
        alliedPairs.add("C|B");

        for (const players of [
            [playerA, playerB, playerC],
            [playerB, playerA, playerC],
            [playerC, playerB, playerA],
        ]) {
            const result = service.computeCombatGroups({} as any, players);

            expect(result.groups.length).toBe(1);
            expect(result.groups[0].map((p) => p._id).sort()).toEqual([
                "A",
                "B",
                "C",
            ]);
            expect(result.mapping.get("A")).toBe(0);
            expect(result.mapping.get("B")).toBe(0);
            expect(result.mapping.get("C")).toBe(0);
        }
    });

    it("should keep unallied players in separate groups", () => {
        const result = service.computeCombatGroups({} as any, [
            playerA,
            playerB,
            playerC,
        ]);

        expect(result.groups.length).toBe(3);
        expect(result.groups.map((g) => g[0]._id).sort()).toEqual([
            "A",
            "B",
            "C",
        ]);
        expect(result.mapping.get("A")).not.toBe(result.mapping.get("B"));
        expect(result.mapping.get("A")).not.toBe(result.mapping.get("C"));
        expect(result.mapping.get("B")).not.toBe(result.mapping.get("C"));
    });

    it("should merge only players within connected alliance islands", () => {
        alliedPairs.add("A|B");
        alliedPairs.add("B|A");
        alliedPairs.add("C|D");
        alliedPairs.add("D|C");

        const result = service.computeCombatGroups({} as any, [
            playerA,
            playerB,
            playerC,
            playerD,
        ]);

        expect(result.groups.length).toBe(2);

        const sortedGroups = result.groups.map((g) =>
            g.map((p) => p._id).sort(),
        );
        sortedGroups.sort((a, b) => a[0].localeCompare(b[0]));

        expect(sortedGroups).toEqual([
            ["A", "B"],
            ["C", "D"],
        ]);

        for (const group of result.groups) {
            const groupIdx = result.mapping.get(group[0]._id)!;

            for (const player of group) {
                expect(result.mapping.get(player._id)).toBe(groupIdx);
            }
        }
    });

    it("should produce no groups when given no players", () => {
        const result = service.computeCombatGroups({} as any, []);

        expect(result.groups).toEqual([]);
        expect(result.mapping.size).toBe(0);
    });
});
