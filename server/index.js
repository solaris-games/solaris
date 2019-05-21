const env = require('dotenv').config();

const db = require('./db/connection');

const express = require('express');
const app = express();

const port = process.env.PORT;

const user = require('./api/user');
const game = require('./api/game');

app.use('/user', user);
app.use('/game', game);

db.connect()
    .then(() => {
        app.listen(port, () => console.log(`API server listening on ${port}.`));
    })
    .catch(err => {
        console.error(err);
    });
