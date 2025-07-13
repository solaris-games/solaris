import {MiddlewareContainer} from "../middleware";
import {ExpressJoiInstance} from "express-joi-validation";
import {DependencyContainer} from "../../services/types/DependencyContainer";
import AnnouncementController from "../controllers/announcement";
import {SingleRouter} from "../singleRoute";
import {createAnnouncementRoutes} from "solaris-common/dist/api/controllers/announcement";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller =  AnnouncementController(container);
    const routes = createAnnouncementRoutes();

    const answer = createRoutes(router, mw);

    answer(routes.getLatestAnnouncement, controller.getLatestAnnouncement);

    answer(routes.getCurrentAnnouncements, controller.getCurrentAnnouncements);

    answer(routes.getAnnouncementState,
            mw.auth.authenticate(),
            controller.getAnnouncementState);

    answer(routes.markAsRead,
            mw.auth.authenticate(),
            controller.markAsRead);
}