require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    sessionSecret: process.env.SESSION_SECRET,
    sessionSecureCookies: process.env.SESSION_SECURE_COOKIES == "true",
    connectionString: process.env.CONNECTION_STRING,
    clientUrl: process.env.CLIENT_URL,
    smtp: {
        enabled: process.env.SMTP_ENABLED == "true",
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        from: process.env.SMTP_FROM
    }
};
