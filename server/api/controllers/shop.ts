import { DependencyContainer } from "../../services/types/DependencyContainer";
import {
    parseProcessPaymentRequest,
    parseShopPurchaseRequest,
} from "../requests/shop";
import { logger } from "../../utils/logging";

const COST_PER_TOKEN = 1;

const log = logger("Shop Controller");

export default (container: DependencyContainer) => {
    return {
        purchase: async (req, res, next) => {
            try {
                const reqObj = parseShopPurchaseRequest(req.query);

                const totalQuantity = reqObj.amount;

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
                const returnUrl = `${container.config.clientUrl}/#/shop/paymentreturn`;
                const cancelUrl = `${container.config.clientUrl}/#/shop`;

                const approvalUrl =
                    await container.paypalService.authorizePayment(
                        req.session.userId,
                        totalQuantity,
                        totalCost,
                        unitCost,
                        returnUrl,
                        cancelUrl,
                    );

                // Note: Can't do a redirect here due to CORS
                res.status(200).json({
                    approvalUrl,
                });
                return next();
            } catch (err) {
                return next(err);
            }
        },
        capture: async (req, res, next) => {
            try {
                const reqObj = parseProcessPaymentRequest(req.body);

                const result = await container.paypalService.processPayment(
                    reqObj.token,
                    req.session.userId,
                );

                res.status(200).json({
                    credits: result.galacticTokens,
                });
                return next();
            } catch (err) {
                log.error(err);
                return next(err);
            }
        },
    };
};
