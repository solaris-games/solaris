const express = require('express');
const router = express.Router();
const session = require('express-session');
const config = require('../config');

module.exports = async (app, io, container) => {
    app.use(require('body-parser').json());

    // Use sessions for tracking logins
    app.use(session({
        secret: config.sessionSecret,
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false } // Requires HTTPS
    }));

    // Enable CORS
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", config.clientUrl);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS');
        next();
    });

    // Register routes
    const game = require('../api/game')(router, io, container);
    const research = require('../api/game/research')(router, io, container);
    const trade = require('../api/game/trade')(router, io, container);
    const star = require('../api/game/star')(router, io, container);
    const carrier = require('../api/game/carrier')(router, io, container);
    const message = require('../api/game/message')(router, io, container);
    const auth = require('../api/auth')(router, io, container);
    const user = require('../api/user')(router, io, container);

    app.use('/api/auth', auth);
    app.use('/api/user', user);

    app.use('/api/game', game);
    app.use('/api/game', research);
    app.use('/api/game', trade);
    app.use('/api/game', star);
    app.use('/api/game', carrier);
    app.use('/api/game', message);

    return app;
};
