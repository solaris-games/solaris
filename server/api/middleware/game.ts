import { DependencyContainer } from "../../services/types/DependencyContainer";
import { ValidationError } from "@solaris-common";

export interface GameMiddleware {
    loadGame: (options: GameLoadOptions) => (req: any, res: any, next: any) => Promise<any>;
    validateGameState: (options: GameStateValidationOptions) => (req: any, res: any, next: any) => void;
}

export interface GameLoadOptions {
    lean: boolean;
    settings?: boolean;
    galaxy?: boolean;
    conversations?: boolean;
    state?: boolean;
    constants?: boolean;
    quitters?: boolean;
    afkers?: boolean;
    'galaxy.players'?: boolean;
};

export interface GameStateValidationOptions {
    isUnlocked?: boolean;
    isInProgress?: boolean;
    isStarted?: boolean;
    isNotFinished?: boolean;
};

export const middleware = (container: DependencyContainer): GameMiddleware => {
    return {
        loadGame: (options: GameLoadOptions) => {
            return async (req, res, next) => {
                try {
                    if (req.params.gameId == null) {
                        throw new ValidationError(`Game ID is required.`);
                    }
    
                    let select = { };
    
                    for (const [key, value] of Object.entries(options)) {
                        if (value || value == null) { // If undefined/null, assume it is wanted.
                            select[key] = 1;
                        }
                    }
    
                    if (options.lean) {
                        req.game = await container.gameService.getByIdLean(req.params.gameId, select);
                    } else {
                        req.game = await container.gameService.getById(req.params.gameId, select);
                    }
    
                    if (!req.game) {
                        throw new ValidationError('Game not found.', 404);
                    }
    
                    return next();
                } catch (err) {
                    return next(err);
                }
            }
        },
        validateGameState: (options: GameStateValidationOptions) => {
            return (req, res, next) => {
                try {
                    if (options.isUnlocked && container.gameStateService.isLocked(req.game)) {
                        throw new ValidationError('You cannot perform this action, the game is locked by the system. Please try again.');
                    }
    
                    if (options.isInProgress && !container.gameStateService.isInProgress(req.game)) {
                        throw new ValidationError('You cannot perform this action, the game is not in progress.');
                    }
    
                    if (options.isStarted && !container.gameStateService.isStarted(req.game)) {
                        throw new ValidationError('You cannot perform this action, the game is not in progress.');
                    }
    
                    if (options.isNotFinished && container.gameStateService.isFinished(req.game)) {
                        throw new ValidationError('You cannot perform this action, the game is not in progress.');
                    }
    
                    return next();
                } catch (err) {
                    return next(err);
                }
            };
        }
    }
};
