import { parseArgs } from "node:util";
import { Carrier } from "../services/types/Carrier";
import {
    DBObjectId,
    objectId,
    objectIdFromString,
} from "../services/types/DBObjectId";
import { Game } from "../services/types/Game";
import { GameHistory, GameHistoryCarrier } from "../services/types/GameHistory";
import { JobParameters, makeJob } from "./tool";
import { DependencyContainer } from "../services/types/DependencyContainer";
import { Specialist } from "@solaris/common";

const loadHistory = async (
    container: DependencyContainer,
    gameId: DBObjectId,
    tick: number,
) => {
    const history = await container.historyService.getHistoryByTick(
        gameId,
        tick,
    );

    return history;
};

const applyGameState = (game: Game, history: GameHistory) => {
    game.state.tick = history.tick;
    game.state.productionTick = history.productionTick;
    game.state.lastTickDate = new Date();
    game.state.ticksToEnd = null;
    game.state.locked = false;
    game.state.forceTick = false;
};

const applyPlayers = (game: Game, history: GameHistory) => {
    game.galaxy.players.forEach((player) => {
        const histPlayer = history.players.find(
            (p) => p.playerId.toString() === player._id.toString(),
        );

        if (!histPlayer) {
            console.log(
                `Player ${player._id}/${player.alias} not found in history`,
            );

            return;
        }

        player.userId = histPlayer.userId;
        player.alias = histPlayer.alias;
        player.avatar = histPlayer.avatar;
        player.researchingNow = histPlayer.researchingNow;
        player.researchQueue = histPlayer.researchQueue;
        player.credits = histPlayer.credits;
        player.creditsSpecialists = histPlayer.creditsSpecialists;
        player.isOpenSlot = histPlayer.isOpenSlot;
        player.defeated = histPlayer.defeated;
        player.defeatedDate = histPlayer.defeatedDate;
        player.afk = histPlayer.afk;
        player.ready = histPlayer.ready;
        player.readyToQuit = histPlayer.readyToQuit;
        player.research = histPlayer.research;
        player.ready = false; // reset turn based states to ensure the game stays in that tick
        player.readyToCycle = false;
        player.lastSeen = new Date();
    });
};

const applyStars = (game: Game, history: GameHistory) => {
    game.galaxy.stars.forEach((star) => {
        const histStar = history.stars.find(
            (s) => s.starId.toString() === star._id.toString(),
        );

        if (!histStar) {
            console.log(`Star ${star._id}/${star.name} not found in history`);

            return;
        }

        star.homeStar = histStar.homeStar;
        star.ships = histStar.ships;
        star.shipsActual = histStar.shipsActual;
        star.specialistId = histStar.specialistId;
        star.naturalResources = histStar.naturalResources;
        star.infrastructure = histStar.infrastructure;
        star.ignoreBulkUpgrade = histStar.ignoreBulkUpgrade;
        star.warpGate = histStar.warpGate;
        star.ownedByPlayerId = histStar.ownedByPlayerId;
        star.location = histStar.location;
    });
};

const applyWaypoints = (carrier: Carrier, histCarrier: GameHistoryCarrier) => {
    const historyWaypoint = histCarrier.waypoints[0];

    if (!historyWaypoint) {
        return;
    }

    carrier.waypoints = [
        {
            _id: objectId(),
            source: historyWaypoint.source,
            destination: historyWaypoint.destination,
            action: "nothing",
            actionShips: 0,
            delayTicks: 0,
        },
    ];
};

const applyCarriers = (
    container: DependencyContainer,
    game: Game,
    history: GameHistory,
) => {
    const removeCarriers = new Array<DBObjectId>();

    game.galaxy.carriers.forEach((carrier) => {
        const histCarrier = history.carriers.find(
            (c) => c.carrierId.toString() === carrier._id.toString(),
        );

        if (!histCarrier) {
            console.log(
                `Carrier ${carrier._id}/${carrier.name} not found in history`,
            );

            removeCarriers.push(carrier._id);
            return;
        }

        carrier.ships = histCarrier.ships;
        carrier.specialistId = histCarrier.specialistId;
        carrier.ownedByPlayerId = histCarrier.ownedByPlayerId;
        carrier.name = histCarrier.name;
        carrier.location = histCarrier.location;
        carrier.isGift = histCarrier.isGift;
        carrier.orbiting = histCarrier.orbiting;
        applyWaypoints(carrier, histCarrier);
    });

    const addCarriers = new Array<Carrier>();

    for (const carrier of history.carriers) {
        const currentCarrier = game.galaxy.carriers.find(
            (c) => c._id.toString() === carrier.carrierId.toString(),
        );

        // other case already handled above
        if (!currentCarrier) {
            let specialist: Specialist | null = null;

            if (carrier.specialistId) {
                specialist = container.specialistService.getById(
                    carrier.specialistId,
                    "carrier",
                );
            }

            const newCarrier: Carrier = {
                _id: carrier.carrierId,
                ships: carrier.ships,
                specialistId: carrier.specialistId,
                ownedByPlayerId: carrier.ownedByPlayerId,
                name: carrier.name,
                location: carrier.location,
                isGift: carrier.isGift,
                orbiting: carrier.orbiting,
                waypoints: [], // filled in below
                waypointsLooped: false,
                specialistExpireTick: specialist?.expireTicks
                    ? game.state.tick + specialist?.expireTicks // TODO, we probably want to store the correct tick in the TM
                    : null,
                locationNext: null,
            } as unknown as Carrier;

            applyWaypoints(newCarrier, carrier);

            addCarriers.push(newCarrier);
        }
    }

    game.galaxy.carriers = addCarriers.concat(
        game.galaxy.carriers.filter((c) => !removeCarriers.includes(c._id)),
    );
};

const applyHistory = (
    container: DependencyContainer,
    game: Game,
    history: GameHistory,
) => {
    applyGameState(game, history);
    applyPlayers(game, history);
    applyStars(game, history);
    applyCarriers(container, game, history);
};

const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
        "delete-newer": { type: "boolean", default: false },
        "delete-newer-events": { type: "boolean", default: false },
    },
    allowPositionals: true,
});

const gameIdS = positionals[0];
const tick = Number.parseInt(positionals[1]);

if (!gameIdS || !tick) {
    throw new Error("Missing required arguments: <gameId> and <tick>");
}

if (Number.isNaN(tick)) {
    throw new Error(`Invalid tick value: "${positionals[1]}"`);
}

const job = makeJob(
    "Restore game",
    async ({ log, container }: JobParameters) => {
        const gameId = objectIdFromString(gameIdS);

        const hist = await loadHistory(container, gameId, tick);
        if (!hist) {
            throw new Error("History not found");
        }

        log.info("Loaded history entry");

        const currentState = await container.gameService.getByIdAll(gameId);
        if (!currentState) {
            throw new Error("Game not found");
        }

        log.info("Loaded current game state");

        applyHistory(container, currentState, hist);

        log.info("History applied");

        await currentState.save();

        log.info("Game state saved");

        if (values["delete-newer"]) {
            log.info("Deleting newer history entries");

            await container.historyService.historyRepo.deleteMany({
                gameId,
                tick: {
                    $gt: tick,
                },
            });
        }

        if (values["delete-newer-events"]) {
            log.info("Deleting newer events");

            await container.eventService.eventRepo.deleteMany({
                gameId,
                tick: {
                    $gt: tick,
                },
            });
        }
    },
);

job();

export {};
