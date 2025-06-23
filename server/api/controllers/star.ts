import { DependencyContainer } from '../../services/types/DependencyContainer';
import {
    parseStarUpgradeInfrastructureRequest,
    StarUpgradeInfrastructureRequest,
    parseScheduledStarUpgradeToggleRepeat,
    parseScheduledStarUpgradeTrashRepeat,
    parseStarUpgradeInfrastructureBulkRequest,
    parseScheduledStarUpgradeInfrastructureBulkRequest,
    parseStarDestroyInfrastructureRequest,
    parseStarBuildCarrierRequest,
    parseStarAbandonStarRequest,
    parseStarToggleBulkIgnoreStatusRequest, parseStarSetBulkIgnoreAllStatusRequest
} from '../requests/star';

export default (container: DependencyContainer) => {
    return {
        upgradeEconomy: async (req, res, next) => {
            try {
                const reqObj = parseStarUpgradeInfrastructureRequest(req.body);

                let report = await container.starUpgradeService.upgradeEconomy(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                res.status(200).json(report);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        upgradeIndustry: async (req, res, next) => {
            try {
                const reqObj = parseStarUpgradeInfrastructureRequest(req.body);

                let report = await container.starUpgradeService.upgradeIndustry(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                res.status(200).json(report);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        upgradeScience: async (req, res, next) => {
            try {
                const reqObj = parseStarUpgradeInfrastructureRequest(req.body);

                let report = await container.starUpgradeService.upgradeScience(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                res.status(200).json(report);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        upgradeBulk: async (req, res, next) => {
            try {
                const reqObj = parseStarUpgradeInfrastructureBulkRequest(req.body);
                
                let summary = await container.starUpgradeService.upgradeBulk(
                    req.game,
                    req.player,
                    reqObj.upgradeStrategy,
                    reqObj.infrastructure,
                    +reqObj.amount);
    
                res.status(200).json(summary);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        upgradeBulkCheck: async (req, res, next) => {
            try {
                const reqObj = parseStarUpgradeInfrastructureBulkRequest(req.body);
                
                const summary = await container.starUpgradeService.generateUpgradeBulkReport(
                    req.game,
                    req.player,
                    reqObj.upgradeStrategy,
                    reqObj.infrastructure,
                    +reqObj.amount);
    
                res.status(200).json(summary);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        scheduleBulk: async (req, res, next) => {
            try {
                const reqObj = parseScheduledStarUpgradeInfrastructureBulkRequest(req.body);

                let summary = await container.scheduleBuyService.addScheduledBuy(
                    req.game,
                    req.player,
                    reqObj.buyType,
                    reqObj.infrastructureType,
                    reqObj.amount,
                    reqObj.repeat,
                    reqObj.tick); 

                res.status(200).json(summary);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        toggleBulkRepeat: async (req, res, next) => {
            try {
                const reqObj = parseScheduledStarUpgradeToggleRepeat(req.body);

                let summary = await container.scheduleBuyService.toggleBulkRepeat(
                    req.game,
                    req.player,
                    reqObj.actionId);

                res.status(200).json(summary);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        trashBulk: async (req, res, next) => {
            try {
                const reqObj = parseScheduledStarUpgradeTrashRepeat(req.body);

                await container.scheduleBuyService.trashAction(
                    req.game,
                    req.player,
                    reqObj.actionId
                )
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err)
            }
        },
        buildWarpGate: async (req, res, next) => {
            try {
                const reqObj: StarUpgradeInfrastructureRequest = req.body;
                
                let report = await container.starUpgradeService.buildWarpGate(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                res.status(200).json(report);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        destroyWarpGate: async (req, res, next) => {
            try {
                const reqObj = parseStarDestroyInfrastructureRequest(req.body);
                
                await container.starUpgradeService.destroyWarpGate(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        buildCarrier: async (req, res, next) => {
            try {
                const reqObj = parseStarBuildCarrierRequest(req.body);
        
                let report = await container.starUpgradeService.buildCarrier(
                    req.game,
                    req.player,
                    reqObj.starId,
                    reqObj.ships);
    
                res.status(200).json(report);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        garrisonAllShips: async (req, res, next) => {
            try {
                let report = await container.shipTransferService.garrisonAllShips(
                    req.game,
                    req.player,
                    req.params.starId);
    
                res.status(200).json(report);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        distributeAllShips: async (req, res, next) => {
            try {                
                let report = await container.shipTransferService.distributeAllShips(
                    req.game,
                    req.player,
                    req.params.starId);
    
                res.status(200).json(report);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        abandon: async (req, res, next) => {
            try {
                const reqObj = parseStarAbandonStarRequest(req.body);
                
                await container.starService.abandonStar(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        toggleBulkIgnore: async (req, res, next) => {
            try {
                const reqObj = parseStarToggleBulkIgnoreStatusRequest(req.body);

                await container.starService.toggleIgnoreBulkUpgrade(
                    req.game,
                    req.player,
                    reqObj.starId,
                    reqObj.infrastructureType);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        toggleBulkIgnoreAll: async (req, res, next) => {
            try {
                const reqObj = parseStarSetBulkIgnoreAllStatusRequest(req.body);
                
                await container.starService.toggleIgnoreBulkUpgradeAll(
                    req.game,
                    req.player,
                    reqObj.starId,
                    reqObj.ignoreStatus);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};