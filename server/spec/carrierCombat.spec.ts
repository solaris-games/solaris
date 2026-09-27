import CarrierCombatService from "../services/carrierCombat";
import { Carrier } from "../services/types/Carrier";
import {
    CarrierCollision,
    DualCarrierCollision,
} from "../services/types/CarrierCollision";
import { Game } from "../services/types/Game";
import { Star } from "../services/types/Star";

describe("carrierCombat", () => {
    let service: CarrierCombatService;

    const createCarrier = (
        name: string,
        ownedByPlayerId: string,
        ships: number,
    ): Carrier => {
        return {
            _id: name,
            orbiting: null,
            waypointsLooped: false,
            name,
            ships,
            specialistId: null,
            specialistExpireTick: null,
            specialist: null,
            specialistTargetedPlayers: [],
            isGift: false,
            isScuttled: false,
            waypoints: [],
            locationNext: null,
            ownedByPlayerId,
            location: { x: 0, y: 0 },
        } as unknown as Carrier;
    };

    const createDualCollision = (
        carrierA: Carrier,
        carrierB: Carrier,
        time: number,
        location: number,
    ): DualCarrierCollision => {
        return {
            time,
            location,
            carriers: [carrierA, carrierB],
        };
    };

    describe("_mergeCollisionsInPath", () => {
        beforeAll(() => {
            service = new CarrierCombatService(
                {} as any,
                {} as any,
                {} as any,
                {} as any,
                {} as any,
                {} as any,
                {} as any,
                {} as any,
            );
        });

        const carrierA = createCarrier("A", "player1", 5);
        const carrierB = createCarrier("B", "player2", 5);
        const carrierC = createCarrier("C", "player3", 5);

        it("should merge dual collisions with the same time and location into a single collision", () => {
            const collisionList: DualCarrierCollision[] = [
                createDualCollision(carrierA, carrierB, 0.3, 5),
                createDualCollision(carrierA, carrierC, 0.3, 5),
            ];

            const collisions: CarrierCollision[] =
                service._mergeCollisionsInPath(collisionList);

            expect(collisions.length).toEqual(1);
            expect(collisions[0].time).toEqual(0.3);
            expect(collisions[0].location).toEqual(5);
            // All carriers from both dual collisions should be merged into a single collision,
            // with carrier A (participating in both dual collisions) appearing only once.
            expect(collisions[0].carriers.length).toEqual(3);
            expect(collisions[0].carriers).toContain(carrierA);
            expect(collisions[0].carriers).toContain(carrierB);
            expect(collisions[0].carriers).toContain(carrierC);
        });

        it("should not merge dual collisions with different times or locations", () => {
            const collisionList: DualCarrierCollision[] = [
                createDualCollision(carrierA, carrierB, 0.3, 5),
                createDualCollision(carrierA, carrierC, 0.7, 2),
            ];

            const collisions: CarrierCollision[] =
                service._mergeCollisionsInPath(collisionList);

            expect(collisions.length).toEqual(2);
            // The combat that should happen first must be first in the list.
            expect(collisions[0].time).toEqual(0.3);
            expect(collisions[1].time).toEqual(0.7);
        });

        it("should merge dual collisions within the epsilon tolerance", () => {
            const epsilon = 10 ** -10;
            const collisionList: DualCarrierCollision[] = [
                createDualCollision(carrierA, carrierB, 1, 1),
                createDualCollision(
                    carrierA,
                    carrierC,
                    1 + epsilon / 2,
                    1 + epsilon / 2,
                ),
            ];

            const collisions: CarrierCollision[] =
                service._mergeCollisionsInPath(collisionList);

            expect(collisions.length).toEqual(1);
        });

        it("should not merge dual collisions beyond the epsilon tolerance", () => {
            const epsilon = 10 ** -10;
            const collisionList: DualCarrierCollision[] = [
                createDualCollision(carrierA, carrierB, 1, 1),
                createDualCollision(
                    carrierA,
                    carrierC,
                    1 + epsilon * 2,
                    1 + epsilon * 2,
                ),
            ];

            const collisions: CarrierCollision[] =
                service._mergeCollisionsInPath(collisionList);

            expect(collisions.length).toEqual(2);
        });
    });

    describe("combatCarriers", () => {
        let stars: Map<string, Star>;
        let combats: Carrier[][];

        let carrierTravelService: any;
        let carrierMovementService: any;
        let diplomacyService: any;
        let distanceService: any;
        let playerService: any;
        let specialistService: any;
        let starService: any;
        let combatProcessingService: any;

        // Setup helper for the regression scenario:
        // Three carriers on the path between two stars:
        // X (player1) travelling S -> D
        // Z (player2) travelling D -> S
        // W (player2) travelling D -> S
        // X collides with W first (t ~ 0.667), then with Z (t ~ 0.833).
        const setupScenario = (killCarrierInCombat: boolean) => {
            stars = new Map([
                [
                    "S",
                    { _id: "S", location: { x: 0, y: 0 } } as unknown as Star,
                ],
                [
                    "D",
                    { _id: "D", location: { x: 10, y: 0 } } as unknown as Star,
                ],
            ]);

            carrierX = createCarrier("X", "player1", 5);
            carrierZ = createCarrier("Z", "player2", 5);
            carrierW = createCarrier("W", "player2", 5);

            // X is travelling from S to D, Z and W are travelling from D to S.
            carrierX.location = { x: 4, y: 0 };
            carrierZ.location = { x: 6.5, y: 0 };
            carrierW.location = { x: 6, y: 0 };
            for (const [carrier, source, destination] of [
                [carrierX, "S", "D"],
                [carrierZ, "D", "S"],
                [carrierW, "D", "S"],
            ] as [Carrier, string, string][]) {
                carrier.waypoints = [
                    {
                        source,
                        destination,
                        delayTicks: 0,
                        action: "nothing",
                        actionShipType: "all",
                        actionShips: 0,
                        collectAll: false,
                        collectShips: 0,
                        collectPercent: 0,
                        dropAll: false,
                        dropShips: 0,
                        dropPercent: 0,
                    } as any,
                ];
            }

            carrierTravelService = {
                isInTransit: () => true,
                isLaunching: () => false,
                getSpeedOfCarrier: (_game: Game, c: Carrier) =>
                    c === carrierZ || c === carrierW ? 2 : 1,
            };
            carrierMovementService = {
                getNextLocationToWaypoint: (_game: Game, c: Carrier) => {
                    // X moves towards D (increasing x); Z and W move towards S (decreasing x).
                    if (c === carrierX) {
                        return { location: { x: 5, y: 0 }, distance: 1 };
                    }
                    if (c === carrierZ) {
                        return { location: { x: 4.5, y: 0 }, distance: 2 };
                    }
                    return { location: { x: 4, y: 0 }, distance: 2 };
                },
            };
            diplomacyService = {};
            distanceService = {
                getDistanceBetweenLocations: (
                    loc1: { x: number; y: number },
                    loc2: { x: number; y: number },
                ) => Math.hypot(loc1.x - loc2.x, loc1.y - loc2.y),
            };
            playerService = {};
            specialistService = { getAvoidCombatCarrierToCarrier: () => false };
            starService = {
                getById: (_game: Game, id: any) => stars.get(id.toString()),
            };
            combats = [];
            combatProcessingService = {
                performCombat: async (
                    _game: Game,
                    _users: any[],
                    _star: any,
                    carriers: Carrier[],
                ) => {
                    combats.push(carriers);

                    if (killCarrierInCombat) {
                        for (const c of carriers) {
                            if (c.name === "X") {
                                c.ships = 0;
                            }
                        }
                    }
                },
            };

            service = new CarrierCombatService(
                carrierTravelService,
                carrierMovementService,
                diplomacyService,
                distanceService,
                playerService,
                specialistService,
                starService,
                combatProcessingService,
            );

            game = {
                galaxy: {
                    carriers: [carrierX, carrierZ, carrierW],
                },
            } as unknown as Game;
        };

        let carrierX: Carrier;
        let carrierZ: Carrier;
        let carrierW: Carrier;
        let game: Game;

        it("should not perform combat with carriers that were destroyed in a previous collision", async () => {
            // Arrange
            setupScenario(true);

            // Act
            await service.combatCarriers(game, [], {} as any, {} as any);

            // Assert
            // X collides with W (t ~ 0.667) and with Z (t ~ 0.833). X is destroyed in the first
            // combat, so the second collision must only involve surviving carriers. Since Z is
            // the only remaining carrier (all owned by a single player), no combat must be performed.
            expect(combats.length).toEqual(1);
            expect(combats[0].map((c) => c.name).sort()).toEqual(["W", "X"]);
        });

        it("should perform sequential combats when carriers remain alive", async () => {
            // Arrange
            setupScenario(false);

            // Act
            await service.combatCarriers(game, [], {} as any, {} as any);

            // Assert
            // X collides with W first (t ~ 0.667), then with Z (t ~ 0.833). All carriers survive:
            expect(combats.length).toEqual(2);
            expect(combats[0].map((c) => c.name).sort()).toEqual(["W", "X"]);
            expect(combats[1].map((c) => c.name).sort()).toEqual(["X", "Z"]);
        });
    });
});
