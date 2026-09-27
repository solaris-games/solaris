import mongoose from "mongoose";
import {
    BaseGameEvent,
    CarrierTravelService,
    DistanceService,
    GameTypeService,
    StarDataService,
    StarDistanceService,
    TechnologyService,
} from "@solaris/common";
import CarrierCombatService from "../services/carrierCombat";
import CarrierMovementService from "../services/carrierMovement";
import CombatProcessingService from "../services/combatProcessing";
import DiplomacyService from "../services/diplomacy";
import DiplomacyUpkeepService from "../services/diplomacyUpkeep";
import GameStateService from "../services/gameState";
import NameService from "../services/name";
import PlayerService from "../services/player";
import RandomService from "../services/random";
import Repository from "../services/repository";
import SpecialistService from "../services/specialist";
import StarService from "../services/star";
import UserService from "../services/user";
import CarrierGiftService from "../services/carrierGift";
import { Carrier } from "../services/types/Carrier";
import {
    CarrierCollision,
    DualCarrierCollision,
} from "../services/types/CarrierCollision";
import { Game } from "../services/types/Game";
import { Star } from "../services/types/Star";
import { IEventService } from "../services/types/IEventService";
import { IStatisticsService } from "../services/types/IStatisticsService";
import { DBObjectId } from "../services/types/DBObjectId";

