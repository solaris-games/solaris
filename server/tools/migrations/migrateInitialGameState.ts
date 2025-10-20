import { Carrier } from "../../services/types/Carrier";
import {InitialCarrier, InitialGameState, InitialPlayer, InitialStar} from "../../services/types/InitialGameState";
import { Player } from "../../services/types/Player";
import { Star } from "../../services/types/Star";
import { JobParameters } from "../tool";

const mapPlayer = (player: Player): InitialPlayer => {
    return {
        playerId: player._id,
        researchingNow: player.researchingNow,
        researchingNext: player.researchingNext,
        credits: player.credits,
        creditsSpecialists: player.creditsSpecialists,
        research: player.research,
        diplomacy: player.diplomacy,
    };
};

const mapStar = (star: Star): InitialStar => {
    return {
        starId: star._id,
        name: star.name,
        naturalResources: star.naturalResources,
        infrastructure: star.infrastructure,
        ships: star.ships,
        ownedByPlayerId: star.ownedByPlayerId,
        warpGate: star.warpGate,
        isNebula: star.isNebula,
        isAsteroidField: star.isAsteroidField,
        isBinaryStar: star.isBinaryStar,
        isBlackHole: star.isBlackHole,
        isPulsar: star.isPulsar,
        wormHoleToStarId: star.wormHoleToStarId,
        specialistId: star.specialistId,
        specialistExpireTick: star.specialistExpireTick,
    };
};

const mapCarrier = (carrier: Carrier): InitialCarrier => {
    return {
        carrierId: carrier._id,
        orbiting: carrier.orbiting,
        name: carrier.name,
        ownedByPlayerId: carrier.ownedByPlayerId!,
        ships: carrier.ships || 1,
        specialistId: carrier.specialistId,
        specialistExpireTick: carrier.specialistExpireTick,
        isGift: carrier.isGift,
        location: carrier.location,
        waypoints: carrier.waypoints,
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
