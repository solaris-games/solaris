import {DependencyContainer} from "../../services/types/DependencyContainer";

export default (container: DependencyContainer) => {
    return {
        getAnnouncementState: (req, res, next) => {

        },
        getLatestAnnouncement: (req, res, next) => {
            const announcement = await container.announcementService.getLatestAnnouncement();
            res.status(200).json(announcement);
            return next();
        },
        markAsRead: (req, res, next) => {

        },
        getAllAnnouncements: async (req, res, next) => {
            const announcements = await container.announcementService.getAllAnnouncements();
            res.status(200).json(announcements);
            return next();
        },
    }
}