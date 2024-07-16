import MutexService from './mutex';
import { GameMutexLock } from './types/GameMutexLock';

export default class GameMutexService extends MutexService {

    public async acquireMutexLock(gameId: string): Promise<GameMutexLock | null> {
        if (gameId == null) {
            return null;
        }

        return (await this.acquireMutexLocks([gameId]))?.[0];
    }

    public async acquireMutexLocks(gameIds: string[]): Promise<GameMutexLock[]> {
        if (gameIds == null || gameIds.length === 0) {
            return [];
        }

        let gameMutexLocks: GameMutexLock[] = await this.acquireMutexLocksInternal<GameMutexLock>(...gameIds.map(gameId => { return { key: gameId, gameId: gameId }}));

        return gameMutexLocks;
    }

    public async releaseMutexLock(gameMutexLock: GameMutexLock): Promise<void> {
        if (gameMutexLock == null) {
            return;
        }

        return await this.releaseMutexLocks([gameMutexLock])
    }

    public async releaseMutexLocks(gameMutexLocks: GameMutexLock[]): Promise<void> {
        if (gameMutexLocks == null || gameMutexLocks.length === 0) {
            return;
        }

        await this.releaseMutexLocksInternal(...gameMutexLocks);
    }
}