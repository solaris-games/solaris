import { Router } from 'express';
import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../types/DependencyContainer';
import Middleware from '../middleware';

export default (router: Router, io, container: DependencyContainer) => {

    const middleware = Middleware(container);

    router.put('/api/game/:gameId/carrier/:carrierId/waypoints', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.waypointService.saveWaypoints(
                req.game,
                req.player,
                req.params.carrierId,
                req.body.waypoints,
                req.body.looped);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/waypoints/loop', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors: string[] = [];

        if (req.body.loop == null) {
            errors.push('loop field is required.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.waypointService.loopWaypoints(
                req.game,
                req.player,
                req.params.carrierId,
                req.body.loop);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/transfer', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors: string[] = [];

        if (req.body.carrierShips == null) {
            errors.push('carrierShips is required.');
        }

        if (req.body.starShips == null) {
            errors.push('starShips is required.');
        }

        if (!req.body.starId) {
            errors.push('starId is required.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.shipTransferService.transfer(
                req.game,
                req.player,
                req.params.carrierId,
                req.body.carrierShips,
                req.body.starId,
                req.body.starShips);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/gift', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.carrierGiftService.convertToGift(
                req.game,
                req.player,
                req.params.carrierId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/game/:gameId/carrier/:carrierId/rename', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.carrierService.rename(
                req.game,
                req.player,
                req.params.carrierId,
                req.body.name);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.delete('/api/game/:gameId/carrier/:carrierId/scuttle', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.carrierService.scuttle(
                req.game,
                req.player,
                req.params.carrierId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/game/:gameId/carrier/calculateCombat', middleware.authenticate, (req, res, next) => {
        let errors: string[] = [];

        if (req.body.defender.ships == null) {
            errors.push('defender.ships is required.');
        }

        if (+req.body.defender.ships <= 0) {
            errors.push('defender.ships must be greater than 0.');
        }

        if (req.body.defender.weaponsLevel == null) {
            errors.push('defender.weaponsLevel is required.');
        }

        if (+req.body.defender.weaponsLevel <= 0) {
            errors.push('defender.weaponsLevel must be greater than 0.');
        }

        if (req.body.attacker.ships == null) {
            errors.push('attacker.ships is required.');
        }

        if (+req.body.attacker.ships <= 0) {
            errors.push('attacker.ships must be greater than 0.');
        }

        if (req.body.attacker.weaponsLevel == null) {
            errors.push('attacker.weaponsLevel is required.');
        }

        if (+req.body.attacker.weaponsLevel <= 0) {
            errors.push('attacker.weaponsLevel must be greater than 0.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let result = container.combatService.calculate(
                req.body.defender,
                req.body.attacker,
                req.body.isTurnBased,
                true);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
