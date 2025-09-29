import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import GameController from '../controllers/game';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import {createGameRoutes} from "solaris-common";
import {DBObjectId} from "../../services/types/DBObjectId";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const routes = createGameRoutes<DBObjectId>();
    const controller = GameController(container);
    const answer = createRoutes(router, mw);

    answer(routes.getDefaultSettings,
            controller.getDefaultSettings
    );

    answer(routes.getCurrentFlux,
            controller.getFlux
    );

    answer(routes.create,
            mw.auth.authenticate(),
            controller.create
    );

    answer(routes.createTutorial,
            mw.auth.authenticate(),
            controller.createTutorial
    );

    answer(routes.listTutorials,
        mw.auth.authenticate(),
        controller.listTutorials);
    
    answer(routes.detailInfo, 
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

    answer(routes.detailState,
            mw.game.loadGame({
                lean: true,
                state: true
            }),
            controller.detailState
    );

    answer(routes.detailGalaxy,
            controller.detailGalaxy
    );

    answer(routes.listSummary,
            controller.listSummary
    );

    answer(routes.listOfficial,
            controller.listOfficial
    );

    answer(routes.listCustom,
            controller.listCustom
    );

    answer(routes.listInProgress,
            controller.listInProgress
    );

    answer(routes.listRecentlyCompleted,
            mw.auth.authenticate(),
            controller.listRecentlyCompleted
    );

    answer(routes.listMyCompleted,
            mw.auth.authenticate(),
            controller.listMyCompleted
    );

    answer(routes.listActive,
            mw.auth.authenticate(),
            controller.listMyActiveGames
    );

    answer(routes.listMyOpen,
        mw.auth.authenticate(),
        controller.listMyOpenGames
    );

    answer(routes.listSpectating,
            mw.auth.authenticate(),
            controller.listSpectating
    );

    answer(routes.getIntel,
            mw.auth.authenticate(),
            controller.getIntel
    );

    answer(routes.join,
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

    answer(routes.quit,
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

    answer(routes.concedeDefeat,
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

    answer(routes.ready, 
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

    answer(routes.readyToCycle,
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

    answer(routes.notReady,
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

    answer(routes.readyToQuit,
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

    answer(routes.notReadyToQuit,
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

    answer(routes.getNotes,
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

    answer(routes.writeNotes,
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

    answer(routes.pause,
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

    answer(routes.forceStart,
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

    answer(routes.fastForward,
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

    answer(routes.kick,
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: false,
        }),
        mw.game.validateGameState({
            isUnlocked: true,
        }),
        controller.kickPlayer
    );

    answer(routes.getPlayerUser,
            mw.game.loadGame({
                lean: true,
                settings: true,
                'galaxy.players': true
            }),
            controller.getPlayerUser
    );

    answer(routes.touch,
            mw.auth.authenticate(),
            controller.touch
    );

    answer(routes.getStatistics,
        mw.auth.authenticate(),
        mw.game.loadGame({
            lean: true,
            'galaxy.players': true
        }),
        mw.player.loadPlayer,
        controller.getStatistics);

    return router;
}