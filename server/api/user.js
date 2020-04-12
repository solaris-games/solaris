const express = require('express');
const router = express.Router();
const middleware = require('./middleware');
const container = require('./container');
const ValidationError = require('../errors/validation');

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
        throw new ValidationError(errors);
    }

    try {
        let exists = await container.userService.userExists(req.body.username);

        if (exists) {
            return res.status(400).json({
                errors: [
                    'Username already exists.'
                ]
            });
        }
        
        let userId = await container.userService.create({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        return res.status(201).json({ id: userId });
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/', middleware.authenticate, async (req, res, next) => {
    try {
        let user = await container.userService.getMe(req.session.userId);

        return res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/:id', middleware.authenticate, async (req, res, next) => {
    try {
        let user = await container.userService.getById(req.params.id);

        return res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.post('/changeEmailPreference', middleware.authenticate, async (req, res, next) => {
    try {
        await container.userService.updateEmailPreference(req.session.userId, req.body.enabled);
        
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.post('/changeEmailAddress', middleware.authenticate, async (req, res, next) => {
    let errors = [];

    if (!req.body.email) {
        errors.push('Email is a required field');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    try {
        await container.userService.updateEmailAddress(req.session.userId, req.body.email);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.post('/changePassword', middleware.authenticate, async (req, res, next) => {
    let errors = [];

    if (!req.body.currentPassword) {
        errors.push('Current password is a required field');
    }

    if (!req.body.newPassword) {
        errors.push('New password is a required field');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    try {
        await container.userService.updatePassword(
            req.session.userId, 
            req.body.currentPassword,
            req.body.newPassword);
            
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

module.exports = router;
