import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../types/DependencyContainer';

export default (container: DependencyContainer, io) => {
    return {
        upgradeEconomy: async (req, res, next) => {
            try {
                let report = await container.starUpgradeService.upgradeEconomy(
                    req.game,
                    req.player,
                    req.body.starId);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        upgradeIndustry: async (req, res, next) => {
            try {
                let report = await container.starUpgradeService.upgradeIndustry(
                    req.game,
                    req.player,
                    req.body.starId);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        upgradeScience: async (req, res, next) => {
            try {
                let report = await container.starUpgradeService.upgradeScience(
                    req.game,
                    req.player,
                    req.body.starId);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        upgradeBulk: async (req, res, next) => {
            try {
                let summary = await container.starUpgradeService.upgradeBulk(
                    req.game,
                    req.player,
                    req.body.upgradeStrategy,
                    req.body.infrastructure,
                    +req.body.amount);
    
                return res.status(200).json(summary);
            } catch (err) {
                return next(err);
            }
        },
        upgradeBulkCheck: async (req, res, next) => {
            try {
                let summary = await container.starUpgradeService.generateUpgradeBulkReport(
                    req.game,
                    req.player,
                    req.body.upgradeStrategy,
                    req.body.infrastructure,
                    +req.body.amount);
    
                return res.status(200).json(summary);
            } catch (err) {
                return next(err);
            }
        },
        buildWarpGate: async (req, res, next) => {
            try {
                let report = await container.starUpgradeService.buildWarpGate(
                    req.game,
                    req.player,
                    req.body.starId);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        destroyWarpGate: async (req, res, next) => {
            try {
                await container.starUpgradeService.destroyWarpGate(
                    req.game,
                    req.player,
                    req.body.starId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        buildCarrier: async (req, res, next) => {
            let ships = +req.body.ships || 1;
    
            try {
                let report = await container.starUpgradeService.buildCarrier(
                    req.game,
                    req.player,
                    req.body.starId,
                    ships);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        garrisonAllShips: async (req, res, next) => {
            try {
                let report = await container.shipTransferService.garrisonAllShips(
                    req.game,
                    req.player,
                    req.body.starId);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        abandon: async (req, res, next) => {
            try {
                await container.starService.abandonStar(
                    req.game,
                    req.player,
                    req.body.starId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        toggleBulkIgnore: async (req, res, next) => {
            try {
                await container.starService.toggleIgnoreBulkUpgrade(
                    req.game,
                    req.player,
                    req.body.starId,
                    req.body.infrastructureType);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        toggleBulkIgnoreAll: async (req, res, next) => {
            try {
                await container.starService.toggleIgnoreBulkUpgradeAll(
                    req.game,
                    req.player,
                    req.body.starId,
                    req.body.ignoreStatus);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        }
    }
};