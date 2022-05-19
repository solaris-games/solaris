import ValidationError from "../../errors/validation";
import { DependencyContainer } from "../../types/DependencyContainer";

export interface PlayerStateValidationOptions {
    isPlayerUndefeated?: boolean;
}

export default (container: DependencyContainer) => {
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

                next();
            } catch (err) {
                next(err);
            }
        },
        validatePlayerState: (options: PlayerStateValidationOptions) => {
            return (req, res, next) => {
                if (options.isPlayerUndefeated && req.player.defeated) {
                    throw new ValidationError('You cannot participate in this game, you have been defeated.');
                }
    
                next();
            }
        }
    }
};
