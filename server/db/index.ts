import {logger} from "../utils/logging";

const mongoose = require('mongoose');

import EventModel from './models/Event';
import GameModel from './models/Game';
import GuildModel from './models/Guild';
import HistoryModel from './models/History';
import UserModel from './models/User';
import PaymentModel from './models/Payment';

const log = logger("Database");

export default async (config, options) => {

    async function unlockAgendaJobs(db) {
        try {
            const collection = await db.connection.db.collection('agendaJobs');
    
            const numUnlocked = await collection.updateMany({
                lockedAt: { $exists: true }
                // lastFinishedAt:{$exists:false} 
            }, {
                $unset: { 
                lockedAt : undefined,
                lastModifiedBy:undefined,
                    lastRunAt:undefined
                },
                $set: { nextRunAt:new Date() }
            });
    
            log.info(`Unlocked #${numUnlocked.modifiedCount} jobs.`);
        } catch (e) {
            log.error(e);
        }
    }
    
    async function syncIndexes() {
        log.info('Syncing indexes...');
        await EventModel.syncIndexes();
        await GameModel.syncIndexes();
        await GuildModel.syncIndexes();
        await HistoryModel.syncIndexes();
        await UserModel.syncIndexes();
        await PaymentModel.syncIndexes();
        // TODO ReportModel?
        log.info('Indexes synced.');
    }
    
    const dbConnection = mongoose.connection;

    dbConnection.on('error', log.error.bind(log.error, 'connection error:'));

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
        poolSize: options.poolSize
    });

    if (options.syncIndexes) {
        await syncIndexes();
    }

    if (options.unlockJobs) {
        await unlockAgendaJobs(db);
    }

    log.info('MongoDB intialized.');

    return db;
};
