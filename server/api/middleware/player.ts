import { ValidationError } from "solaris-common";
import { DependencyContainer } from "../../services/types/DependencyContainer";

export interface PlayerMiddleware {
    loadPlayer: (req: any, res: any, next: any) => void;
    validatePlayerState: (options: PlayerStateValidationOptions) => (req: any, res: any, next: any) => void;
}

export interface PlayerStateValidationOptions {
    isPlayerUndefeated?: boolean;
}

export const middleware = (container: DependencyContainer): PlayerMiddleware => {
    return {
        loadPlayer: (req, res, next) => {
            try {
                if (!req.game) {
                    throw new Error(`The game has not been loaded.`);
                }

                req.player = container.playerService.getByUserId(req.game, req.session.userId);

                if (!req.player) {
                    throw new ValidationError('You are not participating in this game.');
                }

                return next();
            } catch (err) {
                return next(err);
            }
        },
        validatePlayerState: (options: PlayerStateValidationOptions) => {
            return (req, res, next) => {
                if (options.isPlayerUndefeated && req.player.defeated) {
                    throw new ValidationError('You cannot participate in this game, you have been defeated.');
                }
    
                return next();
            }
        }
    }
};
