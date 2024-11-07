import GameMutexService from "../services/gameMutex";
import { DBObjectId } from "../services/types/DBObjectId";
import { DependencyContainer } from "../services/types/DependencyContainer";
import { Game } from "../services/types/Game";
import { GameMutexLock } from "../services/types/GameMutexLock";
import {logger} from "../utils/logging";

const log = logger("Game Tick Job");

export default (container: DependencyContainer) => {

    const gameMutexService: GameMutexService = container.gameMutexService;

    async function tryTickGame(gameId: DBObjectId) {
        let gameMutexLock: GameMutexLock | null = null;

        try {
            //console.log(`tryGameTick()!`);
            gameMutexLock = await gameMutexService.acquireMutexLock(gameId.toString());
            //console.log(`Mutex lock acquired: ${gameMutexLock}`);

            let game: Game | null = await container.gameService.getByIdLean(gameId, {
                _id: 1,
                state: 1,
                settings: 1,
                'galaxy.players': 1
            });

            if (game != null && container.gameTickService.canTick(game)) {
                try {
                    if (game != null) {
                        await container.gameLockService.lock(gameId, true);
                        await container.gameTickService.tick(gameId);
                    }
                }
                catch (e) {
                    log.error(`Error in game ${game.settings.general.name} (${game._id})`, e);
                }
                finally {
                    await container.gameLockService.lock(gameId, false);
                }
            }
        }
        catch (e) {
            log.error(e);
        }
        finally {
            //console.log(`tryTickGame() finished!`);
            //console.log(`Mutex lock: ${gameMutexLock}`);
            if (gameMutexLock != null) {
                await gameMutexService.releaseMutexLock(gameMutexLock);
            }
        }
    }

    return {
        async handler(job, done) {
            try {
                let gameIds: DBObjectId[] = (await container.gameListService.listInProgressGamesGameTick()).map(g => g._id);

                await Promise.all(gameIds.map(gameId => tryTickGame(gameId)));

                done();
            } catch (e) {
                log.error("GameTick job threw unhandled: " + e, e);
            }
        }

    };
    
};
