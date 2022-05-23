import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../services/types/DependencyContainer';

export default (container: DependencyContainer, io) => {
    return {
        list: async (req, res, next) => {
            let startTick = +req.query.startTick || 0;
            
            try {
                let events = await container.eventService.getPlayerEvents(
                    req.game._id,
                    req.player,
                    startTick
                );
    
                return res.status(200).json(events);
            } catch (err) {
                return next(err);
            }
        },
        listTrade: async (req, res, next) => {
            let startTick = +req.query.startTick || 0;
            
            try {
                let events = await container.eventService.getPlayerTradeEvents(
                    req.game,
                    req.player,
                    startTick
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
