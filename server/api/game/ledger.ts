import { Router } from 'express';
import { DependencyContainer } from '../../types/DependencyContainer';
import Middleware from '../middleware';

export default (router: Router, io, container: DependencyContainer) => {

    const middleware = Middleware(container);

    router.get('/api/game/:gameId/ledger', middleware.authenticate, middleware.loadGameLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let ledger = await container.ledgerService.getLedger(req.player);

            return res.status(200).json(ledger);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/ledger/forgive/:playerId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let newLedger = await container.ledgerService.forgiveDebt(
                req.game,
                req.player,
                req.params.playerId);

            return res.status(200).json(newLedger);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/ledger/settle/:playerId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let newLedger = await container.ledgerService.settleDebt(
                req.game,
                req.player,
                req.params.playerId);

            return res.status(200).json(newLedger);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
