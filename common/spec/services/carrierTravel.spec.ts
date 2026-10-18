import { CarrierTravelService } from "../../src/services/carrierTravel";
import { DistanceService } from "../../src/services/distance";
import { StarDistanceService } from "../../src/services/starDistance";
import { StarDataService } from "../../src/services/starData";
import { GameTypeService } from "../../src/services/gameType";
import { TechnologyService } from "../../src/services/technology";
import type { Specialist } from "../../src/types/common/specialist";
import type { Game } from "../../src/types/common/game";
import type { Star } from "../../src/types/common/star";
import type { Carrier } from "../../src/types/common/carrier";
import type { Player } from "../../src/types/common/player";
import type { Id } from "../../src/types/id";

/**
 * Behaviour tests for CarrierTravelService.canTravelAtWarpSpeed.
 *
 * The method only consults the specialist and diplomacy dependencies, so
 * those are faked; the remaining constructor dependencies are the real
 * stateless services. Ownership checks are expected to key off the carrier's
 * owner, not the unused player argument.
 */

const SCRAMBLER_ID = 1;
const STABILIZER_ID = 2;
const DECOY_ID = 3;
const UNKNOWN_ID = 99;

const specialists = new Map<number, Specialist>();

const specialistService = {
    getByIdStar: (id: number) => specialists.get(id) ?? null,
    getByIdCarrier: (id: number) => specialists.get(id) ?? null,
};

let formalAlliancesEnabled = false;
let alliedPairs: Set<string>;
let alliedStatusCalls = 0;

const diplomacyService = {
    isFormalAlliancesEnabled() {
        return formalAlliancesEnabled;
    },
    isDiplomaticStatusToPlayersAllied(
        _game: unknown,
        playerId: Id,
        otherPlayerIds: Id[],
    ) {
        alliedStatusCalls++;

        return otherPlayerIds.every((otherPlayerId) =>
            alliedPairs.has(`${playerId}|${otherPlayerId}`),
        );
    },
};

const game = {} as unknown as Game<Id>;
const playerStub = { _id: "unused" } as unknown as Player<Id>;
const otherPlayer = { _id: "p2" } as unknown as Player<Id>;

const service = new CarrierTravelService<Id>(
    specialistService,
    new TechnologyService(specialistService, new GameTypeService()),
    new DistanceService(),
    new StarDistanceService(new DistanceService()),
    diplomacyService,
    new StarDataService(new GameTypeService()),
);

const star = (id: string, overrides: Partial<Star<Id>> = {}) =>
    ({
        _id: id,
        ownedByPlayerId: null,
        warpGate: false,
        specialistId: null,
        location: { x: 0, y: 0 },
        ...overrides,
    }) as unknown as Star<Id>;

const carrier = (
    ownedByPlayerId: string,
    overrides: Partial<Carrier<Id>> = {},
) =>
    ({
        _id: "carrier",
        ownedByPlayerId,
        specialistId: null,
        ...overrides,
    }) as unknown as Carrier<Id>;

const specialist = (id: number, modifiers: Specialist["modifiers"]) =>
    ({ id, modifiers }) as unknown as Specialist;

const scrambler = specialist(SCRAMBLER_ID, {
    special: { lockWarpGates: true },
});
const stabilizer = specialist(STABILIZER_ID, {
    special: { unlockWarpGates: true },
});
const decoy = specialist(DECOY_ID, { local: { speed: 1 } });

function canWarp(
    source: Star<Id> | null,
    destination: Star<Id> | null,
    carrierUnderTest: Carrier<Id>,
    playerArg: Player<Id> = playerStub,
) {
    return service.canTravelAtWarpSpeed(
        game,
        playerArg,
        carrierUnderTest,
        source as unknown as Star<Id>,
        destination as unknown as Star<Id>,
    );
}

