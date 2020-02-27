const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/User');

router.post('/login', (req, res, next) => {
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

    // Try to find the user by username
    User.findOne({
        username: req.body.username
    })
    .exec((err, user) => {
        if (err) {
            return next(err);
        } else if (!user) {
            return res.status(400).json({
                errors: [
                    'The username or password is incorrect.'
                ]
            });
        }

        // Compare the passwords and if they match then the user is authenticated.
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                // Store the user id in the session.
                req.session.userId = user._id;

                return res.status(200).json({id: user._id});
            } else {
                return res.status(400).json({
                    errors: [
                        'The username or password is incorrect.'
                    ]
                });
            }
        });
    });
});

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
