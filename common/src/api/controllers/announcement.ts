import {SimpleGetRoute, SimplePatchRoute} from "./index";
import type {Announcement, AnnouncementState} from "../../types/common/announcement";

export const createAnnouncementRoutes = <ID>() => ({
    getLatestAnnouncement: new SimpleGetRoute<Announcement<ID> | null>("/api/announcements/latest"),
    getCurrentAnnouncements: new SimpleGetRoute<Announcement<ID>[]>("/api/announcements/"),
    getAnnouncementState: new SimpleGetRoute<AnnouncementState<ID>>("/api/announcements/state"),
    markAsRead: new SimplePatchRoute<null, null>("/api/announcements/state/markAsRead"),
});