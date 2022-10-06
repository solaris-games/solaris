import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../services/types/DependencyContainer';

const COST_PER_TOKEN = 1;

export default (container: DependencyContainer) => {
    return {
        purchase: async (req, res, next) => {
            try {
                let errors: string[] = [];
    
                if (!req.query.amount) {
                    errors.push('Amount is a required field');
                }
    
                if (errors.length) {
                    throw new ValidationError(errors);
                }
    
                const totalQuantity = parseInt(req.query.amount);
                let unitCost = COST_PER_TOKEN;
    
                // Crude, but it works.
                if (totalQuantity === 10) {
                    unitCost *= 0.9;
                } else if (totalQuantity === 25) {
                    unitCost *= 0.8;
                } else if (totalQuantity === 50) {
                    unitCost *= 0.7;
                } else if (totalQuantity === 100) {
                    unitCost *= 0.5;
                }
    
                const totalCost = totalQuantity * unitCost;
                const returnUrl = `${container.config.serverUrl}/api/shop/galacticcredits/purchase/process`;
                const cancelUrl =`${container.config.clientUrl}/#/shop`;
    
                let approvalUrl = await container.paypalService.authorizePayment(req.session.userId, totalQuantity, totalCost, unitCost, returnUrl, cancelUrl);
                
                // Note: Can't do a redirect here due to CORS
                return res.status(200).json({
                    approvalUrl
                });
            } catch (err) {
                return next(err);
            }
        },
        process: async (req, res, next) => {
            try {
                const result = await container.paypalService.processPayment(req.query.paymentId, req.query.PayerID);
    
                return res.redirect(`${container.config.clientUrl}/#/shop/paymentcomplete?credits=${result.galacticTokens}`);
            } catch (err) {
                console.error(err);
    
                return res.redirect(`${container.config.clientUrl}/#/shop/paymentfailed`);
            }
        }
    }
};
