import { LedgerType } from '../../services/ledger';
import { DependencyContainer } from '../../services/types/DependencyContainer';

export default (container: DependencyContainer) => {
    return {
        detailCredits: async (req, res, next) => {
            try {
                let ledger = await container.ledgerService.getLedger(req.player, LedgerType.Credits);
    
                return res.status(200).json(ledger);
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
    
                return res.status(200).json(newLedger);
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
    
                return res.status(200).json(newLedger);
            } catch (err) {
                return next(err);
            }
        },
        detailCreditsSpecialists: async (req, res, next) => {
            try {
                let ledger = await container.ledgerService.getLedger(req.player, LedgerType.CreditsSpecialists);
    
                return res.status(200).json(ledger);
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
    
                return res.status(200).json(newLedger);
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
    
                return res.status(200).json(newLedger);
            } catch (err) {
                return next(err);
            }
        }
    }
};