const createCarrier = (
    name: string,
    ownedByPlayerId: DBObjectId,
    ships: number,
    source: DBObjectId,
    destination: DBObjectId,
    specialistId: number | null = null,
): Carrier => {
    const carrier: Carrier = {
        _id: new mongoose.Types.ObjectId(),
        ownedByPlayerId,
        name,
        ships,
        orbiting: null,
        waypointsLooped: false,
        specialistId,
        specialistExpireTick: null,
        specialist: null,
        specialistTargetedPlayers: [],
        isGift: false,
        isScuttled: false,
        location: { x: 0, y: 0 },
        locationNext: null,
        waypoints: [
            {
                _id: new mongoose.Types.ObjectId(),
                source,
                destination,
                action: "nothing",
                actionShips: 0,
                delayTicks: 0,
            },
        ],
        toObject: () => carrier,
    };

    return carrier;
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

// Creates an instance of a class without running its constructor. Used for
// class-typed dependencies that are never called by the code under test, so
// that they can be passed around without casts.
const unconfigured = <T>(ctor: abstract new (...args: never[]) => T): T =>
    Object.create(ctor.prototype);

describe("carrierCombat", () => {
    const gameTypeService = new GameTypeService();
    const distanceService = new DistanceService();
    const specialistService = new SpecialistService(gameTypeService);
    const starDataService = new StarDataService(gameTypeService);
    const technologyService = new TechnologyService(
        specialistService,
        gameTypeService,
    );
    const starDistanceService = new StarDistanceService(distanceService);

    const gameRepoStub = unconfigured<Repository<Game>>(Repository);
    const eventRepoStub =
        unconfigured<Repository<BaseGameEvent<DBObjectId>>>(Repository);

    const diplomacyService = new DiplomacyService(
        gameRepoStub,
        eventRepoStub,
        unconfigured(DiplomacyUpkeepService),
    );

    const carrierTravelService = new CarrierTravelService<DBObjectId>(
        specialistService,
        technologyService,
        distanceService,
        starDistanceService,
        diplomacyService,
        starDataService,
    );

    const starService = new StarService(
        gameRepoStub,
        unconfigured(RandomService),
        unconfigured(NameService),
        distanceService,
        starDistanceService,
        technologyService,
        specialistService,
        unconfigured(UserService),
        gameTypeService,
        unconfigured(GameStateService),
        starDataService,
    );

    const playerServiceStub = unconfigured(PlayerService);

    const carrierMovementService = new CarrierMovementService(
        gameRepoStub,
        distanceService,
        playerServiceStub,
        starService,
        specialistService,
        diplomacyService,
        unconfigured(CarrierGiftService),
        technologyService,
        starDistanceService,
        carrierTravelService,
        starDataService,
    );

    describe("_mergeCollisionsInPath", () => {
        const sourceId = new mongoose.Types.ObjectId();
        const destinationId = new mongoose.Types.ObjectId();

        const carrierA = createCarrier(
            "A",
            new mongoose.Types.ObjectId(),
            5,
            sourceId,
            destinationId,
        );
        const carrierB = createCarrier(
            "B",
            new mongoose.Types.ObjectId(),
            5,
            sourceId,
            destinationId,
        );
        const carrierC = createCarrier(
            "C",
            new mongoose.Types.ObjectId(),
            5,
            sourceId,
            destinationId,
        );

        const service = new CarrierCombatService(
            carrierTravelService,
            carrierMovementService,
            diplomacyService,
            distanceService,
            playerServiceStub,
            specialistService,
            starService,
            unconfigured(CombatProcessingService),
        );

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
            // The collision carrying the seed's time/location wins, which is the
            // dual collision pushed last (t = 1 + epsilon/2).
            expect(Math.abs(collisions[0].time - 1)).toBeLessThan(epsilon);
            expect(Math.abs(collisions[0].location - 1)).toBeLessThan(epsilon);
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
        const sourceStarId = new mongoose.Types.ObjectId();
        const destinationStarId = new mongoose.Types.ObjectId();
        const player1Id = new mongoose.Types.ObjectId();
        const player2Id = new mongoose.Types.ObjectId();

        const createStar = (
            name: string,
            id: DBObjectId,
            location: { x: number; y: number },
        ): Star => {
            return {
                _id: id,
                ownedByPlayerId: null,
                location,
                name,
                naturalResources: { economy: 0, industry: 0, science: 0 },
                ships: null,
                specialistId: null,
                specialistExpireTick: null,
                homeStar: false,
                warpGate: false,
                isNebula: false,
                isAsteroidField: false,
                isBinaryStar: false,
                isBlackHole: false,
                isPulsar: false,
                canBeLooted: false,
                wormHoleToStarId: null,
                infrastructure: {
                    economy: null,
                    industry: null,
                    science: null,
                },
            };
        };

        const stars: Star[] = [
            createStar("S", sourceStarId, { x: 0, y: 0 }),
            createStar("D", destinationStarId, { x: 10, y: 0 }),
        ];

        // X is travelling from S to D, Z and W are travelling from D to S.
        // X has the Smuggler specialist (id 5) which doubles its speed to 2
        // whereas Z and W travel at the base speed of 1. All three carriers
        // are therefore on the same path with the two collisions ending up at
        // unique times/locations so that they are not merges.
        //
        // X travels at speed 2: distance to destination 6 -> next 4.
        // Z travels at speed 1: distance to destination (S) 6.5 -> next 5.5.
        // W travels at speed 1: distance to destination (S) 6 -> next 5.
        //
        // So X collides with W at t = (6 - 4) / (2 + 1) = 2/3, and with Z at
        // t = (6 - 3.5) / (2 + 1) = 5/6. Z and W travel at the same speed in
        // the same direction and therefore never catch up to each other.
        const makeCarrierX = () =>
            createCarrier(
                "X",
                player1Id,
                5,
                sourceStarId,
                destinationStarId,
                5, // Smuggler: local speed x2
            );
        const makeCarrierZ = () =>
            createCarrier("Z", player2Id, 5, destinationStarId, sourceStarId);
        const makeCarrierW = () =>
            createCarrier("W", player2Id, 5, destinationStarId, sourceStarId);

        let carrierX: Carrier;
        let carrierZ: Carrier;
        let carrierW: Carrier;
        let game: Game;

        const makeGame = () => {
            carrierX = makeCarrierX();
            carrierZ = makeCarrierZ();
            carrierW = makeCarrierW();
            carrierX.location = { x: 4, y: 0 };
            carrierZ.location = { x: 6.5, y: 0 };
            carrierW.location = { x: 6, y: 0 };

            game = {
                settings: {
                    specialGalaxy: {
                        carrierSpeed: 1,
                    },
                },
                galaxy: {
                    players: [
                        { _id: player1Id, userId: null },
                        { _id: player2Id, userId: null },
                    ],
                    stars,
                    carriers: [carrierX, carrierZ, carrierW],
                },
            } as Game;
        };

        const makeCombatRecorder = (killX: boolean) => {
            const combats: Carrier[][] = [];

            // The recorder overrides performCombat on a real (unconfigured)
            // CombatProcessingService instance, so that it can be passed to
            // CarrierCombatService without casts.
            const combatProcessingService = Object.assign(
                unconfigured(CombatProcessingService),
                {
                    performCombat: async (
                        _game: Game,
                        _gameUsers: unknown[],
                        _star: unknown,
                        carriers: Carrier[],
                    ) => {
                        combats.push(carriers);

                        if (killX) {
                            for (const c of carriers) {
                                if (c === carrierX) {
                                    c.ships = 0;
                                }
                            }
                        }
                    },
                },
            );

            return { combats, combatProcessingService };
        };

        it("should not perform combat with carriers that were destroyed in a previous collision", async () => {
            // Arrange
            makeGame();
            const { combats, combatProcessingService } =
                makeCombatRecorder(true);

            const service = new CarrierCombatService(
                carrierTravelService,
                carrierMovementService,
                diplomacyService,
                distanceService,
                playerServiceStub,
                specialistService,
                starService,
                combatProcessingService,
            );

            // Act
            await service.combatCarriers(
                game,
                [],
                {} as IEventService,
                {} as IStatisticsService,
            );

            // Assert
            // X is destroyed in the first combat (X vs W), so in the second
            // collision (X vs Z) X is filtered out as it has 0 ships. The
            // collision then only contains carriers of a single player (Z),
            // so no combat must be performed for it.
            expect(combats.length).toEqual(1);
            expect(combats[0].map((c) => c.name).sort()).toEqual(["W", "X"]);
        });

        it("should perform sequential combats when carriers remain alive", async () => {
            // Arrange
            makeGame();
            const { combats, combatProcessingService } =
                makeCombatRecorder(false);
            const service = new CarrierCombatService(
                carrierTravelService,
                carrierMovementService,
                diplomacyService,
                distanceService,
                playerServiceStub,
                specialistService,
                starService,
                combatProcessingService,
            );

            // Act
            await service.combatCarriers(
                game,
                [],
                {} as IEventService,
                {} as IStatisticsService,
            );

            // Assert
            // All carriers survive, so both collisions lead to combat.
            // Combat happens in time order: X collides with W first (t = 2/3),
            // then with Z (t = 5/6).
            expect(combats.length).toEqual(2);
            expect(combats[0].map((c) => c.name).sort()).toEqual(["W", "X"]);
            expect(combats[1].map((c) => c.name).sort()).toEqual(["X", "Z"]);
        });
    });
});
