import {logger} from "../utils/logging";

const mongoose = require('mongoose');

import EventModel from './models/Event';
import GameModel from './models/Game';
import GuildModel from './models/Guild';
import HistoryModel from './models/History';
import UserModel from './models/User';
import PaymentModel from './models/Payment';
import ReportModel from './models/Report';
import StatsSliceModel from './models/StatsSlice';

const log = logger("Database");

export default async (config, options) => {
    async function syncIndexes() {
        log.info('Syncing indexes...');
        await EventModel.syncIndexes();
        await GameModel.syncIndexes();
        await GuildModel.syncIndexes();
        await HistoryModel.syncIndexes();
        await UserModel.syncIndexes();
        await PaymentModel.syncIndexes();
        await ReportModel.syncIndexes();
        await StatsSliceModel.syncIndexes();
        log.info('Indexes synced.');
    }
    
    const dbConnection = mongoose.connection;

    dbConnection.on('error', (e) => {
        log.error(e, 'connection error:')
    });
    dbConnection.on('connected', () => {
        log.info(`Successfully connected to MongoDB`);
    });
    dbConnection.on('reconnected', () => {
        log.info(`Successfully reconnected to MongoDB`);
    });
    dbConnection.on('connecting', () => {
        log.info('MongoDB connecting...');
    });
    dbConnection.once('open', () => {
        log.info('MongoDB dbConnection opened');
    });
    dbConnection.on('disconnecting', () => {
        log.info('MongoDB disconnecting...');
    });
    dbConnection.on('disconnected', () => {
        log.error('MongoDB disconnected');
    });
    dbConnection.on('close', () => {
        log.info('MongoDB dbConnection closed');
    });

    options = options || {};
    options.connectionString = options.connectionString || config.connectionString;
    options.syncIndexes = options.syncIndexes == null ? false : options.syncIndexes;
    options.unlockJobs = options.unlockJobs == null ? false : options.unlockJobs;
    options.poolSize = options.poolSize || 5;

    log.info(`Connecting to database: ${options.connectionString}`);

    const db = await mongoose.connect(options.connectionString, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        keepAlive: true,
        poolSize: options.poolSize,
        socketTimeoutMS: 120000,
    });

    db.connection.on('error', err => {
        log.error(err, 'MongoDB connection error:');
    });

    if (options.syncIndexes) {
        await syncIndexes();
    }

    log.info('MongoDB intialized.');

    return db;
};
