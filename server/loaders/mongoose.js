const mongoose = require('mongoose');
const config = require('../config');

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

module.exports = async (options) => {
    const dbConnection = mongoose.connection;

    dbConnection.on('error', console.error.bind(console, 'connection error:'));

    options = options || {};
    options.connectionString = options.connectionString || config.connectionString;

    console.log(`Connecting to database: ${options.connectionString}`);

    const db = await mongoose.connect(options.connectionString, {
        useNewUrlParser: true,
        useCreateIndex: true,
        keepAlive: true
    });

    await unlockAgendaJobs(db);

    return db;
};
