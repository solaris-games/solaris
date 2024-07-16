import { Mutex } from './types/Mutex';
import { MutexLock } from './types/MutexLock';

export default abstract class MutexService {

    private mutexes: { [key: string]: Mutex } = {};

    private getMutex(key: string) {
        let mutex: Mutex = this.mutexes[key];

        if (mutex == null) {
            mutex = new Mutex();
            this.mutexes[key] = mutex;
        }

        return mutex;
    }

    protected async acquireMutexLocksInternal(...futureMutexLocks: Partial<MutexLock>[]): Promise<MutexLock[]>;
    protected async acquireMutexLocksInternal<TMutexLock extends MutexLock>(...futureMutexLocks: Partial<MutexLock>[]): Promise<TMutexLock[]>;
    protected async acquireMutexLocksInternal<TMutexLock extends MutexLock>(...futureMutexLocks: Partial<MutexLock>[]): Promise<TMutexLock[] | MutexLock[]> {
        if (futureMutexLocks == null || futureMutexLocks.length === 0) {
            return [];
        }

        let mutexLocks: MutexLock[] = [];

        await Promise.all(futureMutexLocks.map(async futureMutexLock => {
            // If duplicate keys are present, don't try and lock them twice!
            if (mutexLocks.find(ml => ml.key === futureMutexLock) == null) {
                futureMutexLock.mutexLockId = await this.getMutex(futureMutexLock.key!).wait();
                mutexLocks.push(futureMutexLock as MutexLock);
            }
        }));

        return mutexLocks;
    }

    public async releaseMutexLocksInternal(...mutexLocks: MutexLock[]): Promise<void> {
        if (mutexLocks == null || mutexLocks.length === 0) {
            return;
        }

        await Promise.all(mutexLocks.map(mutexLock => this.getMutex(mutexLock.key).release(mutexLock.mutexLockId!)));

        // Should we be mutating the array we've passed in?
        mutexLocks.length = 0;
    }
}