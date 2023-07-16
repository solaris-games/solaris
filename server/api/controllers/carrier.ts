import { DependencyContainer } from '../../services/types/DependencyContainer';
import { mapToCarrierCalculateCombatRequest, mapToCarrierLoopWaypointsRequest, mapToCarrierRenameCarrierRequest, mapToCarrierSaveWaypointsRequest, mapToCarrierTransferShipsRequest } from '../requests/carrier';

export default (container: DependencyContainer) => {
    return {
        saveWaypoints: async (req, res, next) => {
            try {
                const reqObj = mapToCarrierSaveWaypointsRequest(req.body);
                
                let report = await container.waypointService.saveWaypoints(
                    req.game,
                    req.player,
                    req.params.carrierId,
                    reqObj.waypoints,
                    reqObj.looped);
    
                return res.status(200).json(report);
            } catch (err) {
                return next(err);
            }
        },
        loopWaypoints: async (req, res, next) => {    
            try {
                const reqObj = mapToCarrierLoopWaypointsRequest(req.body);
                
                await container.waypointService.loopWaypoints(
                    req.game,
                    req.player,
                    req.params.carrierId,
                    reqObj.loop);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        transferShips: async (req, res, next) => {    
            try {
                const reqObj = mapToCarrierTransferShipsRequest(req.body);
                
                await container.shipTransferService.transfer(
                    req.game,
                    req.player,
                    req.params.carrierId,
                    reqObj.carrierShips,
                    reqObj.starId,
                    reqObj.starShips);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        gift: async (req, res, next) => {
            try {
                await container.carrierGiftService.convertToGift(
                    req.game,
                    req.player,
                    req.params.carrierId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        rename: async (req, res, next) => {
            try {
                const reqObj = mapToCarrierRenameCarrierRequest(req.body);
                
                await container.carrierService.rename(
                    req.game,
                    req.player,
                    req.params.carrierId,
                    reqObj.name);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        scuttle: async (req, res, next) => {
            try {
                await container.carrierService.scuttle(
                    req.game,
                    req.player,
                    req.params.carrierId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        calculateCombat: (req, res, next) => {
            try {
                const reqObj = mapToCarrierCalculateCombatRequest(req.body);
    
                let result = container.combatService.calculate(
                    reqObj.defender,
                    reqObj.attacker,
                    reqObj.isTurnBased,
                    true);
    
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        }
    }
};
