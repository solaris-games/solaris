const express = require('express');
const router = express.Router();
const session = require('express-session');
const compression = require('compression');
const rateLimit = require("express-rate-limit");
const MongoDBStore = require('connect-mongodb-session')(session);

import registerRoutes from './routes';
import { DependencyContainer } from '../services/types/DependencyContainer';
import { Config } from '../config/types/Config';

export default async (config: Config, app, container: DependencyContainer) => {

    app.use(require('body-parser').json({
        limit: '1000kb' // Note: This allows large custom galaxies to be uploaded.
    }));

    // ---------------
    // Set up MongoDB session store
    let store = new MongoDBStore({
        uri: config.connectionString,
        collection: 'sessions'
    });

    // Catch session store errors
    store.on('error', function(err) {
        console.error(err);
    });

    // ---------------
    // Use sessions for tracking logins
    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: config.sessionSecureCookies, // Requires HTTPS
            maxAge: 1000 * 60 * 60 * 24 * 365 // 1 Year
        },
        store
    }));

    // ---------------
    // Enable CORS
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", config.clientUrl);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'POST, PUT, PATCH, GET, DELETE, OPTIONS');
        next();
    });

    // ---------------
    // Rate limiting
    app.set('trust proxy', 1); // NOTE: App is behind a proxy in production so this is required.
    
    const limiter = rateLimit({
        windowMs: 1000, // 1 second
        max: 10 // limit each IP to X requests per windowMs
    });
    
    //  apply to all requests
    app.use(limiter);

    // compress all responses
    app.use(compression({
        threshold: 0,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                // don't compress responses if this request header is present
                return false;
            }
        
            // fallback to standard compression
            return compression.filter(req, res);
        }
    }));

    // ---------------
    // Register routes

    registerRoutes(router, container);

    app.use(router);

    console.log('Express intialized.');
    
    return app;
};
