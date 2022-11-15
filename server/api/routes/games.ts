import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import GameController from '../controllers/game';
import { MiddlewareContainer } from "../middleware";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = GameController(container);

    router.get('/api/game/defaultSettings',
        mw.auth.authenticate(),
        controller.getDefaultSettings,
        mw.core.handleError);

    router.get('/api/game/flux',
        controller.getFlux,
        mw.core.handleError);

    router.post('/api/game/',
        mw.auth.authenticate(),
        controller.create,
        mw.core.handleError);

    router.post('/api/game/tutorial',
        mw.auth.authenticate(),
        controller.createTutorial,
        mw.core.handleError);

    router.get('/api/game/:gameId/info',
        mw.game.loadGame({
            lean: true,
            settings: true,
            state: true,
            constants: true
        }),
        // TODO: This needs to utilise a response middleware function to map the game object to a response object.
        (req, res, next) => {
            try {
                if (req.game.settings.general.createdByUserId) {
                    req.game.settings.general.isGameAdmin = req.game.settings.general.createdByUserId.toString() === req.session.userId?.toString();
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
        mw.core.handleError);

    router.get('/api/game/:gameId/state',
        mw.game.loadGame({
            lean: true,
            state: true
        }),
        controller.detailState,
        mw.core.handleError);

    router.get('/api/game/:gameId/galaxy',
        controller.detailGalaxy,
        mw.core.handleError);

    router.get('/api/game/list/summary',
        controller.listSummary,
        mw.core.handleError);

    router.get('/api/game/list/official',
        controller.listOfficial,
        mw.core.handleError);

    router.get('/api/game/list/custom',
        controller.listCustom,
        mw.core.handleError);

    router.get('/api/game/list/inprogress',
        controller.listInProgress,
        mw.core.handleError);

    router.get('/api/game/list/completed',
        mw.auth.authenticate(),
        controller.listRecentlyCompleted,
        mw.core.handleError);

    router.get('/api/game/list/completed/user',
        mw.auth.authenticate(),
        controller.listMyCompleted,
        mw.core.handleError);

    router.get('/api/game/list/active',
        mw.auth.authenticate(),
        controller.listMyActiveGames,
        mw.core.handleError);

    router.get('/api/game/list/spectating',
        mw.auth.authenticate(),
        controller.listSpectating,
        mw.core.handleError);

    router.get('/api/game/:gameId/intel',
        mw.auth.authenticate(),
        controller.getIntel,
        mw.core.handleError);

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
        controller.join,
        mw.core.handleError);

    router.put('/api/game/:gameId/quit',
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
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.quit,
        mw.core.handleError);

    router.put('/api/game/:gameId/concedeDefeat',
        mw.auth.authenticate(),
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
        mw.core.handleError);

    router.put('/api/game/:gameId/ready',
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
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.ready,
        mw.core.handleError);

    router.put('/api/game/:gameId/readytocycle',
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
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.readyToCycle,
        mw.core.handleError);

    router.put('/api/game/:gameId/notready',
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
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.unready,
        mw.core.handleError);

    router.put('/api/game/:gameId/readyToQuit',
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
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.readyToQuit,
        mw.core.handleError);

    router.put('/api/game/:gameId/notReadyToQuit',
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
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.unreadyToQuit,
        mw.core.handleError);

    router.get('/api/game/:gameId/notes',
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            settings: false,
            state: false,
            galaxy: true,
            constants: false
        }),
        mw.player.loadPlayer,
        controller.getNotes,
        mw.core.handleError);

    router.put('/api/game/:gameId/notes',
        mw.auth.authenticate(),
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
        mw.core.handleError);

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
        controller.delete,
        mw.core.handleError);

    router.get('/api/game/:gameId/player/:playerId',
        mw.game.loadGame({
            lean: true,
            settings: true,
            'galaxy.players': true
        }),
        controller.getPlayerUser,
        mw.core.handleError);
        
    router.patch('/api/game/:gameId/player/touch',
        mw.auth.authenticate(),
        controller.touch,
        mw.core.handleError);

    return router;
}