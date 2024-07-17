import { MutexLock } from "./MutexLock";

export interface GameMutexLock extends MutexLock {
    gameId: string
}