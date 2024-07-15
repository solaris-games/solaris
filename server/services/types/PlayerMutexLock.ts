import { MutexLock } from "./MutexLock";

export interface PlayerMutexLock extends MutexLock {
    playerId: string
}