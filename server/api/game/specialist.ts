import { Router } from 'express';
import { DependencyContainer } from '../../types/DependencyContainer';
import Middleware from '../middleware';

export default (router: Router, io, container: DependencyContainer) => {

    const middleware = Middleware(container);

    router.get('/api/game/specialists/bans', async (req, res, next) => {
        try {
            const amount = container.gameFluxService.getThisMonthSpecialistBanAmount();
            const bans = container.specialistBanService.getCurrentMonthBans(amount);

            return res.status(200).json(bans);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/specialists/carrier', async (req, res, next) => {
        try {
            let specialists = await container.specialistService.listCarrier(null);

            return res.status(200).json(specialists);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/specialists/star', async (req, res, next) => {
        try {
            let specialists = await container.specialistService.listStar(null);

            return res.status(200).json(specialists);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/specialists/carrier', middleware.loadGameLean, async (req, res, next) => {
        try {
            let specialists = await container.specialistService.listCarrier(req.game);

            return res.status(200).json(specialists);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/specialists/star', middleware.loadGameLean, async (req, res, next) => {
        try {
            let specialists = await container.specialistService.listStar(req.game);

            return res.status(200).json(specialists);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/hire/:specialistId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let result = await container.specialistHireService.hireCarrierSpecialist(
                req.game,
                req.player,
                req.params.carrierId,
                +req.params.specialistId);

            await container.eventService.createPlayerCarrierSpecialistHired(
                req.game._id,
                req.game.state.tick,
                req.player,
                result.carrier,
                result.specialist
            );

            return res.status(200).json({
                waypoints: result.waypoints
            });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/:starId/hire/:specialistId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let result = await container.specialistHireService.hireStarSpecialist(
                req.game,
                req.player,
                req.params.starId,
                +req.params.specialistId);

            await container.eventService.createPlayerStarSpecialistHired(
                req.game._id,
                req.game.state.tick,
                req.player,
                result.star,
                result.specialist
            );

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
