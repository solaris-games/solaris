import { DBObjectId } from "../../services/types/DBObjectId";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import { Game } from "../../services/types/Game";
import { GameMutexLock } from "../../services/types/GameMutexLock";
import {logger} from "../../utils/logging";

const log = logger("Game Tick Job");

const tryTickGame = async (container: DependencyContainer, gameId: DBObjectId, signal: AbortSignal) => {
    let gameMutexLock: GameMutexLock | null = null;

    try {
        //console.log(`tryGameTick()!`);
        signal.addEventListener('abort', async () => {
            if (gameMutexLock != null) {
                await container.gameMutexService.releaseMutexLock(gameMutexLock);
            }
        });
        gameMutexLock = await container.gameMutexService.acquireMutexLock(gameId.toString());

        //console.log(`Mutex lock acquired: ${gameMutexLock}`);

        let game: Game | null = await container.gameService.getByIdLean(gameId, {
            _id: 1,
            state: 1,
            settings: 1,
            'galaxy.players': 1
        });

        if (game != null && container.gameTickService.canTick(game)) {
            try {
                signal.addEventListener('abort', async () => {
                    await container.gameLockService.lock(gameId, false);
                });
                await container.gameLockService.lock(gameId, true);
                await container.gameTickService.tick(gameId);
            } catch (e) {
                log.error(e, `Error in game ${game.settings.general.name} (${game._id})`);
            } finally {
                await container.gameLockService.lock(gameId, false);
            }
        }
    } catch (e) {
        log.error(e);
    } finally {
        //console.log(`tryTickGame() finished!`);
        //console.log(`Mutex lock: ${gameMutexLock}`);
        if (gameMutexLock != null) {
            await container.gameMutexService.releaseMutexLock(gameMutexLock);
        }
    }
}

export const gameTickJob = (container: DependencyContainer) => async (signal: AbortSignal) => {
    try {
        const gameIds: DBObjectId[] = (await container.gameListService.listInProgressGamesGameTick()).map(g => g._id);

        for (const gameId of gameIds) {
            if (signal.aborted) {
                return;
            }

            await tryTickGame(container, gameId, signal);
        }
    } catch (e) {
        log.error(e, "GameTick job threw unhandled: " + e);
    }
};
