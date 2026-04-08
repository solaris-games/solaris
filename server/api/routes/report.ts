import { DependencyContainer } from "../../services/types/DependencyContainer";
import ReportController from '../controllers/report';
import { MiddlewareContainer } from "../middleware";
import { SingleRouter} from "../singleRoute";
import {createReportRoutes} from "solaris-common";
import {DBObjectId} from "../../services/types/DBObjectId";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller = ReportController(container);
    const routes = createReportRoutes<DBObjectId>();
    const answer = createRoutes(router, mw);

    answer(routes.createReport,
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