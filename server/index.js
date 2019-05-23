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
    saveUninitialized: true,
    cookie: { secure: false } // Requires HTTPS
}));

// Enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

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
