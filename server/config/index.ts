import {Config, LoggingType} from "./types/Config";

import dotenv from "dotenv";

// load configurable file so that we can load docker secrets
const envFiles = process.env.ENV_FILE
    ? [process.env.ENV_FILE, ".env"]
    : [".env"];

dotenv.config({ path: envFiles });

const config: Config = {
    port: process.env.PORT,
    sessionSecret: process.env.SESSION_SECRET,
    sessionSecureCookies: process.env.SESSION_SECURE_COOKIES == "true",
    connectionString: process.env.CONNECTION_STRING,
    serverUrl: process.env.SERVER_URL,
    clientUrl: process.env.CLIENT_URL,
    corsUrls: process.env.CORS_URLS?.split(",") || [ process.env.CLIENT_URL || "https://solaris.games" ],
    cacheEnabled: process.env.CACHE_ENABLED == "true",
    logging: process.env.LOGGING_TYPE as LoggingType,
    logLevel: process.env.LOGGING_LEVEL,
    smtp: {
        enabled: process.env.SMTP_ENABLED == "true",
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        from: process.env.SMTP_FROM,
        username: process.env.SMTP_USERNAME,
        password: process.env.SMTP_PASSWORD,
    },
    paypal: {
        environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET
    },
    discord: {
        serverId: process.env.DISCORD_SERVERID,
        clientId: process.env.DISCORD_CLIENTID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        oauthRedirectUri: process.env.DISCORD_OAUTH_REDIRECT_URI,
        botToken: process.env.DISCORD_BOT_TOKEN
    },
    frontend: {
        appSocketsHost: process.env.FRONTEND_APP_SOCKETS_HOST || 'api.solaris.games',
        appApiHost: process.env.FRONTEND_APP_API_HOST || 'https://api.solaris.games',
        appDocumentationUrl: process.env.FRONTEND_APP_DOCUMENTATION_URL || 'https://solaris-games.github.io/solaris-docs/',
        appProviderInformationUrl: process.env.FRONTEND_APP_PROVIDER_INFORMATION_URL || '',
        appDiscordOAuthUrl: process.env.FRONTEND_APP_DISCORD_OAUTH_URL || '',
    }
};

export default config;