import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import GameController from '../controllers/game';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';
import GameMiddleware from '../middleware/game';
import PlayerMiddleware from '../middleware/player';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);
    const mwGame = GameMiddleware(container);
    const mwPlayer = PlayerMiddleware(container);

    const controller = GameController(container, io);

    router.get('/api/game/defaultSettings',
        mwAuth.authenticate(),
        controller.getDefaultSettings,
        mwCore.handleError);

    router.get('/api/game/flux',
        mwAuth.authenticate(),
        controller.getFlux,
        mwCore.handleError);

    router.post('/api/game/',
        mwAuth.authenticate(),
        controller.create,
        mwCore.handleError);

    router.post('/api/game/tutorial',
        mwAuth.authenticate(),
        controller.createTutorial,
        mwCore.handleError);

    router.get('/api/game/:gameId/info',
        mwGame.loadGame({
            lean: true,
            settings: true,
            state: true,
            constants: true
        }),
        // TODO: This needs to utilise a response middleware function to map the game object to a response object.
        (req, res, next) => {
            try {
                if (req.game.settings.general.createdByUserId) {
                    req.game.settings.general.isGameAdmin = req.game.settings.general.createdByUserId.toString() === req.session.userId.toString();
                } else {
                    req.game.settings.general.isGameAdmin = false;
                }

                delete req.game.settings.general.password;

                next();
            } catch (err) {
                next(err);
            }
        },
        controller.detailInfo,
        mwCore.handleError);

    router.get('/api/game/:gameId/state',
        mwGame.loadGame({
            lean: true,
            state: true
        }),
        controller.detailState,
        mwCore.handleError);

    router.get('/api/game/:gameId/galaxy',
        controller.detailGalaxy,
        mwCore.handleError);

    router.get('/api/game/list/summary',
        controller.listSummary,
        mwCore.handleError);

    router.get('/api/game/list/official',
        controller.listOfficial,
        mwCore.handleError);

    router.get('/api/game/list/custom',
        controller.listCustom,
        mwCore.handleError);

    router.get('/api/game/list/inprogress',
        controller.listInProgress,
        mwCore.handleError);

    router.get('/api/game/list/completed',
        mwAuth.authenticate(),
        controller.listRecentlyCompleted,
        mwCore.handleError);

    router.get('/api/game/list/completed/user',
        mwAuth.authenticate(),
        controller.listMyCompleted,
        mwCore.handleError);

    router.get('/api/game/list/active',
        mwAuth.authenticate(),
        controller.listMyActiveGames,
        mwCore.handleError);

    router.get('/api/game/:gameId/intel',
        mwAuth.authenticate(),
        controller.getIntel,
        mwCore.handleError);

    router.put('/api/game/:gameId/join',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            galaxy: true,
            conversations: true,
            state: true,
            constants: true,
            quitters: true,
            afkers: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        controller.join,
        mwCore.handleError);

    router.put('/api/game/:gameId/quit',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            galaxy: true,
            conversations: true,
            state: true,
            constants: true,
            quitters: true,
            afkers: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.quit,
        mwCore.handleError);

    router.put('/api/game/:gameId/concedeDefeat',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true,
            quitters: true
        }),
        mwGame.validateGameState({
            isUnlocked: true,
            isInProgress: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.concede,
        mwCore.handleError);

    router.put('/api/game/:gameId/ready',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.ready,
        mwCore.handleError);

    router.put('/api/game/:gameId/readytocycle',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.readyToCycle,
        mwCore.handleError);

    router.put('/api/game/:gameId/notready',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.unready,
        mwCore.handleError);

    router.put('/api/game/:gameId/readyToQuit',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.readyToQuit,
        mwCore.handleError);

    router.put('/api/game/:gameId/notReadyToQuit',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        mwPlayer.validatePlayerState({ isPlayerUndefeated: true }),
        controller.unreadyToQuit,
        mwCore.handleError);

    router.get('/api/game/:gameId/notes',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: false,
            state: false,
            galaxy: true,
            constants: false
        }),
        mwPlayer.loadPlayer,
        controller.getNotes,
        mwCore.handleError);

    router.put('/api/game/:gameId/notes',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: true,
            settings: false,
            state: true,
            galaxy: true,
            constants: false
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        mwPlayer.loadPlayer,
        controller.saveNotes,
        mwCore.handleError);

    router.delete('/api/game/:gameId',
        mwAuth.authenticate(),
        mwGame.loadGame({
            lean: false,
            settings: true,
            state: true,
            galaxy: true,
            constants: true
        }),
        mwGame.validateGameState({
            isUnlocked: true
        }),
        controller.delete,
        mwCore.handleError);

    router.get('/api/game/:gameId/player/:playerId',
        mwGame.loadGame({
            lean: true,
            settings: true,
            'galaxy.players': true
        }),
        controller.getPlayerUser,
        mwCore.handleError);
        
    router.patch('/api/game/:gameId/player/touch',
        mwAuth.authenticate(),
        controller.touch,
        mwCore.handleError);

    return router;
}