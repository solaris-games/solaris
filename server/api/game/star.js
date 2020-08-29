const ValidationError = require('../../errors/validation');

function validate(req, res, next) {
    let errors = [];

    if (!req.body.starId) {
        errors.push('starId is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return next();
}

module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.put('/api/game/:gameId/star/upgrade/economy', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.upgradeEconomy(
                req.game,
                req.player,
                req.body.starId);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => 
                container.broadcastService.gameStarEconomyUpgraded(req.game, p._id, req.body.starId, report.infrastructure));

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/upgrade/industry', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.upgradeIndustry(
                req.game,
                req.player,
                req.body.starId);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => 
                container.broadcastService.gameStarIndustryUpgraded(req.game, p._id, req.body.starId, report.infrastructure, report.manufacturing));

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/upgrade/science', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.upgradeScience(
                req.game,
                req.player,
                req.body.starId);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => 
                container.broadcastService.gameStarScienceUpgraded(req.game, p._id, req.body.starId, report.infrastructure));

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/upgrade/bulk', middleware.authenticate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let summary = await container.starUpgradeService.upgradeBulk(
                req.game,
                req.player,
                req.body.infrastructure,
                +req.body.amount);

            if (summary.upgraded) {
                // For all of the other players, we'll need to broadcast the summary containing only the stars
                // that they can see in their scanning range.
                // Don't send out potentially sensitive info like costs to all players, only
                // the stuff that the UI needs.
                req.game.galaxy.players.forEach(p => {
                    let broadcastSummary = {
                        playerId: req.player._id,
                        stars: summary.stars,
                        infrastructureType: summary.infrastructureType,
                        upgraded: summary.upgraded
                    };
    
                    // If it isn't the player who performed the bulk upgrade then strip out
                    // the stars that are outside of scanning range.
                    if (!p._id.equals(req.player._id)) {
                        let starsInScanningRange = container.starService.filterStarsByScanningRange(req.game, p);
    
                        broadcastSummary.stars = broadcastSummary.stars.filter(s => starsInScanningRange.find(sr => sr._id.equals(s._id)) != null);
                    }
    
                    container.broadcastService.gameStarBulkUpgraded(req.game, p._id, broadcastSummary);
                });
            }

            return res.status(200).json(summary);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/build/warpgate', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.buildWarpGate(
                req.game,
                req.player,
                req.body.starId);

            container.broadcastService.gameStarWarpGateBuilt(req.game, req.body.starId);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/destroy/warpgate', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.starUpgradeService.destroyWarpGate(
                req.game,
                req.player,
                req.body.starId);

            container.broadcastService.gameStarWarpGateDestroyed(req.game, req.body.starId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/build/carrier', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let ships = +req.body.ships || 1;

        try {
            let carrier = await container.starUpgradeService.buildCarrier(
                req.game,
                req.player,
                req.body.starId,
                ships);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => 
                container.broadcastService.gameStarCarrierBuilt(req.game, p._id, carrier));

            return res.status(200).json(carrier);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/abandon', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameInProgress, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.starService.abandonStar(
                req.game,
                req.player,
                req.body.starId);

            container.broadcastService.gameStarAbandoned(req.game, req.body.starId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
