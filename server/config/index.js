require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    sessionSecret: process.env.SESSION_SECRET,
    connectionString: process.env.CONNECTION_STRING
};
