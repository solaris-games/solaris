import { Config } from "../types/Config";

require('dotenv').config({path:__dirname + '/../.env'});

const config: Config = {
    port: process.env.PORT,
    sessionSecret: process.env.SESSION_SECRET,
    sessionSecureCookies: process.env.SESSION_SECURE_COOKIES == "true",
    connectionString: process.env.CONNECTION_STRING,
    serverUrl: process.env.SERVER_URL,
    clientUrl: process.env.CLIENT_URL,
    cacheEnabled: process.env.CACHE_ENABLED == "true",
    smtp: {
        enabled: process.env.SMTP_ENABLED == "true",
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        from: process.env.SMTP_FROM
    },
    google: {
        recaptcha: {
            enabled: process.env.GOOGLE_RECAPTCHA_ENABLED == "true",
            siteKey: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
            secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY
        }
    },
    paypal: {
        environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET
    },
    buymeacoffee: {
        accessToken: process.env.BUYMEACOFFEE_ACCESS_TOKEN
    }
};

export default config;