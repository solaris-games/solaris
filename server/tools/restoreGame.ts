import mongoose from "mongoose";
import { Carrier } from "../services/types/Carrier";
import { DBObjectId, objectId } from "../services/types/DBObjectId";
import { Game } from "../services/types/Game";
import { GameHistory, GameHistoryCarrier } from "../services/types/GameHistory";
import { JobParameters, makeJob } from "./tool";
import { DependencyContainer } from "../services/types/DependencyContainer";

const loadHistory = async (container: DependencyContainer, gameId: DBObjectId, tick: number) => {
    const history = await container.historyService.getHistoryByTick(gameId, tick);

    return history;
}

const applyGameState = (game: Game, history: GameHistory) => {
    game.state.tick = history.tick;
    game.state.productionTick = history.productionTick;
    game.state.lastTickDate = new Date();
}

const applyPlayers = (game: Game, history: GameHistory) => {
    game.galaxy.players.forEach(player => {
        const histPlayer = history.players.find(p => p.playerId.toString() === player._id.toString());

        if (!histPlayer) {
            console.log(`Player ${player._id}/${player.alias} not found in history`);

            return;
        }

        player.userId = histPlayer.userId;
        player.alias = histPlayer.alias;
        player.avatar = histPlayer.avatar;
        player.researchingNow = histPlayer.researchingNow;
        player.researchingNext = histPlayer.researchingNext;
        player.credits = histPlayer.credits;
        player.creditsSpecialists = histPlayer.creditsSpecialists;
        player.isOpenSlot = histPlayer.isOpenSlot;
        player.defeated = histPlayer.defeated;
        player.defeatedDate = histPlayer.defeatedDate;
        player.afk = histPlayer.afk;
        player.ready = histPlayer.ready;
        player.readyToQuit = histPlayer.readyToQuit;
        player.research = histPlayer.research;
    });
}

const applyStars = (game: Game, history: GameHistory) => {
    game.galaxy.stars.forEach(star => {
        const histStar = history.stars.find(s => s.starId.toString() === star._id.toString());

        if (!histStar) {
            console.log(`Star ${star._id}/${star.name} not found in history`);

            return;
        }

        star.homeStar = histStar.homeStar
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
}

const applyWaypoints = (carrier: Carrier, histCarrier: GameHistoryCarrier) => {
    const historyWaypoint = histCarrier.waypoints[0];

    if (!historyWaypoint) {
        return;
    }

    carrier.waypoints = [{
        _id: objectId(),
        source: historyWaypoint.source,
        destination: historyWaypoint.destination,
        action: "nothing",
        actionShips: 0,
        delayTicks: 0
    }];
}

const applyCarriers = (game: Game, history: GameHistory) => {
    const removeCarriers = new Array<DBObjectId>();

    game.galaxy.carriers.forEach(carrier => {
        const histCarrier = history.carriers.find(c => c.carrierId.toString() === carrier._id.toString());

        if (!histCarrier) {
            console.log(`Carrier ${carrier._id}/${carrier.name} not found in history`);

            removeCarriers.push(carrier._id);
            return;
        }

        carrier.ships = histCarrier.ships;
        carrier.specialistId = histCarrier.specialistId
        carrier.ownedByPlayerId = histCarrier.ownedByPlayerId;
        carrier.name = histCarrier.name;
        carrier.location = histCarrier.location
        carrier.isGift = histCarrier.isGift;
        carrier.orbiting = histCarrier.orbiting;
        applyWaypoints(carrier, histCarrier);
    });

    game.galaxy.carriers = game.galaxy.carriers.filter(c => !removeCarriers.includes(c._id));
}

const applyHistory = (game: Game, history: GameHistory) => {
    applyGameState(game, history);
    applyPlayers(game, history);
    applyStars(game, history);
    applyCarriers(game, history);
}

const job = makeJob('Restore game', async ({ log, container, mongo }: JobParameters) => {
    const gameIdS = process.argv[2];
    const tick = Number.parseInt(process.argv[3]);

    if (!gameIdS || !tick) {
        throw new Error("Invalid arguments. Usage: npm run restore-game <gameId> <tick>");
    }

    const gameId = mongoose.Types.ObjectId(gameIdS) as DBObjectId;

    const hist = await loadHistory(container, gameId, tick);
    if (!hist) {
        throw new Error("History not found");
    }

    console.log("Loaded history entry");

    const currentState = await container.gameService.getByIdAll(gameId);
    if (!currentState) {
        throw new Error("Game not found");
    }

    log.info("Loaded current game state");

    applyHistory(currentState, hist);

    log.info("History applied");

    await currentState.save();

    log.info("Game state saved");
});

job();

export { };
