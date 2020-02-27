const express = require('express');
const router = express.Router();
const middleware = require('./middleware');
const userHelper = require('../services/user');

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

    userHelper.userExists(req.body.username, (err, exists) => {
        if (err) {
            return next(err);
        }

        if (exists) {
            return res.status(400).json({
                errors: [
                    'Username already exists.'
                ]
            });
        }

        userHelper.create({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        }, (err, doc) => {
            if (err) {
                return next(err);
            }

            // Save the user ID to the session to log the user in.
            req.session.userId = doc.id;

            return res.status(201).json(doc);
        });
    });
});

router.get('/', middleware.authenticate, (req, res, next) => {
    userHelper.getMe(req.session.userId, (err, user) => {
        if (err) {
            return next(err);
        }

        return res.status(200).json(user);
    });
});

router.get('/:id', middleware.authenticate, (req, res, next) => {
    userHelper.getById(req.params.id, (err, user) => {
        if (err) {
            return next(err);
        }

        return res.status(200).json(user);
    });
});

router.post('/changeEmailPreference', middleware.authenticate, (req, res, next) => {
    userHelper.updateEmailPreference(req.session.userId, req.body.enabled, (err) => {
        if (err) {
            return next(err);
        }

        return res.sendStatus(200);
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

    userHelper.updateEmailAddress(req.session.userId, req.body.email, (err) => {
        if (err) {
            return next(err);
        }

        return res.sendStatus(200);
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

    userHelper.updatePassword(
        req.session.userId, 
        req.body.currentPassword,
        req.body.newPassword,
        (err) => {
            if (err) {
                return next(err);
            }

            return res.sendStatus(200);
        });
});

module.exports = router;
