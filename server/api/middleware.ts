import ValidationError from '../errors/validation';
import { DependencyContainer } from '../types/DependencyContainer';

export default (container: DependencyContainer) => {

    return {
        async authenticate(req, res, next) {
            try {
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
            } catch (err) {
                next(err);
            }
        },

        async authenticateAdmin(req, res, next) {
            try {
                if (!req.session.userId) {
                    return res.sendStatus(401);
                }

                let isAdmin = await container.userService.getUserIsAdmin(req.session.userId);

                if (!isAdmin) {
                    throw new ValidationError(`The account is not an administrator.`, 401);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async authenticateSubAdmin(req, res, next) {
            try {
                if (!req.session.userId) {
                    return res.sendStatus(401);
                }

                let isAdmin = await container.userService.getUserIsSubAdmin(req.session.userId);

                if (!isAdmin) {
                    throw new ValidationError(`The account is not a sub administrator.`, 401);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async authenticateCommunityManager(req, res, next) {
            try {
                if (!req.session.userId) {
                    return res.sendStatus(401);
                }

                let isAdmin = await container.userService.getUserIsCommunityManager(req.session.userId);

                if (!isAdmin) {
                    throw new ValidationError(`The account is not a community manager.`, 401);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        handleError(err, req, res, next) {
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

        async loadGame(req, res, next) {
            try {
                req.game = await container.gameService.getByIdGalaxy(req.params.gameId);

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGameLean(req, res, next) {
            try {
                req.game = await container.gameService.getByIdGalaxyLean(req.params.gameId);

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGameAll(req, res, next) {
            try {
                req.game = await container.gameService.getByIdAll(req.params.gameId);

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGameInfo(req, res, next) {
            try {
                req.game = await container.gameService.getByIdInfo(req.params.gameId, req.session.userId);

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                delete req.game.settings.general.password;

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGameState(req, res, next) {
            try {
                req.game = await container.gameService.getByIdState(req.params.gameId, req.session.userId);

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGameMessages(req, res, next) {
            try {
                req.game = await container.gameService.getByIdMessages(req.params.gameId);

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGameMessagesLean(req, res, next) {
            try {
                req.game = await container.gameService.getByIdMessagesLean(req.params.gameId);

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGameConversations(req, res, next) {
            try {
                req.game = await container.gameService.getByIdConversations(req.params.gameId);

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                return next();
            } catch(err) {
                next(err);
            }
        },

        async loadGameConversationsLean(req, res, next) {
            try {
                req.game = await container.gameService.getByIdConversationsLean(req.params.gameId);

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGameDiplomacyLean(req, res, next) {
            try {
                req.game = await container.gameService.getByIdDiplomacyLean(req.params.gameId);

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGamePlayers(req, res, next) {
            try {
                req.game = await container.gameService.getByIdLean(req.params.gameId, {
                    'galaxy.players': 1,
                    'settings': 1
                });

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGamePlayersState(req, res, next) {
            try {
                req.game = await container.gameService.getByIdLean(req.params.gameId, {
                    'galaxy.players': 1,
                    'state': 1
                });

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        async loadGamePlayersSettingsState(req, res, next) {
            try {
                req.game = await container.gameService.getByIdLean(req.params.gameId, {
                    'settings': 1,
                    'galaxy.players': 1,
                    'state': 1
                });

                if (!req.game) {
                    throw new ValidationError('Game not found.', 404);
                }

                next();
            } catch(err) {
                next(err);
            }
        },

        loadPlayer(req, res, next) {
            let player = container.playerService.getByUserId(req.game, req.session.userId);

            if (!player) {
                throw new ValidationError('You are not participating in this game.');
            }

            req.player = player;

            next();
        },

        validateGameLocked(req, res, next) {
            if (container.gameStateService.isLocked(req.game)) {
                throw new ValidationError('You cannot perform this action, the game is locked by the system. Please try again.');
            }

            next();
        },

        validateUndefeatedPlayer(req, res, next) {
            if (req.player.defeated) {
                throw new ValidationError('You cannot participate in this game, you have been defeated.');
            }

            next();
        },

        // TODO: Does this need a rework because games can be waiting to start?
        validateGameInProgress(req, res, next) {
            if (!container.gameStateService.isInProgress(req.game)) {
                throw new ValidationError('You cannot perform this action, the game is not in progress.');
            }

            next();
        },

        // TODO: Does this need a rework because games can be waiting to start?
        validateGameStarted(req, res, next) {
            if (!container.gameStateService.isStarted(req.game)) {
                throw new ValidationError('You cannot perform this action, the game has not yet started.');
            }

            next();
        },

        validateGameNotFinished(req, res, next) {
            if (container.gameStateService.isFinished(req.game)) {
                throw new ValidationError('You cannot perform this action, the game is over.');
            }

            next();
        },

        validateStarIdBody(req, res, next) {
            try {
                let errors: string[] = [];
        
                if (!req.body.starId) {
                    errors.push('starId is required.');
                }
        
                if (errors.length) {
                    throw new ValidationError(errors);
                }
        
                next();
            } catch(err) {
                next(err);
            }
        }
    }

};
