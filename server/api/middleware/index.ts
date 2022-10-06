import { DependencyContainer } from "../../services/types/DependencyContainer";
import { CoreMiddleware, middleware as core } from './core';
import { AuthMiddleware, middleware as auth } from './auth';
import { GameMiddleware, middleware as game } from './game';
import { PlayerMiddleware, middleware as player } from './player';

export interface MiddlewareContainer {
    core: CoreMiddleware,
    auth: AuthMiddleware,
    game: GameMiddleware,
    player: PlayerMiddleware
};

export default (container: DependencyContainer) => {
    return {
        core: core(),
        auth: auth(container),
        game: game(container),
        player: player(container)
    };
};
