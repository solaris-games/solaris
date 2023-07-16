const mongoose = require('mongoose');

import EventModel from './models/Event';
import GameModel from './models/Game';
import GuildModel from './models/Guild';
import HistoryModel from './models/History';
import UserModel from './models/User';
import PaymentModel from './models/Payment';

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
    
            console.log(`Unlocked #${numUnlocked.modifiedCount} jobs.`);
        } catch (e) {
            console.error(e);
        }
    }
    
    async function syncIndexes() {
        console.log('Syncing indexes...');
        await EventModel.syncIndexes();
        await GameModel.syncIndexes();
        await GuildModel.syncIndexes();
        await HistoryModel.syncIndexes();
        await UserModel.syncIndexes();
        await PaymentModel.syncIndexes();
        // TODO ReportModel?
        console.log('Indexes synced.');
    }
    
    const dbConnection = mongoose.connection;

    dbConnection.on('error', console.error.bind(console, 'connection error:'));

    options = options || {};
    options.connectionString = options.connectionString || config.connectionString;
    options.syncIndexes = options.syncIndexes == null ? false : options.syncIndexes;
    options.unlockJobs = options.unlockJobs == null ? false : options.unlockJobs;
    options.poolSize = options.poolSize || 5;

    console.log(`Connecting to database: ${options.connectionString}`);

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

    console.log('MongoDB intialized.');

    return db;
};
