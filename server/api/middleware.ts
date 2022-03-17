import ValidationError from '../errors/validation';
import { DependencyContainer } from '../types/DependencyContainer';

export default (container: DependencyContainer) => {

    return {
        async authenticate(req: any, res: any, next: any) {
            if (!req.session.userId) {
                return res.sendStatus(401);
            }

            let isBanned = await container.userService.getUserIsBanned(req.session.userId);

            if (isBanned && !req.session.isImpersonating) {
                throw new ValidationError(`The account is banned.`, 401);
            }

            if (!req.session.isImpersonating) {
                await container.userService.updateLastSeen(req.session.userId, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
            }

            next();
        },

        async authenticateAdmin(req: any, res: any, next: any) {
            if (!req.session.userId) {
                return res.sendStatus(401);
            }

            let isAdmin = await container.userService.getUserIsAdmin(req.session.userId);

            if (!isAdmin) {
                throw new ValidationError(`The account is not an administrator.`, 401);
            }

            next();
        },

        async authenticateSubAdmin(req: any, res: any, next: any) {
            if (!req.session.userId) {
                return res.sendStatus(401);
            }

            let isAdmin = await container.userService.getUserIsSubAdmin(req.session.userId);

            if (!isAdmin) {
                throw new ValidationError(`The account is not a sub administrator.`, 401);
            }

            next();
        },

        async authenticateCommunityManager(req: any, res: any, next: any) {
            if (!req.session.userId) {
                return res.sendStatus(401);
            }

            let isAdmin = await container.userService.getUserIsCommunityManager(req.session.userId);

            if (!isAdmin) {
                throw new ValidationError(`The account is not a community manager.`, 401);
            }

            next();
        },

        handleError(err: any, req: any, res: any, next: any) {
            // If there is an error in the pipleline
            // then test to see what type of error it is. If its a validation
            // error then return it with its status code.
            if (err instanceof ValidationError) {
            // if (err instanceof ValidationError) {
                let errors: string | string[] = err.message;

                if (!Array.isArray(errors)) {
                    errors = [errors];
                }

                return res.status(err.statusCode).json({
                    errors
                });
            }

            console.error(err.stack);

            return res.status(500).json({
                errors: ['Something broke. If the problem persists, please contact a developer.']
            });
        },

        async loadGame(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdGalaxy(req.params.gameId);

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGameLean(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdGalaxyLean(req.params.gameId);

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGameAll(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdAll(req.params.gameId);

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGameInfo(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdInfo(req.params.gameId, req.session.userId);

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            delete req.game.settings.general.password;

            return next();
        },

        async loadGameState(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdState(req.params.gameId, req.session.userId);

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGameMessages(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdMessages(req.params.gameId);

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGameMessagesLean(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdMessagesLean(req.params.gameId);

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGameConversations(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdConversations(req.params.gameId);

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGameConversationsLean(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdConversationsLean(req.params.gameId);

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGameDiplomacyLean(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdDiplomacyLean(req.params.gameId);

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGamePlayers(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdLean(req.params.gameId, {
                'galaxy.players': 1,
                'settings': 1
            });

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGamePlayersState(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdLean(req.params.gameId, {
                'galaxy.players': 1,
                'state': 1
            });

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadGamePlayersSettingsState(req: any, res: any, next: any) {
            req.game = await container.gameService.getByIdLean(req.params.gameId, {
                'settings': 1,
                'galaxy.players': 1,
                'state': 1
            });

            if (!req.game) {
                throw new ValidationError('Game not found.', 404);
            }

            return next();
        },

        async loadPlayer(req: any, res: any, next: any) {
            let player = container.playerService.getByUserId(req.game, req.session.userId);

            if (!player) {
                throw new ValidationError('You are not participating in this game.');
            }

            req.player = player;

            return next();
        },

        validateGameLocked(req: any, res: any, next: any) {
            if (container.gameStateService.isLocked(req.game)) {
                throw new ValidationError('You cannot perform this action, the game is locked by the system. Please try again.');
            }

            return next();
        },

        validateUndefeatedPlayer(req: any, res: any, next: any) {
            if (req.player.defeated) {
                throw new ValidationError('You cannot participate in this game, you have been defeated.');
            }

            return next();
        },

        // TODO: Does this need a rework because games can be waiting to start?
        validateGameInProgress(req: any, res: any, next: any) {
            if (!container.gameStateService.isInProgress(req.game)) {
                throw new ValidationError('You cannot perform this action, the game is not in progress.');
            }

            return next();
        },

        // TODO: Does this need a rework because games can be waiting to start?
        validateGameStarted(req: any, res: any, next: any) {
            if (!container.gameStateService.isStarted(req.game)) {
                throw new ValidationError('You cannot perform this action, the game has not yet started.');
            }

            return next();
        },

        validateGameNotFinished(req: any, res: any, next: any) {
            if (container.gameStateService.isFinished(req.game)) {
                throw new ValidationError('You cannot perform this action, the game is over.');
            }

            return next();
        }
    }

};
