import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../types/DependencyContainer';

export default (container: DependencyContainer, io) => {
    return {
        detail: async (req, res, next) => {
            try {
                let ledger = await container.ledgerService.getLedger(req.player);
    
                return res.status(200).json(ledger);
            } catch (err) {
                return next(err);
            }
        },
        forgive: async (req, res, next) => {
            try {
                let newLedger = await container.ledgerService.forgiveDebt(
                    req.game,
                    req.player,
                    req.params.playerId);
    
                return res.status(200).json(newLedger);
            } catch (err) {
                return next(err);
            }
        },
        settle: async (req, res, next) => {
            try {
                let newLedger = await container.ledgerService.settleDebt(
                    req.game,
                    req.player,
                    req.params.playerId);
    
                return res.status(200).json(newLedger);
            } catch (err) {
                return next(err);
            }
        }
    }
};
