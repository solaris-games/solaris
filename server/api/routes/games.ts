import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import GameController from '../controllers/game';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = GameController(container);

    router.get('/api/game/defaultSettings',
            mw.auth.authenticate(),
            controller.getDefaultSettings
    );

    router.get('/api/game/flux',
            controller.getFlux
    );

    router.post('/api/game/',
            mw.auth.authenticate(),
            controller.create
    );

    router.post('/api/game/tutorial/:tutorialKey?',
            mw.auth.authenticate(),
            controller.createTutorial
    );

    router.get('/api/game/tutorial/list',
        controller.listTutorials);

    router.get('/api/game/:gameId/info',
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                constants: true
            }),
            // TODO: This needs to utilise a response middleware function to map the game object to a response object.
            async (req, res, next) => {
                try {
                    if (req?.game?.settings) {
                        req.game.settings.general.isGameAdmin = await container.gameAuthService.isGameAdmin(req.game, req.session.userId);

                        delete req.game.settings.general.password;
                    }

                    return next();
                } catch (err) {
                    return next(err);
                }
            },
            controller.detailInfo
    );

    router.get('/api/game/:gameId/state',
            mw.game.loadGame({
                lean: true,
                state: true
            }),
            controller.detailState
    );

    router.get('/api/game/:gameId/galaxy',
            controller.detailGalaxy
    );

    router.get('/api/game/list/summary',
            controller.listSummary
    );

    router.get('/api/game/list/official',
            controller.listOfficial
    );

    router.get('/api/game/list/custom',
            controller.listCustom
    );

    router.get('/api/game/list/inprogress',
            controller.listInProgress
    );

    router.get('/api/game/list/completed',
            mw.auth.authenticate(),
            controller.listRecentlyCompleted
    );

    router.get('/api/game/list/completed/user',
            mw.auth.authenticate(),
            controller.listMyCompleted
    );

    router.get('/api/game/list/active',
            mw.auth.authenticate(),
            controller.listMyActiveGames
    );

    router.get('/api/game/list/open',
        mw.auth.authenticate(),
        controller.listMyOpenGames
    );

    router.get('/api/game/list/spectating',
            mw.auth.authenticate(),
            controller.listSpectating
    );

    router.get('/api/game/:gameId/intel',
            mw.auth.authenticate(),
            controller.getIntel
    );

    router.put('/api/game/:gameId/join',
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
            controller.join
    );

    router.put('/api/game/:gameId/quit',
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
            mw.playerMutex.release(true),
    );

    router.put('/api/game/:gameId/concedeDefeat',
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
            mw.playerMutex.release(true)
    );

    router.put('/api/game/:gameId/ready',
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
            mw.playerMutex.release()
    );

    router.put('/api/game/:gameId/readytocycle',
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
            mw.playerMutex.release()
    );

    router.put('/api/game/:gameId/notready',
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
            mw.playerMutex.release()
    );

    router.put('/api/game/:gameId/readyToQuit',
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
            mw.playerMutex.release()
    );

    router.put('/api/game/:gameId/notReadyToQuit',
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
            mw.playerMutex.release()
    );

    router.get('/api/game/:gameId/notes',
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
            mw.playerMutex.release()
    );

    router.put('/api/game/:gameId/notes',
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
            mw.playerMutex.release()
    );

    router.delete('/api/game/:gameId',
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
            controller.delete
    );

    router.put('/api/game/:gameId/pause',
            mw.auth.authenticate(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                conversations: true,
                'galaxy.players': true,
            }),
            mw.game.validateGameState({
                isUnlocked: true,
                isInProgress: true
            }),
            controller.togglePaused
    );

    router.post('/api/game/:gameId/forcestart',
            mw.auth.authenticate(),
            mw.game.loadGame({
                lean: false,
            }),
            mw.game.validateGameState({
                isUnlocked: true,
                isInProgress: false
            }),
            controller.forceStart
    );

    router.post('/api/game/:gameId/fastforward',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: false,
        }),
        mw.game.validateGameState({
            isUnlocked: true,
            isInProgress: false
        }),
        controller.fastForward
    );

    router.post('/api/game/:gameId/kick',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: false,
        }),
        mw.game.validateGameState({
            isUnlocked: true,
        }),
        controller.kickPlayer
    );

    router.get('/api/game/:gameId/player/:playerId',
            mw.game.loadGame({
                lean: true,
                settings: true,
                'galaxy.players': true
            }),
            controller.getPlayerUser
    );

    router.patch('/api/game/:gameId/player/touch',
            mw.auth.authenticate(),
            controller.touch
    );

    return router;
}