const express = require('express');
const router = express.Router();

const User = require('../data/db/models/User');
const bcrypt = require('bcrypt');

router.post('/', (req, res, next) => {
    let errors = [];

    if (!req.body.email) {
        errors.push({
            field: 'email',
            message: 'Email is a required field'
        });
    }

    if (!req.body.username) {
        errors.push({
            field: 'username',
            message: 'Username is a required field'
        });
    }

    if (!req.body.password) {
        errors.push({
            field: 'password',
            message: 'Password is a required field'
        });
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password) {
        const user = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        bcrypt.hash(user.password, 10, (err, hash) => {
            if (err) {
                return next(err);
            }

            user.password = hash;

            user.save((err, user) => {
                if (err) {
                    return next(err)
                } else {
                    return res.sendStatus(201);
                }
            });
        });
    }
});

module.exports = router;
