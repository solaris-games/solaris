import ResearchService from "../services/research";
import { ResearchProgressService } from "@solaris/common";
import { ValidationError } from "@solaris/common";
import { Player } from "../services/types/Player";

const game: any = {
    _id: "game1",
    settings: {
        technology: {
            researchCosts: {
                terraforming: "standard",
                experimentation: "standard",
                scanning: "standard",
                hyperspace: "standard",
                manufacturing: "standard",
                banking: "standard",
                weapons: "standard",
                specialists: "standard",
            },
            researchCostProgressions: {
                terraforming: { progression: "standard" },
                experimentation: { progression: "standard" },
                scanning: { progression: "standard" },
                hyperspace: { progression: "standard" },
                manufacturing: { progression: "standard" },
                banking: { progression: "standard" },
                weapons: { progression: "standard" },
                specialists: { progression: "standard" },
            },
        },
    },
    constants: {
        star: {
            infrastructureExpenseMultipliers: {
                standard: 1,
            },
        },
        research: {
            progressMultiplier: 50,
        },
    },
};

const createPlayer = (): Player =>
    ({
        _id: "player1",
        researchingNow: "weapons",
        researchingNext: "banking",
        research: {
            weapons: { level: 1, progress: 0 },
            terraforming: { level: 1, progress: 0 },
            banking: { level: 1, progress: 0 },
        },
    }) as unknown as Player;

const fakeTechnologyService = {
    isTechnologyResearchable: (game: any, key: string) => {
        return game.settings.technology.researchCosts[key] !== "none";
    },
    isTechnologyEnabled: (game: any, key: string) => {
        return game.settings.technology.researchCosts[key] !== "none";
    },
};

const fakeGameRepo: any = {
    lastUpdate: null,
    updateOne: async function (query: any, update: any) {
        this.lastUpdate = { query, update };
        return {};
    },
};

const fakeRandomService = {
    getRandomNumber: (max: number) => {
        return Math.min(0, max);
    },
};

describe("research", () => {
    let service: any;

    beforeEach(() => {
        fakeGameRepo.lastUpdate = null;

        service = new (ResearchService as any)(
            fakeGameRepo,
            fakeTechnologyService,
            fakeRandomService,
            {}, // playerStatisticsService - not used in these tests
            {}, // starService - not used in these tests
            {}, // userService - not used in these tests
            {}, // gameTypeService - not used in these tests
            new ResearchProgressService(),
        );
    });

    describe("updateResearchQueue", () => {
        it("should accept and persist a valid queue", async () => {
            const player = createPlayer();

            await service.updateResearchQueue(game, player, [
                "terraforming",
                "random",
                "banking",
            ]);

            expect(player.researchQueue).toEqual([
                "terraforming",
                "random",
                "banking",
            ]);
            expect(fakeGameRepo.lastUpdate.update.$set).toEqual({
                "galaxy.players.$.researchQueue": [
                    "terraforming",
                    "random",
                    "banking",
                ],
            });
            expect(fakeGameRepo.lastUpdate.query).toEqual({
                _id: "game1",
                "galaxy.players._id": "player1",
            });
        });

        it("should reject a queue longer than the max length", async () => {
            const player = createPlayer();

            await expectAsync(
                service.updateResearchQueue(
                    game,
                    player,
                    Array(11).fill("weapons"),
                ),
            ).toBeRejectedWithError(ValidationError);

            expect(player.researchQueue).toBeUndefined();
            expect(fakeGameRepo.lastUpdate).toBe(null);
        });

        it("should reject a queue containing a non-researchable tech", async () => {
            const player = createPlayer();

            game.settings.technology.researchCosts.scanning = "none";

            try {
                await service.updateResearchQueue(game, player, [
                    "terraforming",
                    "scanning",
                ]);

                fail("Expected a ValidationError to be thrown");
            } catch (err) {
                expect(err).toBeInstanceOf(ValidationError);
            } finally {
                game.settings.technology.researchCosts.scanning = "standard";
            }

            expect(player.researchQueue).toBeUndefined();
            expect(fakeGameRepo.lastUpdate).toBe(null);
        });
    });

    describe("_setNextResearch", () => {
        it("should advance researchingNow to the head of the queue", async () => {
            const player = createPlayer();
            player.researchQueue = ["terraforming", "banking"];

            service._setNextResearch(game, player);

            expect(player.researchingNow).toBe("terraforming");
            expect(player.researchQueue).toEqual(["banking"]);
        });

        it("should skip queue entries identical to the current research", async () => {
            const player = createPlayer();
            player.researchQueue = ["weapons", "terraforming"];

            service._setNextResearch(game, player);

            expect(player.researchingNow).toBe("terraforming");
            expect(player.researchQueue).toEqual([]);
        });

        it("should resolve random queue entries", async () => {
            const player = createPlayer();
            player.researchQueue = ["random", "banking"];

            service._setNextResearch(game, player);

            expect(player.researchingNow).toBe("weapons");
            expect(player.researchQueue).toEqual(["banking"]);
        });

        it("should keep the current research when the queue is empty", async () => {
            const player = createPlayer();
            player.researchQueue = [];

            service._setNextResearch(game, player);

            expect(player.researchingNow).toBe("weapons");
            expect(player.researchQueue).toEqual([]);
        });

        it("should fall back to the legacy researchingNext field when no queue exists", async () => {
            const player = createPlayer();

            service._setNextResearch(game, player);

            // researchingNext is "banking", so the player moves to it and
            // the (legacy-backed) queue becomes empty.
            expect(player.researchingNow).toBe("banking");
            expect(player.researchQueue).toEqual([]);
        });

        it("should keep the current research when the legacy researchingNext equals researchingNow", async () => {
            const player = createPlayer();
            player.researchingNext = "weapons";

            service._setNextResearch(game, player);

            expect(player.researchingNow).toBe("weapons");
            expect(player.researchQueue).toEqual([]);
        });
    });
});
