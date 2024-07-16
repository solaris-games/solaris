import { Game } from "./Game";
import { Player } from "./Player";
import { PlayerMutexLock } from "./PlayerMutexLock";

export { };

declare global {
    namespace Express {
        interface Request {
            game?: Game;
            player?: Player;
            playerMutexLocks?: PlayerMutexLock[];
        }
    }
}