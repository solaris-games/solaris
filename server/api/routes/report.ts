import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ReportController from '../controllers/report';
import { MiddlewareContainer } from "../middleware";
import { SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = ReportController(container);

    router.post('/api/game/:gameId/report',
            mw.auth.authenticate(),
            mw.playerMutex.wait(),
            mw.game.loadGame({
                lean: true,
                settings: true,
                'galaxy.players': true
            }),
            mw.player.loadPlayer,
            controller.create,
            mw.playerMutex.release()
    );

    return router;
}