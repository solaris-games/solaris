import mongoose, { ObjectId } from "mongoose";
import {DependencyContainer} from "../services/types/DependencyContainer";
import mongooseLoader from "./index";
import config from "../config";
import containerLoader from "../services";
import {DBObjectId} from "../services/types/DBObjectId";
import {Game} from "../services/types/Game";
import {Location} from "../services/types/Location";
import {GameHistory} from "../services/types/GameHistory";
import moment from "moment";

let mongo,
    container: DependencyContainer;

const generateCarrierMapping = (history: GameHistory) => {
    const carrierMapping = new Map<string, string>();

    for (let carrier of history.carriers) {
        carrierMapping.set(carrier.name.toString(), carrier.carrierId.toString());
    }

    return carrierMapping;
}

const generateCarrierPositions = (history: GameHistory) => {
    const carrierPositions = new Map<string, Location>();

    for (let carrier of history.carriers) {
        if (!carrier.orbiting) {
            carrierPositions.set(carrier.carrierId.toString(), carrier.location);
        }
    }

    return carrierPositions;
}

const analyzeHistory = async (game: Game) => {
    const histories: GameHistory[] = [];
    const lastTick = game.state.tick;

    for (let tick = 0; tick <= lastTick; tick++) {
        try {
            const hist = await container.historyService.getHistoryByTick(game._id, tick);

            if (hist) {
                histories.push(hist);
            }
        } catch (e) {
            console.error(`Error getting history for game ${game._id}/${game?.settings?.general?.name} at tick ${tick}: ${e}`);
        }
    }

    console.log(`Game ${game._id}/${game?.settings?.general?.name} has ${histories.length} history entries:`);

    let carrierMapping = new Map<string, string>();

    let carrierPositions = new Map<string, Location>();

    for (let history of histories) {
        const newCarrierMapping = generateCarrierMapping(history);

        for (let [carrierName, carrierId] of carrierMapping) {
            const newCarrierId = newCarrierMapping.get(carrierName);

            if (newCarrierId) {
                if (newCarrierId !== carrierId) {
                    console.log(`Tick ${history.tick}: Carrier ${carrierName} changed ID from ${carrierId} to ${newCarrierId}`);
                }
            }
        }

        carrierMapping = newCarrierMapping;

        const newCarrierPositions = generateCarrierPositions(history);

        for (let [carrierId, location] of carrierPositions) {
            const newLocation = newCarrierPositions.get(carrierId);

            if (newLocation) {
                if (newLocation.x === location.x || newLocation.y === location.y) {
                    const carrierName = history.carriers.find(c => c.carrierId.toString() === carrierId)?.name;

                    console.log(`Tick ${history.tick}: Carrier ${carrierId}/${carrierName} location did not change: ${location.x},${location.y}`);
                }
            }
        }

        carrierPositions = newCarrierPositions;
    }
}

const startup = async () => {
    mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1
    });

    container = containerLoader(config);

    let dbQuery = {
        'state.startDate': { $gt: moment().subtract(6, 'months').toDate() },
        'settings.general.type': { $ne: 'tutorial' }
    };

    let total = (await container.gameService.gameRepo.count(dbQuery));

    console.log(`Analyzing history for ${total} games...`);

    let page = 0;
    let pageSize = 10;
    let totalPages = Math.ceil(total / pageSize);

    do {
        let games = await container.gameService.gameRepo.find(dbQuery, {
                state: 1,
                settings: 1
            },
            { 'state.endDate': 1 },
            pageSize,
            pageSize * page);

        for (let game of games) {
            try {
                await analyzeHistory(game);
            } catch (err) {
                console.error(`Error analyzing game ${game._id}/${game.settings?.general?.name}: ${err}`);
            }
        }

        console.log(`Page ${page}/${totalPages}`);

        page++;
    } while (page <= totalPages);
};

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
