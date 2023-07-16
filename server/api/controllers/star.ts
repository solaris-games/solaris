import { DependencyContainer } from '../../services/types/DependencyContainer';
import { mapToStarAbandonStarRequest, mapToStarBuildCarrierRequest, mapToStarDestroyInfrastructureRequest, mapToStarSetBulkIgnoreAllStatusRequest, mapToStarToggleBulkIgnoreStatusRequest, mapToStarUpgradeInfrastructureBulkRequest, mapToStarUpgradeInfrastructureRequest, StarUpgradeInfrastructureRequest } from '../requests/star';

export default (container: DependencyContainer) => {
    return {
        upgradeEconomy: async (req, res, next) => {
            try {
                const reqObj = mapToStarUpgradeInfrastructureRequest(req.body);

                let report = await container.starUpgradeService.upgradeEconomy(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        upgradeIndustry: async (req, res, next) => {
            try {
                const reqObj = mapToStarUpgradeInfrastructureRequest(req.body);

                let report = await container.starUpgradeService.upgradeIndustry(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        upgradeScience: async (req, res, next) => {
            try {
                const reqObj = mapToStarUpgradeInfrastructureRequest(req.body);

                let report = await container.starUpgradeService.upgradeScience(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        upgradeBulk: async (req, res, next) => {
            try {
                const reqObj = mapToStarUpgradeInfrastructureBulkRequest(req.body);
                
                let summary = await container.starUpgradeService.upgradeBulk(
                    req.game,
                    req.player,
                    reqObj.upgradeStrategy,
                    reqObj.infrastructure,
                    +reqObj.amount);
    
                return res.status(200).json(summary);
            } catch (err) {
                return next(err);
            }
        },
        upgradeBulkCheck: async (req, res, next) => {
            try {
                const reqObj = mapToStarUpgradeInfrastructureBulkRequest(req.body);
                
                let summary = await container.starUpgradeService.generateUpgradeBulkReport(
                    req.game,
                    req.player,
                    reqObj.upgradeStrategy,
                    reqObj.infrastructure,
                    +reqObj.amount);
    
                return res.status(200).json(summary);
            } catch (err) {
                return next(err);
            }
        },
        buildWarpGate: async (req, res, next) => {
            try {
                const reqObj: StarUpgradeInfrastructureRequest = req.body;
                
                let report = await container.starUpgradeService.buildWarpGate(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        destroyWarpGate: async (req, res, next) => {
            try {
                const reqObj = mapToStarDestroyInfrastructureRequest(req.body);
                
                await container.starUpgradeService.destroyWarpGate(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        buildCarrier: async (req, res, next) => {
            try {
                const reqObj = mapToStarBuildCarrierRequest(req.body);
        
                let report = await container.starUpgradeService.buildCarrier(
                    req.game,
                    req.player,
                    reqObj.starId,
                    reqObj.ships);
    
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
                    req.params.starId);
    
                return res.status(200).json(report);
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
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        abandon: async (req, res, next) => {
            try {
                const reqObj = mapToStarAbandonStarRequest(req.body);
                
                await container.starService.abandonStar(
                    req.game,
                    req.player,
                    reqObj.starId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        toggleBulkIgnore: async (req, res, next) => {
            try {
                const reqObj = mapToStarToggleBulkIgnoreStatusRequest(req.body);

                await container.starService.toggleIgnoreBulkUpgrade(
                    req.game,
                    req.player,
                    reqObj.starId,
                    reqObj.infrastructureType);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        toggleBulkIgnoreAll: async (req, res, next) => {
            try {
                const reqObj = mapToStarSetBulkIgnoreAllStatusRequest(req.body);
                
                await container.starService.toggleIgnoreBulkUpgradeAll(
                    req.game,
                    req.player,
                    reqObj.starId,
                    reqObj.ignoreStatus);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        }
    }
};