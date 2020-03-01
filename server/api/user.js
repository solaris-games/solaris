const express = require('express');
const router = express.Router();
const middleware = require('./middleware');
const UserService = require('../services/user');

const userService = new UserService();

router.post('/', async (req, res, next) => {
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

    try {
        let exists = await userService.userExists(req.body.username);

        if (exists) {
            return res.status(400).json({
                errors: [
                    'Username already exists.'
                ]
            });
        }
        
        let userId = await userService.create({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        // Save the user ID to the session to log the user in.
        req.session.userId = userId;

        return res.status(201).json(userId);
    } catch (err) {
        return next(err);
    }
});

router.get('/', middleware.authenticate, async (req, res, next) => {
    try {
        let user = await userService.getMe(req.session.userId);

        return res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', middleware.authenticate, async (req, res, next) => {
    try {
        let user = await userService.getById(req.params.id);

        return res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
});

router.post('/changeEmailPreference', middleware.authenticate, async (req, res, next) => {
    try {
        userService.updateEmailPreference(req.session.userId, req.body.enabled);
        
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.post('/changeEmailAddress', middleware.authenticate, async (req, res, next) => {
    let errors = [];

    if (!req.body.email) {
        errors.push('Email is a required field');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    try {
        userService.updateEmailAddress(req.session.userId, req.body.email);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.post('/changePassword', middleware.authenticate, async (req, res, next) => {
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

    try {
        await userService.updatePassword(
            req.session.userId, 
            req.body.currentPassword,
            req.body.newPassword);
            
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
