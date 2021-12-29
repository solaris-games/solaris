const ValidationError = require('../errors/validation');

const COST_PER_TOKEN = 1;

module.exports = (router, io, container) => {

    const middleware = require('./middleware')(container);

    router.get('/api/shop/galacticcredits/purchase', middleware.authenticate, async (req, res, next) => {
        let errors = [];

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

        try {
            const returnUrl = `${process.env.SERVER_URL}/api/shop/galacticcredits/purchase/process`;
            const cancelUrl =`${process.env.CLIENT_URL}/#/shop`;

            let approvalUrl = await container.paypalService.authorizePayment(req.session.userId, totalQuantity, totalCost, unitCost, returnUrl, cancelUrl);
            
            // Note: Can't do a redirect here due to CORS
            return res.status(200).json({
                approvalUrl
            });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/shop/galacticcredits/purchase/process', middleware.authenticate, async (req, res, next) => {
        try {
            const result = await container.paypalService.processPayment(req.query.paymentId, req.query.PayerID);

            return res.redirect(`${process.env.CLIENT_URL}/#/shop/paymentcomplete?credits=${result.galacticTokens}`);
        } catch (err) {
            console.error(err);

            return res.redirect(`${process.env.CLIENT_URL}/#/shop/paymentfailed`);
        }
    }, middleware.handleError);

    return router;

};
