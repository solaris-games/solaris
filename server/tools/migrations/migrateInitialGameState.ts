import { Carrier } from "../../services/types/Carrier";
import {InitialCarrier, InitialGameState, InitialPlayer, InitialStar} from "../../services/types/InitialGameState";
import { Player } from "../../services/types/Player";
import { Star } from "../../services/types/Star";
import { JobParameters } from "../tool";

const mapPlayer = (player: Player): InitialPlayer => {
    return {} as any as InitialPlayer;
};

const mapStar = (star: Star): InitialStar => {
    return {} as any as InitialStar;
};

const mapCarrier = (carrier: Carrier): InitialCarrier => {
    return {} as any as InitialCarrier;
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
        log.info(`Processing game ${slimGame._id}...`)

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
