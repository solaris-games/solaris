import { Carrier } from "../../services/types/Carrier";
import { InitialGameState } from "../../services/types/InitialGameState";
import { Player } from "../../services/types/Player";
import { Star } from "../../services/types/Star";
import { JobParameters } from "../tool";

const mapPlayer = (player: Player): Player => {
    return {
        ...player,
        alias: 'Empty Slot',
        lastSeen: null,
        lastSeenIP: null,
        spectators: [],
        scheduledActions: [],
        isOpenSlot: true,
    };
};

const mapStar = (star: Star) => {
    return {
        ...star,
    };
};

const mapCarrier = (carrier: Carrier) => {
    return {
        ...carrier,
    };
};

export const migrateInitialGameState = async (ctx: JobParameters) => {
    const gameRepository = ctx.container.gameService.gameRepo;
    const log = ctx.log;

    const games = await gameRepository.find({
        'settings.general.type': { $ne: 'tutorial' },
        'state.startDate': { $eq: null },
    }, {
        _id: 1,
    });

    log.info(`${games.length} open games found...`);

    for (let slimGame of games) {
        const prevInitState = await ctx.container.initialGameStateService.getByGameId(slimGame._id);

        if (prevInitState) {
            continue;
        }

        const fullGame = (await ctx.container.gameService.getByIdAll(slimGame._id))!;
        
        const initialState: Omit<InitialGameState, '_id'> = {
            gameId: slimGame._id,
            galaxy: {
                stars: fullGame.galaxy.stars.map(mapStar),
                players: fullGame.galaxy.players.map(mapPlayer),
                carriers: fullGame.galaxy.carriers.map(mapCarrier),
            },
        };

        await ctx.container.initialGameStateService.initialGameStateRepo.insertOne(initialState);

        log.info(`Added initial game state for game ${fullGame.settings.general.name} (${fullGame._id.toString()})`);
    }

    log.info(`Migration completed`);
};
