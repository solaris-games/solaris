import MutexService from './mutex';
import { Mutex } from './types/Mutex';
import { PlayerMutexLock } from './types/PlayerMutexLock';

export default class GamePlayerMutexService extends MutexService {

    private gameMutexes: { [id: string]: Mutex } = {};

    private buildMutexKey(gameId: string, playerId: string) {
        return `${gameId}-${playerId}`;
    }

    public async acquireMutexLock(gameId: string, playerId: string): Promise<PlayerMutexLock> {
        return (await this.acquireMutexLocks(gameId, [playerId]))?.[0];
    }

    public async acquireMutexLocks(gameId: string, playerIds: string[]): Promise<PlayerMutexLock[]> {
        if (gameId == null || playerIds == null || playerIds.length === 0) {
            return [];
        }

        let gameMutex: Mutex = this.getGameMutex(gameId);
        let gameMutexLockId: number = await gameMutex.wait();

        let playerMutexLocks: PlayerMutexLock[] = await this.acquireMutexLocksInternal<PlayerMutexLock>(...playerIds.map(playerId => { return { key: this.buildMutexKey(gameId, playerId), playerId: playerId } }));

        gameMutex.release(gameMutexLockId);

        return playerMutexLocks;
    }

    public async releaseMutexLock(gameId: string, playerMutexLock: PlayerMutexLock): Promise<void> {
        return await this.releaseMutexLocks(gameId, [playerMutexLock]);
    }

    public async releaseMutexLocks(gameId: string, playerMutexLocks: PlayerMutexLock[]): Promise<void> {
        if (gameId == null || playerMutexLocks == null || playerMutexLocks.length === 0) {
            return;
        }

        await this.releaseMutexLocksInternal(...playerMutexLocks);
    }

    // We acquire a mutex for the game so that when we're locking for multiple player ids, we do it as one atomic operation.
    // Otherwise, if you had, say, two different players clear each other's ledgers at the same time, you
    // could experience the following deadlock scenario:

    // Request 1 locks player A
    // Reuqest 2 locks player B
    // Request 1 waits for lock on player B
    // Request 2 waits for lock on player A
    //
    // This'd be bad. :P
    //
    // We don't worry about acquiring a mutex for the game when we're releasing locks for game player mutexes, as that
    // doesn't matter, and could in fact cause deadlocks as well.
    // Consider the following scenario:
    // Request 1 locks Game 1
    // Request 1 acquires player A mutex
    // Request 1 unlocks Game 1
    // Request 2 locks Game 1
    // Request 2 waits to acquire player A mutex to lock it.
    // Request 1 waits to acquire Game 1 mutex to release player A mutex.
    //
    // This would also be bad!
    private getGameMutex(gameId: string) {
        let mutex = this.gameMutexes[gameId];

        if (mutex == null) {
            mutex = new Mutex();
            this.gameMutexes[gameId] = mutex;
        }

        return mutex;
    }
}