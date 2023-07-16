import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../services/types/DependencyContainer';

export default (container: DependencyContainer) => {
    return {
        list: async (req, res, next) => {
            let page = +req.query.page || 0;
            let pageSize = +req.query.pageSize ?? 10;
            let category = req.query.category || 'all';
            
            try {
                let events = await container.eventService.getPlayerEvents(
                    req.game._id,
                    req.player,
                    page,
                    pageSize,
                    category
                );
    
                return res.status(200).json(events);
            } catch (err) {
                return next(err);
            }
        },
        markAllAsRead: async (req, res, next) => {
            if (req.session.isImpersonating) {
                return res.sendStatus(200);
            }
    
            try {
                await container.eventService.markAllEventsAsRead(
                    req.game,
                    req.player._id);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        markAsRead: async (req, res, next) => {
            if (req.session.isImpersonating) {
                return res.sendStatus(200);
            }
            
            try {
                await container.eventService.markEventAsRead(
                    req.game,
                    req.player._id,
                    req.params.eventId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        getUnreadCount: async (req, res, next) => {
            try {
                let result = await container.eventService.getUnreadCount(
                    req.game,
                    req.player._id);
    
                return res.status(200).json({
                    unread: result
                });
            } catch (err) {
                return next(err);
            }
        }
    }
};
