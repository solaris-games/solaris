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

            res.status(200).json(report);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => 
                container.broadcastService.gameStarEconomyUpgraded(req.game, p._id, req.body.starId, report.infrastructure));
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

            res.status(200).json(report);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => 
                container.broadcastService.gameStarIndustryUpgraded(req.game, p._id, req.body.starId, report.infrastructure, report.manufacturing));
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

            res.status(200).json(report);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => 
                container.broadcastService.gameStarScienceUpgraded(req.game, p._id, req.body.starId, report.infrastructure));
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

            res.status(200).json(summary);

            if (summary.upgraded) {
                // For all of the other players, we'll need to broadcast the summary containing only the stars
                // that they can see in their scanning range.
                // Don't send out potentially sensitive info like costs to all players, only
                // the stuff that the UI needs.
                req.game.galaxy.players.forEach(p => {
                    if (container.broadcastService.roomExists(p._id)) { // Check for active socket here before filtering stars.
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
                    }
                });
            }
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

            res.status(200).json(report);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => container.broadcastService.gameStarWarpGateBuilt(req.game, p._id, req.body.starId));
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

            res.sendStatus(200);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => container.broadcastService.gameStarWarpGateDestroyed(req.game, p._id, req.body.starId));
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/build/carrier', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let ships = +req.body.ships || 1;

        try {
            let report = await container.starUpgradeService.buildCarrier(
                req.game,
                req.player,
                req.body.starId,
                ships);

            res.status(200).json(report);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => {
                if (!p._id.equals(req.player._id)) {
                    container.broadcastService.gameStarCarrierBuilt(req.game, p._id, report);
                }
            });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/transferall', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.shipTransferService.transferAllToStar(
                req.game,
                req.player,
                req.body.starId);

            res.status(200).json(report);

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => {
                for (let carrier of report.carriersAtStar) {
                    // To prevent snooping, only return the data that player can see.
                    let canSeeStarGarrison = container.starService.canPlayerSeeStarGarrison(p, report.star);
                    let canSeeCarrierShips = container.carrierService.canPlayerSeeCarrierShips(p, carrier);

                    container.broadcastService.gameStarCarrierShipTransferred(req.game, p._id,
                        report.star._id, canSeeStarGarrison ? report.star.garrison: null,
                        carrier._id, canSeeCarrierShips ? carrier.ships : null);
                }
            });

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

            res.sendStatus(200);

            // TODO: Send whether the player who owned the star is in scanning range to all other players.
            
            container.broadcastService.gameStarAbandoned(req.game, req.body.starId);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
