import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import GameController from '../controllers/game';
import { MiddlewareContainer } from "../middleware";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = GameController(container);

    router.get('/api/game/defaultSettings',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.getDefaultSettings,
            mw.core.handleError)
    );

    router.get('/api/game/flux',
        ...singleRoute(
            controller.getFlux,
            mw.core.handleError)
    );

    router.post('/api/game/',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.create,
            mw.core.handleError)
    );

    router.post('/api/game/tutorial',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.createTutorial,
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/info',
        ...singleRoute(
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                constants: true
            }),
            // TODO: This needs to utilise a response middleware function to map the game object to a response object.
            async (req, res, next) => {
                try {
                    req.game.settings.general.isGameAdmin = await container.gameAuthService.isGameAdmin(req.game, req.session.userId);

                    delete req.game.settings.general.password;

                    return next();
                } catch (err) {
                    return next(err);
                }
            },
            controller.detailInfo,
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/state',
        ...singleRoute(
            mw.game.loadGame({
                lean: true,
                state: true
            }),
            controller.detailState,
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/galaxy',
        ...singleRoute(
            controller.detailGalaxy,
            mw.core.handleError)
    );

    router.get('/api/game/list/summary',
        ...singleRoute(
            controller.listSummary,
            mw.core.handleError)
    );

    router.get('/api/game/list/official',
        ...singleRoute(
            controller.listOfficial,
            mw.core.handleError)
    );

    router.get('/api/game/list/custom',
        ...singleRoute(
            controller.listCustom,
            mw.core.handleError)
    );

    router.get('/api/game/list/inprogress',
        ...singleRoute(
            controller.listInProgress,
            mw.core.handleError)
    );

    router.get('/api/game/list/completed',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.listRecentlyCompleted,
            mw.core.handleError)
    );

    router.get('/api/game/list/completed/user',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.listMyCompleted,
            mw.core.handleError)
    );

    router.get('/api/game/list/active',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.listMyActiveGames,
            mw.core.handleError)
    );

    router.get('/api/game/list/spectating',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.listSpectating,
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/intel',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.getIntel,
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/join',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.game.loadGame({
                lean: false,
                settings: true,
                galaxy: true,
                conversations: true,
                state: true,
                constants: true,
                quitters: true,
                afkers: true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            controller.join,
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/quit',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: false,
                settings: true,
                galaxy: true,
                conversations: true,
                state: true,
                constants: true,
                quitters: true,
                afkers: true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.quit,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/concedeDefeat',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: false,
                settings: true,
                state: true,
                galaxy: true,
                constants: true,
                quitters: true
            }),
            mw.game.validateGameState({
                isUnlocked: true,
                isInProgress: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.concede,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/ready',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.ready,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/readytocycle',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.readyToCycle,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/notready',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.unready,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/readyToQuit',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.readyToQuit,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/notReadyToQuit',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            mw.player.validatePlayerState({ isPlayerUndefeated: true }),
            controller.unreadyToQuit,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/notes',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: false,
                state: false,
                galaxy: true,
                constants: false
            }),
            mw.player.loadPlayer,
            controller.getNotes,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/notes',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: false,
                state: true,
                galaxy: true,
                constants: false
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            mw.player.loadPlayer,
            controller.saveNotes,
            mw.playerMutex.release(),
            mw.core.handleError)
    );

    router.delete('/api/game/:gameId',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                galaxy: true,
                constants: true
            }),
            mw.game.validateGameState({
                isUnlocked: true
            }),
            controller.delete,
            mw.core.handleError)
    );

    router.put('/api/game/:gameId/pause',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
            }),
            mw.game.validateGameState({
                isUnlocked: true,
                isInProgress: true
            }),
            controller.togglePaused,
            mw.core.handleError)
    );

    router.post('/api/game/:gameId/forcestart',
        ...singleRoute(
            mw.auth.authenticate(),
            mw.game.loadGame({
                lean: false,
            }),
            mw.game.validateGameState({
                isUnlocked: true,
                isInProgress: false
            }),
            controller.forceStart,
            mw.core.handleError)
    );

    router.get('/api/game/:gameId/player/:playerId',
        ...singleRoute(
            mw.game.loadGame({
                lean: true,
                settings: true,
                'galaxy.players': true
            }),
            controller.getPlayerUser,
            mw.core.handleError)
    );

    router.patch('/api/game/:gameId/player/touch',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.touch,
            mw.core.handleError)
    );

    return router;
}