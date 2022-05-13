import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../types/DependencyContainer';

export default (container: DependencyContainer, io) => {
    return {
        list: async (req, res, next) => {
            try {
                let result = await container.conversationService.list(
                    req.game,
                    req.player._id);
    
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        listPrivate: async (req, res, next) => {
            try {
                let result = await container.conversationService.privateChatSummary(
                    req.game,
                    req.player._id,
                    req.params.withPlayerId);
    
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        getUnreadCount: async (req, res, next) => {
            try {
                let result = container.conversationService.getUnreadCount(
                    req.game,
                    req.player._id);
    
                return res.status(200).json({
                    unread: result
                });
            } catch (err) {
                return next(err);
            }
        },
        detail: async (req, res, next) => {
            try {
                let result = await container.conversationService.detail(
                    req.game,
                    req.player._id,
                    req.params.conversationId);
    
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        create: async (req, res, next) => {
            try {
                let errors: string[] = [];
    
                if (!req.body.name || !req.body.name.length) {
                    errors.push('name is required.');
                }
    
                if (!req.body.participants || !req.body.participants.length) {
                    errors.push('participants is required.');
                }
    
                if (errors.length) {
                    throw new ValidationError(errors);
                }
                
                let convo = await container.conversationService.create(
                    req.game,
                    req.player._id,
                    req.body.name,
                    req.body.participants);
    
                // TODO: Broadcast convo created.
    
                return res.status(200).json(convo);
            } catch (err) {
                return next(err);
            }
        },
        sendMessage: async (req, res, next) => {
            try {
                let errors: string[] = [];
    
                if (!req.body.message || !req.body.message.length) {
                    errors.push('message is required.');
                }
    
                if (errors.length) {
                    throw new ValidationError(errors);
                }
                
                let message = await container.conversationService.send(
                    req.game,
                    req.player,
                    req.params.conversationId,
                    req.body.message);
    
                container.broadcastService.gameMessageSent(req.game, message);
    
                return res.status(200).send(message);
            } catch (err) {
                return next(err);
            }
        },
        markAsRead: async (req, res, next) => {
            if (req.session.isImpersonating) {
                return res.sendStatus(200);
            }
    
            try {
                let convo = await container.conversationService.markConversationAsRead(
                    req.game,
                    req.player._id,
                    req.params.conversationId);
    
                container.broadcastService.gameConversationRead(req.game, convo, req.player._id);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        mute: async (req, res, next) => {
            try {
                await container.conversationService.mute(
                    req.game,
                    req.player._id,
                    req.params.conversationId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        unmute: async (req, res, next) => {
            try {
                await container.conversationService.unmute(
                    req.game,
                    req.player._id,
                    req.params.conversationId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        leave: async (req, res, next) => {
            try {
                let convo = await container.conversationService.leave(
                    req.game,
                    req.player._id,
                    req.params.conversationId);
    
                container.broadcastService.gameConversationLeft(req.game, convo, req.player._id);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        pinMessage: async (req, res, next) => {
            try {
                await container.conversationService.pinMessage(
                    req.game,
                    req.params.conversationId,
                    req.params.messageId);
    
                let convo = await container.conversationService.detail(
                    req.game,
                    req.player._id,
                    req.params.conversationId);
        
                container.broadcastService.gameConversationMessagePinned(req.game, convo, req.params.messageId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        unpinMessage: async (req, res, next) => {
            try {
                await container.conversationService.unpinMessage(
                    req.game,
                    req.params.conversationId,
                    req.params.messageId);
    
                let convo = await container.conversationService.detail(
                    req.game,
                    req.player._id,
                    req.params.conversationId);
    
                container.broadcastService.gameConversationMessageUnpinned(req.game, convo, req.params.messageId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        }
    }
};
