import {logger, onReady, setupLogging} from "../utils/logging";

const Agenda = require('agenda');
import config from '../config';
import mongooseLoader from '../db';
import containerLoader from '../services';

import GameTickJob from './gameTick';
import OfficialGamesCheckJob from './officialGamesCheck';
import CleanupGamesTimedOutJob from './cleanupGamesTimedOut';
import CleanupOldGameHistoryJob from './cleanupOldGameHistory';
import CleanupOldTutorialsJob from './cleanupOldTutorials';
import SendReviewRemindersJob from './sendReviewReminders';

let mongo;
Error.stackTraceLimit = 1000;

setupLogging();

const log = logger();

async function startup() {
    const container = containerLoader(config);

    mongo = await mongooseLoader(config, {
        unlockJobs: true,
        poolSize: 1
    });

    await container.discordService.initialize();
    container.notificationService.initialize();
    
    // ------------------------------
    // Jobs that run every time the server restarts.

    log.info('Unlock all games...');
    await container.gameService.lockAll(false);
    log.info('All games unlocked');

    // ------------------------------

    const gameTickJob = GameTickJob(container);
    const officialGamesCheckJob = OfficialGamesCheckJob(container);
    const cleanupGamesTimedOutJob = CleanupGamesTimedOutJob(container);
    const cleanupOldGameHistory = CleanupOldGameHistoryJob(container);
    const cleanupOldTutorials = CleanupOldTutorialsJob(container);
    const sendReviewReminders = SendReviewRemindersJob(container);

    // Set up the agenda instance.
    const agendajs = new Agenda()
        .database(config.connectionString, 'agendaJobs', {
            useUnifiedTopology: true,
        })
        .processEvery('10 seconds')
        .maxConcurrency(20);

    await agendajs._ready;

    // ------------------------------
    // Register jobs

    // Game tick
    agendajs.define('game-tick', {
        priority: 'high', concurrency: 1
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

    // Send review reminders
    agendajs.define('send-review-reminders', {
        priority: 'high', concurrency: 1
    },
    sendReviewReminders.handler);

    // ...

    // ------------------------------

    agendajs.start();

    // Start server jobs
    agendajs.every('10 seconds', 'game-tick');
    agendajs.every('1 minute', 'new-player-game-check');
    agendajs.every('1 hour', 'cleanup-games-timed-out');
    agendajs.every('1 day', 'cleanup-old-game-history');
    agendajs.every('1 day', 'cleanup-old-tutorials');
    agendajs.every('10 seconds', 'send-review-reminders'); // TODO: Every 10 seconds until we've gone through all backlogged users.

    process.on('SIGINT', async () => {
        log.info('Shutting down...');

        await agendajs.stop();

        await mongo.disconnect();

        log.info('Shutdown complete.');

        onReady(() => process.exit());
    });
}

startup().then(() => {
    log.info('Jobs started.');
});

export {};
