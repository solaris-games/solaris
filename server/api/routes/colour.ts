import {MiddlewareContainer} from "../middleware";
import {DependencyContainer} from "../../services/types/DependencyContainer";
import {SingleRouter} from "../singleRoute";
import ColourController from '../controllers/colour';

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller = ColourController(container);

    router.put('/api/game/:gameId/colour/override',
        mw.auth.authenticate(),
        mw.playerMutex.wait(),
        mw.game.loadGame({
            lean: false,
            galaxy: true,
        }),
        mw.player.loadPlayer,
        mw.player.validatePlayerState({ isPlayerUndefeated: true }),
        controller.setColourOverride,
        mw.playerMutex.release()
    );

    router.get('/api/colour/list',
        mw.auth.authenticate(),
        controller.list
    );
}