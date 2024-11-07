import crypto from 'crypto'
import {logger} from "../../utils/logging";

const log = logger("Mutex");

export class Mutex {
    static lastMutexId: number = 0;

    public id: number = 0;

    constructor() {
        this.id = ++Mutex.lastMutexId;
    }

    private currentPromise?: Promise<void>;
    private currentResolver?: (value: number | PromiseLike<number>) => boolean;

    /**
     * Returns a number for a value that can be used to release the lock when passed in to release().
     * */
    public async wait(): Promise<number> {
        let lockId: number = this.getLockId();

        let currentPromise: Promise<void> | undefined = this.currentPromise;

        if (currentPromise == null) {
            //console.log(`Mutex ${this.id}, locking ${lockId}`);

            this.currentPromise = new Promise<void>((resolve) => {
                this.currentResolver = (lockIdInput) => {
                    if (lockIdInput === lockId) {
                        resolve();
                        return true;
                    }
                    else {
                        log.warn(`Cannot unlock Mutex wiht id ${this.id} as lockId does not match.  Expected: ${lockId}, Actual: ${lockIdInput}`);
                    }

                    return false;
                }
            });

            return lockId;
        }
        else {
            //console.log(`Mutex ${this.id}, Awaiting (${lockId})`);
            await currentPromise;
            //console.log(`Mutex ${this.id}, Awaited.`);
            return await this.wait();
        }
    }

    public release(lockId: number): void {
        //console.log(`Mutex ${this.id}, releasing ${lockId}`);

        if (this.currentResolver?.(lockId)) {
            this.currentPromise = undefined;
            this.currentResolver = undefined;
        }
    }

    private getLockId(): number {
        let lockId = Number(`${new Date().getTime()}${crypto.randomInt(65535)}`);

        return lockId;
    }
}