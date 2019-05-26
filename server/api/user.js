const express = require('express');
const router = express.Router();
const middleware = require('./middleware');

const User = require('../data/db/models/User');
const bcrypt = require('bcrypt');

router.post('/', (req, res, next) => {
    let errors = [];

    if (!req.body.email) {
        errors.push('Email is a required field');
    }

    if (!req.body.username) {
        errors.push('Username is a required field');
    }

    if (!req.body.password) {
        errors.push('Password is a required field');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    User.findOne({
        username: req.body.username
    })
    .exec((err, user) => {
        if (err) {
            return next(err);
        }

        if (user) {
            return res.status(400).json({
                errors: [
                    'Username already exists.'
                ]
            });
        }

        const newUser = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });
    
        bcrypt.hash(newUser.password, 10, (err, hash) => {
            if (err) {
                return next(err);
            }
    
            newUser.password = hash;
    
            newUser.save((err, doc) => {
                if (err) {
                    return next(err)
                } else {
                    // Save the user ID to the session to log the user in.
                    req.session.userId = doc._id;

                    return res.sendStatus(201);
                }
            });
        });
    });
});

router.get('/me', middleware.authenticate, (req, res, next) => {
    User.findById(req.session.userId, (err, user) => {
        if (err) {
            return next(err);
        }

        // Remove any props we don't want to send back.
        user = user.toObject();
        
        delete user.password;
        delete user.premiumEndDate;

        return res.status(200).json(user);
    });
});

router.post('/changeEmailPreference', middleware.authenticate, (req, res, next) => {
    User.findById(req.session.userId, (err, user) => {
        if (err) {
            return next(err);
        }

        user.emailEnabled = req.body.enabled;

        user.save((err, doc) => {
            if (err) {
                return next(err);
            }

            return res.sendStatus(200);
        });
    });
});

router.post('/changeEmailAddress', middleware.authenticate, (req, res, next) => {
    let errors = [];

    if (!req.body.email) {
        errors.push('Email is a required field');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    User.findById(req.session.userId, (err, user) => {
        if (err) {
            return next(err);
        }

        user.email = req.body.email;

        user.save((err, doc) => {
            if (err) {
                return next(err);
            }

            return res.sendStatus(200);
        });
    });
});

router.post('/changePassword', middleware.authenticate, (req, res, next) => {
    let errors = [];

    if (!req.body.currentPassword) {
        errors.push('Current password is a required field');
    }

    if (!req.body.newPassword) {
        errors.push('New password is a required field');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    User.findById(req.session.userId, (err, user) => {
        if (err) {
            return next(err);
        }

        // Make sure the current password matches.
        bcrypt.compare(req.body.currentPassword, user.password, (err, result) => {
            if (result) {
                // Update the current password to the new password.
                bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
                    if (err) {
                        return next(err);
                    }
            
                    user.password = hash;
            
                    user.save((err, doc) => {
                        if (err) {
                            return next(err)
                        } else {
                            return res.sendStatus(201);
                        }
                    });
                });
            } else {
                return res.status(400).json({
                    errors: [
                        'The current password is incorrect.'
                    ]
                });
            }
        });
    });
});

module.exports = router;
