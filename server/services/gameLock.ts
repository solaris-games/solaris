import Repository from "./repository";
import {Game} from "./types/Game";
import {DBObjectId} from "./types/DBObjectId";

export default class GameLockService {
    gameRepo: Repository<Game>;

    constructor(gameRepo: Repository<Game>) {
        this.gameRepo = gameRepo;
    }

    async lock(gameId: DBObjectId, locked: boolean = true) {
        await this.gameRepo.updateOne({
            _id: gameId
        }, {
            $set: {
                'state.locked': locked
            }
        });
    }

    async isLockedInDatabase(gameId: DBObjectId): Promise<boolean> {
        const game = await this.gameRepo.findOne({
            _id: gameId
        }, {
            state: {
                locked: 1
            }
        });

        return Boolean(game?.state?.locked);
    }
}