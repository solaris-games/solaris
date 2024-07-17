import {Router} from "express";
import {MiddlewareContainer} from "../middleware";
import {ExpressJoiInstance} from "express-joi-validation";
import {DependencyContainer} from "../../services/types/DependencyContainer";
import AnnouncementController from "../controllers/announcement";
import {singleRoute} from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller =  AnnouncementController(container);

    router.get("/api/announcements/latest",
        ...singleRoute(
            controller.getLatestAnnouncement,
            mw.core.handleError));

    router.get("/api/announcements/",
        ...singleRoute(
            controller.getAllAnnouncements,
            mw.core.handleError));

    router.get("/api/announcements/unread",
        ...singleRoute(
            mw.auth.authenticate,
            controller.getUnreadAnnouncements,
            mw.core.handleError));

    router.get("/api/announcements/state",
        ...singleRoute(
            mw.auth.authenticate(),
            controller.getAnnouncementState,
            mw.core.handleError));

    router.patch("/api/announcements/state/markAsRead",
        ...singleRoute(
            mw.auth.authenticate(),
            controller.markAsRead,
            mw.core.handleError))
}