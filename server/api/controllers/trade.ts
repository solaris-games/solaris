import { DependencyContainer } from '../../services/types/DependencyContainer';
import { mapToTradeSendTechnologyToPlayerRequest, mapToTradeSendToPlayerRequest } from '../requests/trade';
import {objectIdFromString} from "../../services/types/DBObjectId";

export default (container: DependencyContainer) => {
    return {
        sendCredits: async (req, res, next) => {
            try {
                const reqObj = mapToTradeSendToPlayerRequest(req.body, req.session.userId);
    
                let trade = await container.tradeService.sendCredits(
                    req.game,
                    req.player,
                    reqObj.toPlayerId,
                    reqObj.amount);
                
                res.status(200).json({
                    reputation: trade.reputation
                });
    
                container.broadcastService.gamePlayerCreditsReceived(req.game, trade.fromPlayer._id, trade.toPlayer._id, trade.amount, trade.date.toDate());
                return next();
            } catch (err) {
                return next(err);
            }
        },
        sendCreditsSpecialists: async (req, res, next) => {
            try {
                const reqObj = mapToTradeSendToPlayerRequest(req.body, req.session.userId);
    
                let trade = await container.tradeService.sendCreditsSpecialists(
                    req.game,
                    req.player,
                    reqObj.toPlayerId,
                    reqObj.amount);
                
                res.status(200).json({
                    reputation: trade.reputation
                });
    
                container.broadcastService.gamePlayerCreditsSpecialistsReceived(req.game, trade.fromPlayer._id, trade.toPlayer._id, trade.amount, trade.date.toDate());
                return next();
            } catch (err) {
                return next(err);
            }
        },
        sendRenown: async (req, res, next) => {    
            try {
                const reqObj = mapToTradeSendToPlayerRequest(req.body, req.session.userId);

                let trade = await container.tradeService.sendRenown(
                    req.game,
                    req.player,
                    reqObj.toPlayerId,
                    reqObj.amount);
    
                // TODO: Implement receiving renown on the UI, should use a user socket.
                //container.broadcastService.userRenownReceived(req.game, // to user id, reqObj.amount);
    
                res.sendStatus(200);
    
                container.broadcastService.gamePlayerRenownReceived(req.game, trade.fromPlayer._id, trade.toPlayer._id, trade.amount, trade.date.toDate());
                return next();
            } catch (err) {
                return next(err);
            }
        },
        sendTechnology: async (req, res, next) => {
            try {
                const reqObj = mapToTradeSendTechnologyToPlayerRequest(req.body);
                
                let trade = await container.tradeService.sendTechnology(
                    req.game,
                    req.player,
                    reqObj.toPlayerId,
                    reqObj.technology,
                    reqObj.level);
    
                res.status(200).json({
                    reputation: trade.reputation
                });
                
                container.broadcastService.gamePlayerTechnologyReceived(req.game, trade.fromPlayer._id, trade.toPlayer._id, trade.technology, trade.date.toDate());
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listTradeableTechnologies: async (req, res, next) => {
            try {
                let techs = await container.tradeService.listTradeableTechnologies(
                    req.game,
                    req.player,
                    req.params.toPlayerId);
    
                res.status(200).json(techs);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listTradeEvents: async (req, res, next) => {
            try {
                let events = await container.tradeService.listTradeEventsBetweenPlayers(
                    req.game, 
                    req.player._id, 
                    [
                        req.player._id, 
                        objectIdFromString(req.params.toPlayerId),
                    ]);
    
                res.status(200).json(events);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
