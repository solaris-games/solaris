import { DependencyContainer } from '../../services/types/DependencyContainer';
import {
    mapToCarrierCalculateCombatRequest,
    parseCarrierLoopWaypointsRequest,
    parseCarrierSaveWaypointsRequest,
    parseCarrierTransferShipsRequest,
    parseCarrierRenameCarrierRequest
} from '../requests/carrier';

export default (container: DependencyContainer) => {
    return {
        saveWaypoints: async (req, res, next) => {
            try {
                const reqObj = parseCarrierSaveWaypointsRequest(req.body);
                
                let report = await container.saveWaypointsService.saveWaypoints(
                    req.game,
                    req.player,
                    req.params.carrierId,
                    reqObj.waypoints,
                    reqObj.looped);
    
                res.status(200).json(report);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        loopWaypoints: async (req, res, next) => {    
            try {
                const reqObj = parseCarrierLoopWaypointsRequest(req.body);
                
                await container.saveWaypointsService.loopWaypoints(
                    req.game,
                    req.player,
                    req.params.carrierId,
                    reqObj.loop);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        transferShips: async (req, res, next) => {    
            try {
                const reqObj = parseCarrierTransferShipsRequest(req.body);
                
                await container.shipTransferService.transfer(
                    req.game,
                    req.player,
                    req.params.carrierId,
                    reqObj.carrierShips,
                    reqObj.starId,
                    reqObj.starShips);
    
                res.sendStatus(200);
                return next();
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
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        rename: async (req, res, next) => {
            try {
                const reqObj = parseCarrierRenameCarrierRequest(req.body);
                
                await container.carrierService.rename(
                    req.game,
                    req.player,
                    req.params.carrierId,
                    reqObj.name);
    
                res.sendStatus(200);
                return next();
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
    
                res.sendStatus(200);
                return next();
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
    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