describe("carrier travel - canTravelAtWarpSpeed", () => {
    beforeEach(() => {
        specialists.clear();
        specialists.set(SCRAMBLER_ID, scrambler);
        specialists.set(STABILIZER_ID, stabilizer);
        specialists.set(DECOY_ID, decoy);

        formalAlliancesEnabled = false;
        alliedPairs = new Set();
        alliedStatusCalls = 0;
    });

    describe("destroyed star guards", () => {
        it("returns false when the source star is missing", () => {
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(canWarp(null, destination, carrier("p1"))).toBeFalse();
        });

        it("returns false when the destination star is missing", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(canWarp(source, null, carrier("p1"))).toBeFalse();
        });
    });

    describe("warp gate and ownership prerequisites", () => {
        it("returns false when the source star has no warp gate", () => {
            const source = star("s1", { ownedByPlayerId: "p1" });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeFalse();
        });

        it("returns false when the destination star has no warp gate", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });
            const destination = star("s2", { ownedByPlayerId: "p1" });

            expect(canWarp(source, destination, carrier("p1"))).toBeFalse();
        });

        it("returns false when the source star is unowned", () => {
            const source = star("s1", { warpGate: true });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeFalse();
        });

        it("returns false when the destination star is unowned", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });
            const destination = star("s2", { warpGate: true });

            expect(canWarp(source, destination, carrier("p1"))).toBeFalse();
        });
    });

    describe("ownership and alliances", () => {
        it("allows warp when both stars are owned by the carrier owner", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeTrue();
        });

        it("allows warp through foreign gates when no scramblers are present", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p2",
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p3",
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeTrue();
        });

        it("allows warp when the destination is owned by an ally", () => {
            formalAlliancesEnabled = true;
            alliedPairs.add("p1|p3");

            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p3",
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeTrue();
        });

        it("allows warp when both ends are owned by allies", () => {
            formalAlliancesEnabled = true;
            alliedPairs.add("p1|p2");
            alliedPairs.add("p1|p3");

            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p2",
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p3",
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeTrue();
        });

        it("does not consult diplomacy when formal alliances are disabled", () => {
            alliedPairs.add("p1|p2");

            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p2",
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p3",
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeTrue();
            expect(alliedStatusCalls).toBe(0);
        });

        it("bases ownership checks on the carrier owner rather than the player argument", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p1",
                specialistId: SCRAMBLER_ID,
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            // If ownership were resolved against the player argument (p2),
            // the scrambler on the source star would block warp travel.
            expect(
                canWarp(source, destination, carrier("p1"), otherPlayer),
            ).toBeTrue();
        });
    });

    describe("warp scramblers", () => {
        it("blocks warp when a non-allied source star has a scrambler", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p2",
                specialistId: SCRAMBLER_ID,
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeFalse();
        });

        it("blocks warp when a non-allied destination star has a scrambler", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p2",
                specialistId: SCRAMBLER_ID,
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeFalse();
        });

        it("blocks warp when both ends have scramblers", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p2",
                specialistId: SCRAMBLER_ID,
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p3",
                specialistId: SCRAMBLER_ID,
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeFalse();
        });

        it("ignores a scrambler on a star owned by the carrier owner", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p1",
                specialistId: SCRAMBLER_ID,
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeTrue();
        });

        it("ignores a scrambler on an allied star", () => {
            formalAlliancesEnabled = true;
            alliedPairs.add("p1|p3");

            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p3",
                specialistId: SCRAMBLER_ID,
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeTrue();
        });

        it("treats other-owned stars as non-allied when formal alliances are disabled", () => {
            alliedPairs.add("p1|p2");

            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p2",
                specialistId: SCRAMBLER_ID,
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(canWarp(source, destination, carrier("p1"))).toBeFalse();
            expect(alliedStatusCalls).toBe(0);
        });
    });

    describe("warp stabilizer", () => {
        it("bypasses a scrambler on the source star", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p2",
                specialistId: SCRAMBLER_ID,
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(
                canWarp(
                    source,
                    destination,
                    carrier("p1", { specialistId: STABILIZER_ID }),
                ),
            ).toBeTrue();
        });

        it("bypasses a scrambler on the destination star", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p2",
                specialistId: SCRAMBLER_ID,
            });

            expect(
                canWarp(
                    source,
                    destination,
                    carrier("p1", { specialistId: STABILIZER_ID }),
                ),
            ).toBeTrue();
        });

        it("does not bypass scramblers for specialists without unlockWarpGates", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p2",
                specialistId: SCRAMBLER_ID,
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(
                canWarp(
                    source,
                    destination,
                    carrier("p1", { specialistId: DECOY_ID }),
                ),
            ).toBeFalse();
        });

        it("does not bypass scramblers when the carrier specialist cannot be resolved", () => {
            const source = star("s1", {
                warpGate: true,
                ownedByPlayerId: "p2",
                specialistId: SCRAMBLER_ID,
            });
            const destination = star("s2", {
                warpGate: true,
                ownedByPlayerId: "p1",
            });

            expect(
                canWarp(
                    source,
                    destination,
                    carrier("p1", { specialistId: UNKNOWN_ID }),
                ),
            ).toBeFalse();
        });
    });
});
