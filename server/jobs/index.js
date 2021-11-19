const Agenda = require('agenda');
const config = require('../config');
const mongooseLoader = require('../loaders/mongoose');
const containerLoader = require('../loaders/container');

let mongo;

async function startup() {
    const container = containerLoader(config, null);

    mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1
    });
    
    console.log('MongoDB Intialized');

    // ------------------------------
    // Jobs that run every time the server restarts.

    console.log('Unlock all games...');
    await container.gameService.lockAll(false);
    console.log('All games unlocked');

    // console.log('Recalculating all ELO ratings...');
    // await container.ratingService.recalculateAllEloRatings(false);
    // console.log('ELO ratings recalculated');

    // ------------------------------

    const gameTickJob = require('./gameTick')(container);
    const officialGamesCheckJob = require('./officialGamesCheck')(container);
    const cleanupGamesTimedOutJob = require('./cleanupGamesTimedOut')(container);
    const cleanupOldGameHistory = require('./cleanupOldGameHistory')(container);
    const cleanupOldTutorials = require('./cleanupOldTutorials')(container);

    // Set up the agenda instance.
    const agendajs = new Agenda()
        .database(config.connectionString)
        .processEvery('10 seconds')
        .maxConcurrency(20);

    await agendajs._ready;

    // ------------------------------
    // Register jobs

    // Game tick
    agendajs.define('game-tick', {
        priority: 'high', concurrency: 10
    },
    gameTickJob.handler); // reference to the handler, but not executing it! 

    // New player game check
    agendajs.define('new-player-game-check', {
        priority: 'high', concurrency: 1
    },
    officialGamesCheckJob.handler);

    // Cleanup old games that reached timeout
    agendajs.define('cleanup-games-timed-out', {
        priority: 'high', concurrency: 1
    },
    cleanupGamesTimedOutJob.handler);

    // Cleanup old game history
    agendajs.define('cleanup-old-game-history', {
        priority: 'high', concurrency: 1
    },
    cleanupOldGameHistory.handler);

    // Cleanup old tutorials
    agendajs.define('cleanup-old-tutorials', {
        priority: 'high', concurrency: 1
    },
    cleanupOldTutorials.handler);

    // ...

    // ------------------------------

    agendajs.start();

    // Start server jobs
    agendajs.every('10 seconds', 'game-tick');
    agendajs.every('1 minute', 'new-player-game-check');
    agendajs.every('1 hour', 'cleanup-games-timed-out');
    agendajs.every('1 day', 'cleanup-old-game-history');
    agendajs.every('1 day', 'cleanup-old-tutorials');
}

process.on('SIGINT', async () => {
    console.log('Shutting down...');

    await mongo.disconnect();

    console.log('Shutdown complete.');

    process.exit();
});

startup().then(() => {
    console.log('Jobs started.');
});
