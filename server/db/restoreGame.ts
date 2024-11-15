import {DependencyContainer} from "../services/types/DependencyContainer";
import mongooseLoader from "./index";
import config from "../config";
import containerLoader from "../services";
import mongoose, { ObjectId } from "mongoose";
import {DBObjectId, objectId} from "../services/types/DBObjectId";
import {GameHistory, GameHistoryCarrier} from "../services/types/GameHistory";
import {Game} from "../services/types/Game";
import {Carrier} from "../services/types/Carrier";

let mongo,
    container: DependencyContainer;

const loadHistory = async (gameId: DBObjectId, tick: number) => {
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

const startup = async () => {
    mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1
    });

    container = containerLoader(config);

    console.log("Initialised");

    const gameIdS = process.argv[2];
    const tick = Number.parseInt(process.argv[3]);

    if (!gameIdS || !tick) {
        throw new Error("Invalid arguments. Usage: npm run restore-game <gameId> <tick>");
    }

    const gameId = new mongoose.Types.ObjectId(gameIdS) as DBObjectId;

    const hist = await loadHistory(gameId, tick);
    if (!hist) {
        throw new Error("History not found");
    }

    console.log("Loaded history entry");

    const currentState = await container.gameService.getByIdAll(gameId);
    if (!currentState) {
        throw new Error("Game not found");
    }

    console.log("Loaded current game state");

    applyHistory(currentState, hist);

    console.log("History applied");

    await currentState.save();

    console.log("Game state saved");
}

process.on('SIGINT', async () => {
    await shutdown();
});

const shutdown = async () =>{
    console.log('Shutting down...');

    await mongo.disconnect();

    console.log('Shutdown complete.');

    process.exit();
}

startup().then(async () => {
    console.log('Done.');

    await shutdown();
}).catch(async err => {
    console.error(err);

    await shutdown();
});

export {};
