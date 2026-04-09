import {MiddlewareContainer} from "../middleware";
import {DependencyContainer} from "../../services/types/DependencyContainer";
import AnnouncementController from "../controllers/announcement";
import {SingleRouter} from "../singleRoute";
import {createAnnouncementRoutes} from "@solaris/common";
import {createRoutes} from "../typedapi/routes";
import {DBObjectId} from "../../services/types/DBObjectId";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller =  AnnouncementController(container);
    const routes = createAnnouncementRoutes<DBObjectId>();

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