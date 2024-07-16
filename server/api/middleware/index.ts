import { DependencyContainer } from "../../services/types/DependencyContainer";
import { AuthMiddleware, middleware as auth } from './auth';
import { CoreMiddleware, middleware as core } from './core';
import { GameMiddleware, middleware as game } from './game';
import { PlayerMiddleware, middleware as player } from './player';
import { PlayerMutexMiddleware, middleware as playerMutex } from "./playerMutex";

export interface MiddlewareContainer {
    core: CoreMiddleware,
    auth: AuthMiddleware,
    game: GameMiddleware,
    player: PlayerMiddleware,
    playerMutex: PlayerMutexMiddleware,
};

export default (container: DependencyContainer) => {
    return {
        core: core(container),
        auth: auth(container),
        game: game(container),
        player: player(container),
        playerMutex: playerMutex(container)
    };
};
