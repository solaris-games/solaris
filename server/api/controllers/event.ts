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
    
                res.status(200).json(events);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        markAllAsRead: async (req, res, next) => {
            if (req.session.isImpersonating) {
                res.sendStatus(200);
                return next();
            }
    
            try {
                await container.eventService.markAllEventsAsRead(
                    req.game,
                    req.player._id);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        markAsRead: async (req, res, next) => {
            if (req.session.isImpersonating) {
                res.sendStatus(200);
                return next();
            }
            
            try {
                await container.eventService.markEventAsRead(
                    req.game,
                    req.player._id,
                    req.params.eventId);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        getUnreadCount: async (req, res, next) => {
            try {
                let result = await container.eventService.getUnreadCount(
                    req.game,
                    req.player._id);
    
                res.status(200).json({
                    unread: result
                });
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
