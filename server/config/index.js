require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    sessionSecret: process.env.SESSION_SECRET,
    sessionSecureCookies: process.env.SESSION_SECURE_COOKIES == "true",
    connectionString: process.env.CONNECTION_STRING,
    clientUrl: process.env.CLIENT_URL
};
