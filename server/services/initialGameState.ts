import {InitialGameState} from "./types/InitialGameState";
import Repository from "./repository";
import {DBObjectId} from "./types/DBObjectId";
import {Game} from "./types/Game";

export default class InitialGameStateService {
    initialGameStateRepo: Repository<InitialGameState>;

    constructor(initialGameStateRepo: Repository<InitialGameState>) {
        this.initialGameStateRepo = initialGameStateRepo;
    }

    async getByGameId(gameId: DBObjectId): Promise<InitialGameState | null> {
        return this.initialGameStateRepo.findOne({ gameId });
    }

    async storeStateFor(game: Game): Promise<void> {
        const state: Omit<InitialGameState, '_id'> = {
            gameId: game._id,
            galaxy: {
                stars: game.galaxy.stars,
                players: game.galaxy.players,
                carriers: game.galaxy.carriers,
            },
        };

        await this.initialGameStateRepo.insertOne(state);
    }

    async deleteByGameId(gameId: DBObjectId): Promise<void> {
        await this.initialGameStateRepo.deleteMany({ gameId });
    }
}