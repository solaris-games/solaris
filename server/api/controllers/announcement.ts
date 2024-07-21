import {DependencyContainer} from "../../services/types/DependencyContainer";

export default (container: DependencyContainer) => {
    return {
        getAnnouncementState: async (req, res, next) => {
            const userId = req.session.userId;
            const announcementState = await container.announcementService.getAnnouncementState(userId);
            res.status(200).json(announcementState);
            return next();
        },
        getLatestAnnouncement: async (req, res, next) => {
            const announcement = await container.announcementService.getLatestAnnouncement();
            res.status(200).json(announcement);
            return next();
        },
        markAsRead: async (req, res, next) => {
            const userId = req.session.userId;
            await container.announcementService.markAsRead(userId);
            res.status(200);
            return next();
        },
        getCurrentAnnouncements: async (req, res, next) => {
            const announcements = await container.announcementService.getCurrentAnnouncements();
            res.status(200).json(announcements);
            return next();
        },
    }
}