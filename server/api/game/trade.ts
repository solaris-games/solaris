import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../types/DependencyContainer';
import Middleware from '../middleware';
const mongoose = require('mongoose');

export default (router, io, container: DependencyContainer) => {

    const middleware = Middleware(container);

    router.put('/api/game/:gameId/trade/credits', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameInProgress, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors: string[] = [];

        if (!req.body.toPlayerId) {
            errors.push('toPlayerId is required.');
        }

        if (req.session.userId === req.body.toPlayerId) {
            errors.push('Cannot send credits to yourself.');
        }
        
        req.body.amount = parseInt(req.body.amount || 0);

        if (!req.body.amount) {
            errors.push('amount is required.');
        }
        
        if (req.body.amount <= 0) {
            errors.push('amount must be greater than 0.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let trade = await container.tradeService.sendCredits(
                req.game,
                req.player,
                req.body.toPlayerId,
                req.body.amount);
            
            res.status(200).json({
                reputation: trade.reputation
            });

            container.broadcastService.gamePlayerCreditsReceived(req.game, trade.fromPlayer._id.toString(), trade.toPlayer._id.toString(), trade.amount, trade.date);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/trade/creditsSpecialists', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameInProgress, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors: string[] = [];

        if (!req.body.toPlayerId) {
            errors.push('toPlayerId is required.');
        }

        if (req.session.userId === req.body.toPlayerId) {
            errors.push('Cannot send specialist tokens to yourself.');
        }
        
        req.body.amount = parseInt(req.body.amount || 0);

        if (!req.body.amount) {
            errors.push('amount is required.');
        }
        
        if (req.body.amount <= 0) {
            errors.push('amount must be greater than 0.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let trade = await container.tradeService.sendCreditsSpecialists(
                req.game,
                req.player,
                req.body.toPlayerId,
                req.body.amount);
            
            res.status(200).json({
                reputation: trade.reputation
            });

            container.broadcastService.gamePlayerCreditsSpecialistsReceived(req.game, trade.fromPlayer._id.toString(), trade.toPlayer._id.toString(), trade.amount, trade.date);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/trade/renown', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameStarted, middleware.loadPlayer, async (req, res, next) => {
        let errors: string[] = [];

        if (!req.body.toPlayerId) {
            errors.push('toPlayerId is required.');
        }

        req.body.amount = parseInt(req.body.amount || 0);

        if (!req.body.amount) {
            errors.push('amount is required.');
        }
        
        if (req.body.amount <= 0) {
            errors.push('amount must be greater than 0.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let trade = await container.tradeService.sendRenown(
                req.game,
                req.player,
                req.body.toPlayerId,
                req.body.amount);

            // TODO: Implement receiving renown on the UI, should use a user socket.
            //container.broadcastService.userRenownReceived(req.game, // to user id, req.body.amount);

            res.sendStatus(200);

            container.broadcastService.gamePlayerRenownReceived(req.game, trade.fromPlayer._id.toString(), trade.toPlayer._id.toString(), trade.amount, trade.date);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/trade/tech', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameInProgress, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors: string[] = [];

        if (!req.body.toPlayerId) {
            errors.push('toPlayerId is required.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let trade = await container.tradeService.sendTechnology(
                req.game,
                req.player,
                req.body.toPlayerId,
                req.body.technology,
                req.body.level);

            res.status(200).json({
                reputation: trade.reputation
            });
            
            container.broadcastService.gamePlayerTechnologyReceived(req.game, trade.fromPlayer._id.toString(), trade.toPlayer._id.toString(), trade.technology, trade.date);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/trade/tech/:toPlayerId', middleware.authenticate, middleware.loadGameLean, middleware.validateGameInProgress, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let techs = await container.tradeService.getTradeableTechnologies(
                req.game,
                req.player,
                req.params.toPlayerId);

            return res.status(200).json(techs);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/trade/:toPlayerId/events', middleware.authenticate, middleware.loadGamePlayersState, middleware.loadPlayer, async (req, res, next) => {
        try {
            let events = await container.tradeService.listTradeEventsBetweenPlayers(
                req.game, 
                req.player._id, 
                [
                    req.player._id, 
                    mongoose.Types.ObjectId(req.params.toPlayerId)
                ]);

            return res.status(200).json(events);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
