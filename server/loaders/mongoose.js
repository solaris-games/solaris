const mongoose = require('mongoose');

const EventModel = require('../models/Event');
const GameModel = require('../models/Game');
const GuildModel = require('../models/Guild');
const HistoryModel = require('../models/History');
const UserModel = require('../models/User');

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
    console.log('Indexes synced.');
}

module.exports = async (config, options) => {
    const dbConnection = mongoose.connection;

    dbConnection.on('error', console.error.bind(console, 'connection error:'));

    options = options || {};
    options.connectionString = options.connectionString || config.connectionString;
    options.syncIndexes = options.syncIndexes == null ? false : options.syncIndexes;

    console.log(`Connecting to database: ${options.connectionString}`);

    const db = await mongoose.connect(options.connectionString, {
        useNewUrlParser: true,
        useCreateIndex: true,
        keepAlive: true,
        poolSize: process.env.CONNECTION_POOL_SIZE || 5
    });

    await unlockAgendaJobs(db);

    if (options.syncIndexes) {
        await syncIndexes();
    }

    return db;
};
