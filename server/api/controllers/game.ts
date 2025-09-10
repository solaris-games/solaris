import { Request } from 'express';
import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../services/types/DependencyContainer';
import { logger } from "../../utils/logging";
import {
    customGalaxyValidator,
    mapToGameConcedeDefeatRequest,
    mapToGameSaveNotesRequest,
    parseGameJoinGameRequest, parseGameSettingsReq,
    parseKickPlayerRequest
} from '../requests/game';
import {Player} from "../../services/types/Player";

const log = logger("Game Controller");

export default (container: DependencyContainer) => {
    return {
        getDefaultSettings: (req, res, next) => {
            res.status(200).json({
                settings: require('../../config/game/settings/user/standard.json'),
                options: require('../../config/game/settings/options.json')
            });

            return next();
        },
        getFlux: async (req, res, next) => {
            try {
                const flux = container.gameFluxService.getCurrentFlux();
    
                res.status(200).json(flux);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        create: async (req, res, next) => {
            const settings = parseGameSettingsReq(req.body);

            try {
                // If this is a custom galaxy, validate the JSON.
                // TODO: This should probably be moved to the game create request validation once it is implemented.
                // if (req.body.galaxy.galaxyType === 'custom') {
                //     const customGalaxy = JSON.parse(req.body.galaxy.customJSON!);
                //     req.body.galaxy.customGalaxy = customGalaxyValidator(customGalaxy);
                // }
                
                let game = await container.gameCreateService.create(settings, req.session.userId);
    
                res.status(201).json(game._id);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        createTutorial: async (req, res, next) => {
            try {
                const tutorial = container.tutorialService.getByKey(req.params.tutorialKey);
                let game = await container.gameListService.getUserTutorial(req.session.userId, tutorial.key);
    
                if (!game) {
                    const path = '../../config/game/settings/user/' + tutorial.file;
                    const settings = require(path);

                    game = await container.gameCreateService.create(settings, req.session.userId);
                }
    
                res.status(201).json(game._id);
                return next();
            } catch (err) {
                log.error(err);
                return next(err);
            }
        },
        detailInfo: async (req, res, next) => {
            try {
                res.status(200).json(container.gameService.getDetailInfo(req.game));
                return next();
            } catch (err) {
                return next(err);
            }
        },
        detailState: async (req, res, next) => {
            try {
                res.status(200).json(container.gameService.getState(req.game));
                return next();
            } catch (err) {
                return next(err);
            }
        },
        detailGalaxy: async (req, res, next) => {
            try {
                let tick = +req.query.tick || null;
        
                if (tick != null && tick < 0) {
                    throw new ValidationError(`Tick must be greater or equal to 0.`);
                }
        
                let game = await container.gameGalaxyService.getGalaxy(req.params.gameId, req.session.userId, tick);
    
                res.status(200).json(game);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listSummary: async (req, res, next) => {
            try {
                const games = await Promise.all([
                    container.gameListService.listJoinableGames(),
                    container.gameListService.listInProgressGames(),
                    container.gameListService.listRecentlyCompletedGames()
                ])
                
                let result = {
                    official: games[0].official,
                    user: games[0].custom,
                    inProgress: games[1],
                    completed: games[2]
                };
    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listOfficial: async (req, res, next) => {
            try {
                let games = await container.gameListService.listOfficialGames();
    
                res.status(200).json(games);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listCustom: async (req, res, next) => {
            try {
                let games = await container.gameListService.listCustomGames();
    
                res.status(200).json(games);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listInProgress: async (req, res, next) => {
            try {
                let games = await container.gameListService.listInProgressGames();
    
                res.status(200).json(games);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listRecentlyCompleted: async (req, res, next) => {
            try {
                let games = await container.gameListService.listRecentlyCompletedGames();
    
                res.status(200).json(games);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listMyCompleted: async (req, res, next) => {
            try {
                let games = await container.gameListService.listUserCompletedGames(req.session.userId);
    
                res.status(200).json(games);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listMyActiveGames: async (req, res, next) => {
            try {
                let games = await container.gameListService.listActiveGames(req.session.userId);
    
                res.status(200).json(games);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listMyOpenGames: async (req, res, next) => {
            try {
                let games = await container.gameListService.listOpenGames(req.session.userId);

                res.status(200).json(games);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listSpectating: async (req, res, next) => {
            try {
                let games = await container.gameListService.listSpectating(req.session.userId);
    
                res.status(200).json(games);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listTutorials: async (req, res, next) => {
            try {
                const tutorials = container.tutorialService.listAllTutorials();
                const completed = await container.userService.listTutorialsCompleted(req.session.userId);
                tutorials.forEach(t => {
                    t.completed = completed.includes(t.key)
                })
                return res.status(200).json(tutorials);
            } catch (err) {
                return next(err);
            }
        },
        getIntel: async (req, res, next) => {
            try {
                let startTick = +req.query.startTick || 0;
                let endTick = +req.query.endTick || Number.MAX_VALUE;
                
                let result = await container.historyService.listIntel(req.params.gameId, startTick, endTick);
    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        join: async (req, res, next) => {
            try {
                const reqObj = parseGameJoinGameRequest(req.body);
                
                let gameIsFull = await container.gameJoinService.join(
                    req.game,
                    req.session.userId,
                    reqObj.playerId,
                    reqObj.alias,
                    reqObj.avatar,
                    reqObj.password);
    
                res.sendStatus(200);
    
                container.broadcastService.gamePlayerJoined(req.game, reqObj.playerId, reqObj.alias, reqObj.avatar);
    
                if (gameIsFull) {
                    container.broadcastService.gameStarted(req.game);
                }

                return next();
            } catch (err) {
                return next(err);
            }
        },
        quit: async (req, res, next) => {
            try {
                let player = await container.gameService.quit(
                    req.game,
                    req.player);
    
                res.sendStatus(200);
                    
                if (player) {
                    container.broadcastService.gamePlayerQuit(req.game, player);
                }

                return next();
            } catch (err) {
                return next(err);
            }
        },
        concede: async (req, res, next) => {
            try {
                const reqObj = mapToGameConcedeDefeatRequest(req.body);

                await container.gameService.concedeDefeat(
                    req.game,
                    req.player,
                    reqObj.openSlot);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        ready: async (req, res, next) => {
            try {
                await container.playerReadyService.declareReady(
                    req.game,
                    req.player);
                
                res.sendStatus(200);
    
                container.broadcastService.gamePlayerReady(req.game, req.player);

                return next();
            } catch (err) {
                return next(err);
            }
        },
        readyToCycle: async (req, res, next) => {
            try {
                await container.playerReadyService.declareReadyToCycle(
                    req.game,
                    req.player);
                
                res.sendStatus(200);
    
                container.broadcastService.gamePlayerReady(req.game, req.player);

                return next();
            } catch (err) {
                return next(err);
            }
        },
        unready: async (req, res, next) => {
            try {
                await container.playerReadyService.undeclareReady(
                    req.game,
                    req.player);
    
                res.sendStatus(200);
                    
                container.broadcastService.gamePlayerNotReady(req.game, req.player);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        readyToQuit: async (req: Request, res, next) => {
            try {
                await container.playerReadyService.declareReadyToQuit(
                    req.game!,
                    req.player!);
                
                res.sendStatus(200);

                if (req.game!.settings.general.readyToQuitVisibility !== 'hidden') {
                    container.broadcastService.gamePlayerReadyToQuit(req.game!, req.game!.settings.general.readyToQuitVisibility === 'visible' ? req.player! : null);
                }

                return next();
            } catch (err) {
                return next(err);
            }
        },
        unreadyToQuit: async (req: Request, res, next) => {
            try {
                await container.playerReadyService.undeclareReadyToQuit(
                    req.game!,
                    req.player!);
    
                res.sendStatus(200);

                if (req.game!.settings.general.readyToQuitVisibility !== 'hidden') {
                    container.broadcastService.gamePlayerNotReadyToQuit(req.game!, req.game!.settings.general.readyToQuitVisibility === 'visible' ? req.player! : null);
                }

                return next();
            } catch (err) {
                return next(err);
            }
        },
        getNotes: async (req, res, next) => {
            try {
                let notes = await container.playerService.getGameNotes(
                    req.game,
                    req.player);
                
                res.status(200).json({ notes });
                return next();
            } catch (err) {
                return next(err);
            }
        },
        saveNotes: async (req, res, next) => {
            try {
                const reqObj = mapToGameSaveNotesRequest(req.body);

                await container.playerService.updateGameNotes(
                    req.game,
                    req.player,
                    reqObj.notes);
                
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        delete: async (req, res, next) => {
            try {
                await container.gameService.delete(
                    req.game,
                    req.session.userId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        togglePaused: async (req, res, next) => {
            try {
                const doPause = req.body?.pause;

                if (doPause === null || doPause === undefined) {
                    throw new ValidationError('Pause parameter is required.');
                }

                await container.gameService.setPauseState(
                    req.game,
                    doPause,
                    req.session.userId);

                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        forceStart: async (req, res, next) => {
            try {
                await container.gameService.forceStart(req.game, req.session.userId, Boolean(req.query.withOpenSlots));

                res.sendStatus(200);
                return next();
            }  catch (err) {
                return next(err);
            }
        },
        fastForward: async (req, res, next) => {
            try {
                await container.gameService.fastForward(req.game, req.session.userId);

                res.sendStatus(200);
                return next();
            }  catch (err) {
                return next(err);
            }
        },
        kickPlayer: async (req, res, next) => {
            try {
                const params = parseKickPlayerRequest(req.body);

                await container.gameService.kickPlayer(req.game, req.session.userId, params.playerId);

                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        getPlayerUser: async (req, res, next) => {
            try {
                let user = await container.gameService.getPlayerUser(
                    req.game,
                    req.params.playerId
                );
    
                res.status(200).json(user);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        touch: async (req, res, next) => {
            try {
                let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
                if (!req.session.isImpersonating) {
                    await container.playerService.updateLastSeenLean(req.params.gameId, req.session.userId, ip);
                }
                
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        getStatistics: async (req, res, next) => {
            try {
                const player: Player = req.player;

                if (!player) {
                    throw new ValidationError("Player not found in the game.");
                }

                if (player._id.toString() !== req.params.playerId) {
                    throw new ValidationError("You can only access your own statistics.", 403);
                }

                const statistics = await container.statisticsService.getStatisticsForGame(req.params.gameId, req.params.playerId);

                if (!statistics) {
                    throw new ValidationError("Statistics not found for this game or player.", 404);
                }

                res.status(200).json(statistics);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
