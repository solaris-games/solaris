import { LedgerType } from '../../services/ledger';
import { DependencyContainer } from '../../services/types/DependencyContainer';

export default (container: DependencyContainer) => {
    return {
        detailCredits: async (req, res, next) => {
            try {
                let ledger = await container.ledgerService.getLedger(req.player, LedgerType.Credits);
    
                res.status(200).json(ledger);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        forgiveCredits: async (req, res, next) => {
            try {
                let newLedger = await container.ledgerService.forgiveDebt(
                    req.game,
                    req.player,
                    req.params.playerId,
                    LedgerType.Credits);
    
                res.status(200).json(newLedger);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        settleCredits: async (req, res, next) => {
            try {
                let newLedger = await container.ledgerService.settleDebt(
                    req.game,
                    req.player,
                    req.params.playerId,
                    LedgerType.Credits);
    
                res.status(200).json(newLedger);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        detailCreditsSpecialists: async (req, res, next) => {
            try {
                let ledger = await container.ledgerService.getLedger(req.player, LedgerType.CreditsSpecialists);
    
                res.status(200).json(ledger);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        forgiveCreditsSpecialists: async (req, res, next) => {
            try {
                let newLedger = await container.ledgerService.forgiveDebt(
                    req.game,
                    req.player,
                    req.params.playerId,
                    LedgerType.CreditsSpecialists);
    
                res.status(200).json(newLedger);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        settleCreditsSpecialists: async (req, res, next) => {
            try {
                let newLedger = await container.ledgerService.settleDebt(
                    req.game,
                    req.player,
                    req.params.playerId,
                    LedgerType.CreditsSpecialists);
    
                res.status(200).json(newLedger);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
