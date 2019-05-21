const mongoose = require('mongoose');

const dbConnection = mongoose.connection;

dbConnection.on('error', console.error.bind(console, 'connection error:'));

dbConnection.once('open', () => {
    console.log(`Connected to database.`);
});

module.exports = {
    connect: (options) => {
        options = options || {};
        options.connectionString = options.connectionString || process.env.CONNECTION_STRING;

        console.log(`Connecting to database: ${options.connectionString}`);

        return mongoose.connect(options.connectionString, {
            useNewUrlParser: true,
            useCreateIndex: true,
            keepAlive: true
        });        
    }
};
