import express from "express";
import session from "express-session";
import compression from 'compression';
import rateLimit from "express-rate-limit";
import {Config} from '../config/types/Config';
import {DependencyContainer} from '../services/types/DependencyContainer';
import registerRoutes from './routes';
import {SingleRouter} from "./singleRoute";
import Middleware from "./middleware";
import {logger} from "../utils/logging";
import MongoStore from 'connect-mongo';

const router = express.Router();

const log = logger("express");

export default async (config: Config, app, container: DependencyContainer) => {
    const idempotencyKeyCache: Map<string, number> = new Map<string, number>();

    app.use(express.json({
        limit: '1500kb' // Note: This allows large custom galaxies to be uploaded.
    }));

    const sessionStore = MongoStore.create({
        mongoUrl: config.connectionString!,
        collectionName: 'sessions2', // use new sessions collection
    });

    // ---------------
    // Use sessions for tracking logins
    app.use(session({
        secret: config.sessionSecret!,
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: config.sessionSecureCookies, // Requires HTTPS
            maxAge: 1000 * 60 * 60 * 24 * 365 // 1 Year
        },
        store: sessionStore,
    }));

    // ---------------
    // Enable CORS
    app.use((req, res, next) => {
        if (config.corsUrls.includes(req.headers.origin)) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            res.header('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Methods', 'POST, PUT, PATCH, GET, DELETE, OPTIONS');
        }

        return next();
    });

    app.use(async (req, res, next) => {
        let idempotencyKey: string = req.header('idempotency-key')?.trim() ?? '';

        const now = Date.now();

        // Eliminate the expired entries.
        for (let key of idempotencyKeyCache.keys()) {

            let expiryTimestamp: number | undefined = idempotencyKeyCache.get(key);

            if (expiryTimestamp != null && typeof expiryTimestamp === 'number' && now > expiryTimestamp) {
                idempotencyKeyCache.delete(key);
            }
        }

        if (idempotencyKey !== '') {
            if (idempotencyKeyCache.get(idempotencyKey) != null) {
                res.sendStatus(409);
                return; // Duplicate request, abort!
            }
            else {
                idempotencyKeyCache.set(idempotencyKey, Date.now() + 300000); // Expire these after 5 minutes.
            }
        }

        return next();
    });

    // ---------------
    // Rate limiting
    app.set('trust proxy', 1); // NOTE: App is behind a proxy in production so this is required.
    
    const limiter = rateLimit({
        windowMs: 1000, // 1 second
        limit: 10 // limit each IP to X requests per windowMs
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

    const middleware = Middleware(container);
    const singleRouter = new SingleRouter(router);
    registerRoutes(singleRouter, container, middleware);

    app.use(router);

    app.use(middleware.core.handleError);

    log.info('Express intialized.');
    
    return {
        app,
        sessionStore,
    };
};
