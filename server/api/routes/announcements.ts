import {MiddlewareContainer} from "../middleware";
import {ExpressJoiInstance} from "express-joi-validation";
import {DependencyContainer} from "../../services/types/DependencyContainer";
import AnnouncementController from "../controllers/announcement";
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller =  AnnouncementController(container);

    router.get("/api/announcements/latest",
            controller.getLatestAnnouncement);

    router.get("/api/announcements/",
            controller.getCurrentAnnouncements);

    router.get("/api/announcements/state",
            mw.auth.authenticate(),
            controller.getAnnouncementState);

    router.patch("/api/announcements/state/markAsRead",
            mw.auth.authenticate(),
            controller.markAsRead)
}