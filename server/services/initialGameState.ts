import {InitialCarrier, InitialGameState, InitialPlayer, InitialStar} from "./types/InitialGameState";
import Repository from "./repository";
import {DBObjectId} from "./types/DBObjectId";
import {Game} from "./types/Game";
import {Star} from "./types/Star";
import {Player} from "./types/Player";
import {Carrier} from "./types/Carrier";

export default class InitialGameStateService {
    initialGameStateRepo: Repository<InitialGameState>;

    constructor(initialGameStateRepo: Repository<InitialGameState>) {
        this.initialGameStateRepo = initialGameStateRepo;
    }

    async getByGameId(gameId: DBObjectId): Promise<InitialGameState | null> {
        return this.initialGameStateRepo.findOne({ gameId });
    }

    async storeStateFor(game: Game): Promise<void> {
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

        const state: Omit<InitialGameState, '_id'> = {
            gameId: game._id,
            galaxy: {
                stars: game.galaxy.stars.map(mapStar),
                players: game.galaxy.players.map(mapPlayer),
                carriers: game.galaxy.carriers.map(mapCarrier),
            },
        };

        await this.initialGameStateRepo.insertOne(state);
    }

    async deleteByGameId(gameId: DBObjectId): Promise<void> {
        await this.initialGameStateRepo.deleteMany({ gameId });
    }
}