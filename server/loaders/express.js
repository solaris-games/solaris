const session = require('express-session');
const config = require('../config')

module.exports = async (app) => {
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
        next();
    });

    // Register routes
    const auth = require('../api/auth');
    const user = require('../api/user');
    const game = require('../api/game');
    const player = require('../api/player');

    app.use('/api/auth', auth);
    app.use('/api/user', user);
    app.use('/api/game', game);
    app.use('/api/player', player);

    return app;
};
