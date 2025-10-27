import { DependencyContainer } from '../../services/types/DependencyContainer';
import mongoose from 'mongoose';

export default (container: DependencyContainer) => {
    return {
        list: async (req, res, next) => {
            try {
                let diplomaticStatuses = await container.diplomacyService.getDiplomaticStatusToAllPlayers(
                    req.game,
                    req.player);
    
                res.status(200).json(diplomaticStatuses);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        detail: async (req, res, next) => {
            try {
                let diplomaticStatus = await container.diplomacyService.getDiplomaticStatusToPlayer(
                    req.game,
                    req.player._id,
                    req.params.toPlayerId);
    
                res.status(200).json(diplomaticStatus);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        declareAlly: async (req, res, next) => {
            try {
                let newStatus = await container.diplomacyService.declareAlly(
                    req.game,
                    req.player._id,
                    new mongoose.Types.ObjectId(req.params.playerId));
    
                await container.broadcastService.gamePlayerDiplomaticStatusChanged(req.player._id, req.params.playerId, newStatus);
    
                res.status(200).json(newStatus);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        declareEnemy: async (req, res, next) => {
            try {
                let newStatus = await container.diplomacyService.declareEnemy(
                    req.game,
                    req.player._id,
                    new mongoose.Types.ObjectId(req.params.playerId));
    
                await container.broadcastService.gamePlayerDiplomaticStatusChanged(req.player._id, req.params.playerId, newStatus);
    
                res.status(200).json(newStatus);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        declareNeutral: async (req, res, next) => {
            try {
                let newStatus = await container.diplomacyService.declareNeutral(
                    req.game,
                    req.player._id,
                    new mongoose.Types.ObjectId(req.params.playerId));
    
                await container.broadcastService.gamePlayerDiplomaticStatusChanged(req.player._id, req.params.playerId, newStatus);
    
                res.status(200).json(newStatus);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
