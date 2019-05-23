const env = require('dotenv').config();

const db = require('./data/db/connection');

const express = require('express');
const session = require('express-session');
const app = express();

const port = process.env.PORT;

app.use(require('body-parser').json());

// Use sessions for tracking logins
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    // cookie: { secure: true } // Requires HTTS
}));

// Register routes
const auth = require('./api/auth');
const user = require('./api/user');
const game = require('./api/game');

app.use('/api/auth', auth);
app.use('/api/user', user);
app.use('/api/game', game);

db.connect()
    .then(() => {
        app.listen(port, () => console.log(`API server listening on ${port}.`));
    })
    .catch(err => {
        console.error(err);
    });
