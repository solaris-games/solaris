import { DependencyContainer } from '../../services/types/DependencyContainer';
import { mapToBadgesPurchaseBadgeRequest } from '../requests/badges';

export default (container: DependencyContainer, io) => {
    return {
        listAll: async (req, res, next) => {
            try {
                const result = container.badgeService.listPurchasableBadges();
                
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        listForUser: async (req, res, next) => {
            try {
                const result = await container.badgeService.listBadgesByUser(req.params.userId);
                
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        listForPlayer: async (req, res, next) => {
            try {
                const result = await container.badgeService.listBadgesByPlayer(req.game, req.params.playerId);
                
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        purchaseForUser: async (req, res, next) => {
            try {
                const reqObj = mapToBadgesPurchaseBadgeRequest(req.body);
                
                await container.badgeService.purchaseBadgeForUser(req.session.userId, req.params.userId, reqObj.badgeKey);
                
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        purchaseForPlayer: async (req, res, next) => {
            try {
                const reqObj = mapToBadgesPurchaseBadgeRequest(req.body);
                
                await container.badgeService.purchaseBadgeForPlayer(req.game, req.session.userId, req.params.playerId, reqObj.badgeKey);
                
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        }
    }
};
