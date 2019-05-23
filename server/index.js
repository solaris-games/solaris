const env = require('dotenv').config();

const db = require('./data/db/connection');

const express = require('express');
const app = express();

const port = process.env.PORT;

const user = require('./api/user');
const game = require('./api/game');

app.use(require('body-parser').json());

app.use('/api/user', user);
app.use('/api/game', game);

db.connect()
    .then(() => {
        app.listen(port, () => console.log(`API server listening on ${port}.`));
    })
    .catch(err => {
        console.error(err);
    });
