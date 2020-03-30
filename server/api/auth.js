const express = require('express');
const router = express.Router();
const middleware = require('./middleware');
const container = require('./container');

router.post('/login', async (req, res, next) => {
    let errors = [];

    if (!req.body.username) {
        errors.push('Username is a required field');
    }

    if (!req.body.password) {
        errors.push('Password is a required field');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    try {
        let userId = await container.authService.login(req.body.username, req.body.password);

        // Store the user id in the session.
        req.session.userId = userId;
        
        return res.status(200).json({id: userId});
    } catch (err) {
        // TODO: Need to implement some decent error handling here,
        // the problem is that the login function above throws errors
        // as part of the logic which should not be the case. We should
        // never throw errors for logic.
        return next(err);
    }
}, middleware.handleError);

router.post('/logout', (req, res, next) => {
    if (req.session) {
        // Delete the session object.
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }

            return res.sendStatus(200);
        });
    } else {
        return res.sendStatus(200);
    }
});

module.exports = router;
