const mongoose = require('mongoose');
const config = require('../config');

module.exports = (options) => {
    const dbConnection = mongoose.connection;

    dbConnection.on('error', console.error.bind(console, 'connection error:'));

    options = options || {};
    options.connectionString = options.connectionString || config.connectionString;

    console.log(`Connecting to database: ${options.connectionString}`);

    return mongoose.connect(options.connectionString, {
        useNewUrlParser: true,
        useCreateIndex: true,
        keepAlive: true
    });
};
