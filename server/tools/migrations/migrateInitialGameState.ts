import { Carrier } from "../../services/types/Carrier";
import { InitialGameState } from "../../services/types/InitialGameState";
import { Player } from "../../services/types/Player";
import { Star } from "../../services/types/Star";
import { JobParameters } from "../tool";

const mapPlayer = (player: Player): Player => {
    return {
        alias: 'Empty Slot',
        lastSeen: null,
        lastSeenIP: null,
        spectators: [],
        scheduledActions: [],
        isOpenSlot: true,
        userId: null,
        avatar: null,
        colour: player.colour,
        shape: player.shape,
        researchingNow: player.researchingNow,
        researchingNext: player.researchingNext,
        defeated: false,
        credits: player.credits,
        creditsSpecialists: player.creditsSpecialists,
        defeatedDate: null,
        afk: false,
        renownToGive: player.renownToGive,
        ready: false,
        readyToCycle: false,
        missedTurns: 0,
        hasSentTurnReminder: false,
        hasFilledAfkSlot: false,
        research: player.research,
        ledger: player.ledger,
        reputations: player.reputations,
        diplomacy: player.diplomacy,
        homeStarId: player.homeStarId,
    } as any as Player;
};

const mapStar = (star: Star): Star => {
    return {
        name: star.name,
        naturalResources: star.naturalResources,
        ships: star.ships,
        specialistId: null,
        specialistExpireTick: null,
        homeStar: star.homeStar,
        warpGate: star.warpGate,
        isNebula: star.isNebula,
        isAsteroidField: star.isAsteroidField,
        isBinaryStar: star.isBinaryStar,
        isBlackHole: star.isBlackHole,
        isPulsar: star.isPulsar,
        wormHoleToStarId: star.wormHoleToStarId,
        infrastructure: star.infrastructure,
        ownedByPlayerId: star.ownedByPlayerId,
        location: star.location,
    } as any as Star;
};

const mapCarrier = (carrier: Carrier): Carrier => {
    return {
        name: carrier.name,
        location: carrier.location,
        waypoints: [],
        waypointsLooped: false,
        orbiting: carrier.orbiting,
        ships: carrier.ships,
        specialistId: null,
        specialistExpireTick: null,
        specialist: null,
        isGift: false,
        locationNext: null,
        ownedByPlayerId: carrier.ownedByPlayerId,
    } as any as Carrier;
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
