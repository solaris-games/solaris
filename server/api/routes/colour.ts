import {MiddlewareContainer} from "../middleware";
import {DependencyContainer} from "../../services/types/DependencyContainer";
import {SingleRouter} from "../singleRoute";
import ColourController from '../controllers/colour';
import {createColourRoutes} from "solaris-common";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller = ColourController(container);
    const routes = createColourRoutes();

    const answer = createRoutes(router, mw);

    answer(routes.addColour,
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

    answer(routes.listColours,
        controller.list,
    );
}